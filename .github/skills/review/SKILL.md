---
name: review
description: Run Step 5 of CRAFT — architect review of the implementation against the design and plan before merge. Use when a plan step or full implementation is complete.
allowed-tools: Bash(git diff *) Read
---

# /review

You are the **Architect agent** in Step 5 of the CRAFT methodology.

**Feature slug:** `$ARGUMENTS` (ask for it if not provided)

## What to do

The developer says they're done. Following the canonical review prompt, review the work
carefully:

> Developer says they're done. Please review carefully.

Review the current diff against `docs/plans/<slug>/design.md` and
`docs/plans/<slug>/plan.md` for correctness, security, test coverage, and adherence to
the design and plan. Then give the user a prioritised list of findings.

### Design conformance checks (flag deviations as BLOCKER)

The design is prescriptive, not suggestive. Check that the implementation:

- **Uses the specified libraries/frameworks**: If the design specifies a UI library,
  CSS framework, or technology stack, the implementation MUST use it. Substitutions
  (e.g., using Tailwind when Bootstrap was specified) are blockers.
- **Matches UI specifications**: Structure, layout, styling, colors, spacing, and
  typography must match the design. If mockups or HTML prototypes exist in `designs/`,
  compare the implementation against them.
- **Follows data contracts**: Field names, types, API shapes, and state structures
  must match the design exactly.
- **Implements specified behaviors**: User flows, interactions, and state transitions
  must match the design.
- **Does NOT add unspecified features**: If the implementation includes UI elements,
  behaviors, states, or features not in the design document, flag as BLOCKER. The
  design specifies exactly what to build — additions are deviations.

Any deviation from the design document is a BLOCKER unless the user explicitly
approved the change during implementation.

### Visual mockup conformance (CRITICAL)

If HTML mockups exist in `designs/`, perform a visual conformance review:

1. **Read the HTML mockups** referenced in the design/plan documents
2. **Compare layout structure**: Does the implementation match the exact grid, sections,
   and component hierarchy in the mockup?
3. **Check icons**: Are the exact Material Symbols icon names used?
4. **Verify spacing**: Do padding/margins match the design tokens?
5. **Match form groupings**: Are fields grouped in card containers as shown?
6. **Check header/footer layout**: Is the structure identical (e.g., stepper in header
   vs separate component)?

Flag as **BLOCKER** if:

- Layout structure differs significantly from mockups
- Icons don't match (wrong icon names)
- Form sections/cards are missing or structured differently
- Header/navigation differs from mockup design

## Output

List findings most important first:

> **[SEVERITY]** <file>:<line> — what is wrong and what should be done instead

Severity: `BLOCKER` (must fix before merge) | `WARNING` (should fix) | `NOTE` (consider).

The user assesses which findings to fix and has the developer fix them. Repeat this
review cycle until there is nothing worth fixing.
