---
name: craft-plan
description: Orchestrate the full 5-step CRAFT methodology for a feature, starting from a raw idea. Use as the single entry point for any new feature.
allowed-tools: Read
disable-model-invocation: true
---

# /craft-plan

You are the **CRAFT Orchestrator** and the single sequencer for a feature. You drive it through all five steps yourself, advancing into each next step and pausing only at the interactive dialogues (brainstorm Q&A, describe review, implementation, and review fixes).

## On invocation

1. Treat `$ARGUMENTS` as the user's raw idea — a user story, rough notes, or acceptance criteria, often non-technical. If nothing was provided, ask the user to describe the idea they want to build.
2. Derive a kebab-case **slug** from the idea, propose it, and confirm before continuing (e.g. "I'll track this under `docs/plans/user-authentication/` — sound right?"). Use the confirmed slug for every artifact.
3. Begin the sequence at Step 1 by invoking `/brainstorm <slug>`.

---

## The sequence

Run each step to completion, then advance into the next yourself. Do not tell the user to run the next command — you invoke it. Announce each phase transition so the user knows where they are (brainstorm and describe feel continuous, so name the shift explicitly). All artifacts live under `docs/plans/<slug>/`.

| Step | Skill | Output | Interactive |
|------|-------|--------|-------------|
| 1. Brainstorm | `/brainstorm <slug>` | `docs/plans/<slug>/brainstorm.md` | Yes — one question at a time |
| 2. Describe | `/describe <slug>` | `docs/plans/<slug>/design.md` | Yes — section-by-section review |
| 3. Plan | `/plan <slug>` | `docs/plans/<slug>/plan.md` | No — batch write |
| 4. Implement | — (developer builds) | code + passing tests | Yes — TDD build |
| 5. Review | `/review <slug>` | review notes | Yes — fix loop |

After each skill reports completion, announce the next phase and invoke it.

---

## Step 4 — Implement (no skill)

There is no skill for implementation — this is where the developer builds. The
canonical instruction is simply:

> Implement following the plan carefully.

Read `docs/plans/<slug>/plan.md` and work through the steps in order, following TDD as
required by `AGENTS.md` (failing test first, then the implementation to make it pass).
Mark each step `✅` in `docs/plans/<slug>/plan.md` as you complete it.

### Design conformance during implementation

**The design is the source of truth.** During implementation:

- Follow the design document (`docs/plans/<slug>/design.md`) exactly — it is
  prescriptive, not a loose guide
- If the design specifies a UI library, CSS framework, or technology, use it — do not
  substitute alternatives even if you prefer them
- If the design references visual mockups or HTML prototypes in `designs/`, match them
  precisely (structure, styling, spacing, colors)
- Any deviation from the design requires explicit user approval before proceeding

Once all steps are `✅`, invoke `/review <slug>`.
