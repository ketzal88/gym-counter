---
description: Run the checks a CI pipeline should run (type-check + lint + test + indexes JSON), all-or-nothing report
---

Run every check in order, capture each exit code, and report PASS/FAIL for ALL of them
at the end (do not stop at the first failure — mirror CI's `if: always()` behaviour).

Use the Bash tool:

```bash
npx tsc --noEmit 2>&1 | tail -30;            echo "--- type-check exit: ${PIPESTATUS[0]}"
npx next lint 2>&1 | tail -30;               echo "--- lint exit: ${PIPESTATUS[0]}"
npx vitest run 2>&1 | tail -20;              echo "--- test exit: ${PIPESTATUS[0]}"
python -c "import json; json.load(open('firestore.indexes.json')); print('indexes.json OK')"; echo "--- indexes exit: $?"
```

Then report:
- ✅ PASS / ❌ FAIL per step.
- On failure: the full output of the failing step + the concrete fix.
- If all pass: "CI-ready — safe to push".

Note: gymcounter has no `.github/workflows/` yet — this command IS the spec for one.
Keep these four checks in sync with any future GitHub Actions workflow.
