---
name: commit
description: Generate and apply a standards-compliant commit message for staged changes. Use when the developer is ready to commit.
allowed-tools: Bash(git *)
disable-model-invocation: true
---

# /commit

Generate and apply a standards-compliant commit for the current staged changes.

## Steps

1. Run `git diff --cached` to read exactly what is staged.
2. Run `git log --oneline -10` to match the project's existing commit style.
3. Draft a commit message:
   - Subject line: imperative mood, under 72 characters (`Add X`, `Fix Y`, `Remove Z`)
   - If changes span multiple concerns, add a bullet body (blank line after subject, then `- item` lines)
   - Reference ticket/issue number if present in the branch name or user's message
   - Describe why the change exists, not what the code does
4. Show the drafted message and ask for approval before committing.
5. On approval, run `git commit -m "..."` with the approved message.

## Do not commit if

- Any test is failing (investigate first)
- There are unresolved merge conflicts
- Secrets or credentials appear in the diff
- Staged files include anything not intended (check `git status`)

## After committing

Confirm the commit hash and subject line. Do not push unless explicitly asked.
