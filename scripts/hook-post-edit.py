#!/usr/bin/env python3
"""Advisory PostToolUse hook for gymcounter (Edit|Write).

Reads the hook JSON from stdin and prints non-blocking reminders to stderr based
on which file was just edited. Always exits 0 — these are nudges, not gates.

Wired from `.claude/settings.json` PostToolUse(Edit|Write).
"""
import json
import re
import sys


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    path = (data.get("tool_input", {}).get("file_path", "") or "").replace("\\", "/")
    if not path:
        sys.exit(0)

    msgs = []

    # i18n parity: typeof-dict (TranslationDict = typeof es) won't flag a key that
    # exists in only one locale, so remind to mirror the sibling file.
    if path.endswith("src/locales/en.ts") or path.endswith("src/locales/es.ts"):
        msgs.append(
            "i18n: actualiza el locale hermano (en.ts/es.ts). 'typeof es' no detecta "
            "una key que falte o sobre en un solo lado."
        )

    # Stripe webhook idempotency.
    if path.endswith("src/app/api/webhooks/stripe/route.ts"):
        msgs.append(
            "Stripe webhook: verifica la firma primero y deduplica por event.id "
            "(idempotencia) antes de mutar Firestore o notificar a Slack."
        )

    # Firestore rules / indexes deploy reminders.
    if path.endswith("firestore.rules"):
        msgs.append(
            "Reglas Firestore: deploy con `firebase deploy --only firestore:rules` "
            "y re-testea el ownership por uid."
        )
    if path.endswith("firestore.indexes.json"):
        msgs.append(
            "Indices Firestore: agrega el indice ANTES de shippear un where+orderBy "
            "nuevo; la query falla silenciosamente si falta."
        )

    # 'use client' guard: a .tsx using React hooks without the directive breaks the
    # Vercel build when imported by a Server Component. API routes are exempt.
    if path.endswith(".tsx") and "/src/app/api/" not in path:
        try:
            content = open(path, encoding="utf-8", errors="replace").read()
        except Exception:
            content = ""
        uses_hooks = re.search(
            r"\b(useState|useEffect|useRef|useCallback|useMemo|useContext|useReducer)\s*[(<]",
            content,
        )
        has_directive = re.search(r"""['"]use client['"]""", content)
        if uses_hooks and not has_directive:
            msgs.append(
                "AVISO: este componente usa hooks de React sin 'use client' — "
                "fallara el build de Vercel si lo importa un Server Component."
            )

    if msgs:
        sys.stderr.write("\n".join("→ " + m for m in msgs) + "\n")

    sys.exit(0)


if __name__ == "__main__":
    main()
