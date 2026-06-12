#!/usr/bin/env python3
"""Pre-commit secret scanner for gymcounter.

Scans the staged git diff for likely secret leaks and exits non-zero to block
the commit. Designed to be invoked from the `.claude/settings.json` PreToolUse
hook (matcher "Bash") only when the command is a `git commit`.

Pure Python (no bash dependency) so it works the same on Windows and *nix.

Exit codes:
  0  -> no secrets found (allow the commit)
  2  -> a likely secret was found (block the commit; stderr is shown to Claude)
"""
import re
import subprocess
import sys

# Patterns tuned for the gymcounter stack (Firebase + Stripe). Each is meant to
# match REAL credentials, not the `...` placeholders in .env.local.example.
PATTERNS = [
    (re.compile(r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"), "private key (PEM)"),
    (re.compile(r"\bsk_live_[A-Za-z0-9]{16,}"), "Stripe live secret key"),
    (re.compile(r"\bsk_test_[A-Za-z0-9]{16,}"), "Stripe test secret key"),
    (re.compile(r"\brk_(?:live|test)_[A-Za-z0-9]{16,}"), "Stripe restricted key"),
    (re.compile(r"\bwhsec_[A-Za-z0-9]{16,}"), "Stripe webhook secret"),
    (re.compile(r"\bAIza[0-9A-Za-z_\-]{35}"), "Google/Firebase API key"),
    (re.compile(r"\bxox[baprs]-[0-9A-Za-z\-]{10,}"), "Slack token"),
    (re.compile(
        r"(?i)(api[_-]?key|access[_-]?token|client[_-]?secret|refresh[_-]?token|private[_-]?key)"
        r"\s*[:=]\s*['\"][A-Za-z0-9_\-]{32,}['\"]"
    ), "generic secret assignment"),
]

# Files we never scan: this script, markdown docs, and env *example* templates.
SKIP_SUFFIXES = (".md", ".example", ".sample")
SKIP_NAMES = ("scripts/check-no-secrets.py", ".env.example")


def staged_files():
    out = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True,
    )
    return [f for f in out.stdout.splitlines() if f.strip()]


def added_lines(path):
    """Return only the lines ADDED in the staged diff for `path`."""
    out = subprocess.run(
        ["git", "diff", "--cached", "--unified=0", "--", path],
        capture_output=True, text=True, errors="replace",
    )
    lines = []
    for line in out.stdout.splitlines():
        if line.startswith("+") and not line.startswith("+++"):
            lines.append(line[1:])
    return lines


def main():
    findings = []
    for path in staged_files():
        norm = path.replace("\\", "/")
        if norm in SKIP_NAMES or norm.endswith(SKIP_SUFFIXES):
            continue
        for line in added_lines(path):
            # NEXT_PUBLIC_* values are public by design (shipped to the browser).
            if "NEXT_PUBLIC_" in line:
                continue
            for rx, label in PATTERNS:
                if rx.search(line):
                    findings.append((path, label))
                    break

    if findings:
        sys.stderr.write("\nBLOCKED: possible secret(s) in staged changes:\n")
        for path, label in findings:
            sys.stderr.write(f"  - {path}: {label}\n")
        sys.stderr.write(
            "\nMove the value to .env.local (gitignored). If this is a false "
            "positive, the user must approve committing with --no-verify.\n"
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
