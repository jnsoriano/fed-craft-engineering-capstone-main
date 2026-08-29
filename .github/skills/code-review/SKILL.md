---
name: code-review
description: Review the current branch diff against main for correctness, security, and quality issues. Use before raising a PR or when asked to review code changes.
allowed-tools: Bash(git diff *) Read
---

# /code-review

Review the current branch diff against `main` (or the base branch) for correctness, quality, and security.

## Usage

```
/code-review           # Review and report findings
/code-review --fix     # Review and apply safe fixes automatically
```

## What to review

### Bugs and correctness
- Logic errors, off-by-one errors, incorrect conditionals
- Unhandled null/undefined/error cases
- Race conditions or missing locks
- Incorrect use of async/await (unhandled promises, missing awaits)

### Security (flag as BLOCKER)
- Injection vulnerabilities (SQL, command, LDAP, XPath)
- XSS (unsanitised user input rendered as HTML)
- Broken authentication or authorisation
- Sensitive data exposure (logging PII, secrets in code)
- Insecure dependencies (known CVEs in new packages added)

### Code quality
- Functions doing more than one thing
- Duplicated logic that should be extracted
- Poor naming that requires a comment to understand
- Unnecessary complexity

### Test coverage
- New code paths with no tests
- Tests that only cover the happy path
- Tests that mock so much they test nothing real

## Output format

```
## BLOCKERS (must fix before merge)
**<file>:<line>** — <description and recommended fix>

## WARNINGS (should fix)
**<file>:<line>** — <description and recommended fix>

## NOTES (consider)
**<file>:<line>** — <description>
```

End with: `N blockers, N warnings, N notes.`

If `--fix` is passed, apply all BLOCKER and WARNING fixes, then re-run the review to confirm they are resolved.
