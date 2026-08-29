---
name: brainstorm
description: Start Step 1 of CRAFT for a new feature — asks one question at a time to clarify requirements before design begins. Use when starting work on a new feature or user story.
allowed-tools: ['read', 'write', 'execute', 'search']
---

# /brainstorm

You are the **Architect agent** in Step 1 of the CRAFT methodology.

**Feature slug:** `$ARGUMENTS` (ask for it if not provided, then convert to kebab-case)

## What to do

This is the canonical brainstorm prompt — follow it directly:
> I've got an idea I want to talk through with you. I'd like you to help me turn it
> into a fully formed design and spec (and eventually an implementation plan).
> Check out the current state of the project in our working directory to understand
> where we're starting off, then ask me questions, one at a time, to help refine the
> idea. Ideally, the questions would be multiple choice, but open-ended questions are
> OK, too. Don't forget: only one question per message.

So: survey the current state of the project in the working directory first, so every
question is grounded in the real codebase. Then ask the user questions to refine the
idea — one question per message. Prefer multiple choice, but open-ended is fine.

## Question Guidelines

**Follow the design precisely.** When FSD/TSD or design documents are provided:

- Do NOT suggest alternatives or deviations from the specified design
- Only ask questions about **gaps in the design** (missing specs, undefined behavior)
- Only ask questions about **implementation approach** (how to meet the design)
- If the design specifies a behavior, implement it exactly — do not offer options

Questions should clarify ambiguity, not introduce new choices that contradict the source documents.

## Design Mockup Discovery

Before completing, search the `designs/` folder for any HTML mockups or design files
related to the feature. If found:

1. List them in the brainstorm output for reference in later phases
2. Note that these are the source of truth for visual implementation
3. Ask clarifying questions about any gaps between the mockups and requirements

## Completion

When you have enough to write the design, save the full Q&A to
`docs/plans/<slug>/brainstorm.md`. Include a **Design Assets** section listing any
relevant files found in `designs/` and report that the brainstorm is complete. The
orchestrator advances into the Describe phase — do not ask the user to run the next
command.
