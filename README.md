# CRAFT Agentic Engineering Methodology

CRAFT is a structured agentic engineering methodology for building enterprise-grade software while capturing AI efficiency. It stands for Collaborative reasoning agentic framework for teams. This repo describes the methodology, 

- [Why use CRAFT?](#why-use-craft-framework)
- [Goals](#goals)
- [The Method in 60 Seconds](#the-method-in-60-seconds)
- [Adopting this Framework](#adopting-this-framework-on-a-new-project)
- [Pilots](#pilots)
- [What's in this repo](#whats-in-this-repo)

---

## Why use the Craft methodology? 
Software development has never been faster thanks to agentic engineering. But it introduces new problems that needs mitigation. 

- Software quality suffers if not systematised
- Developers don't have deep enough understanding of the technical design 
- Developers don't have accountability of the software 


# Goals of the methodology
## AI Efficiency
Craft allows us to capture the speed and intelligence of AI at every stage of the SDLC. 

## Better quality software compared to the baseline
A key goal of the methodology is to build software that is better in quality compared to the baseline. With Craft, best practices are easier and cheaper to follow raising the bar on correctness, security and maintainability.

## Keep developer accountability
Craft allows developers to form a deep understanding of the technical design of the software they build and steer it throughout. 

---

## The Method in 60 Seconds

Every feature follows five steps, split between two agents:

**Input:** user story + acceptance criteria + designs + HL technical design

| Step | Name | Who | What |
|------|------|-----|------|
| 1 | BRAINSTORM | Architect | Asks one multiple-choice question at a time to be able to create a plan |
| 2 | DESCRIBE | Architect | Writes the design in 200–300 word sections with developer reviewing and steering where needed |
| 3 | PLAN | Architect | Writes the implementation plan into the repo |
| 4 | IMPLEMENT | Developer | Builds against the plan, TDD |
| 5 | REVIEW | Architect | Reviews until all issues are resolved |

Multiple-choice questions keep developer cognitive load low. Plans committed to the repo provide auditability. Near-100% test coverage is the default outcome.

---

### How to use this? 
2 current ways of using this

## Prompts-driven
This is the simplest way to use the CRAFT methodology. Start a new agent with the following inputs. 
- User story
- Acceptance criteria
- Designs
- High-level technical design

The first chat is the Architect agent and use this prompt. 

```
I've got an idea I want to talk through with you. I'd like you to help me turn it into a fully formed design and spec (and eventually an implementation plan)
Check out the current state of the project in our working directory to understand where we're starting off, then ask me questions, one at a time, to help refine the idea. 
Ideally, the questions would be multiple choice, but open-ended questions are OK, too. Don't forget: only one question per message.
Once you believe you understand what we're doing, stop and describe the design to me, in sections of maybe 200-300 words at a time, asking after each section whether it looks right so far.
```

You'll work through the brainstorming phase and the describe phase at the end of this. 

When done use this prompt for the plan phase. 

```
Great. I need your help to write out a comprehensive implementation plan.

Assume that the engineer has zero context for our codebase and questionable taste. document everything they need to know. which files to touch for each task, code, testing, docs they might need to check. how to test it.give them the whole plan as bite-sized tasks. DRY. YAGNI. frequent commits.                                                                                                                                                                               

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. assume they don't know good test design very well.  

please write out this plan, in full detail, into docs/plans/
```

Once the plan is ready, start a new chat and point at the just written implementation plan and ask to 

```
Implement following the plan carefully
```

When implementation is done, go back to the Architect agent with 

```
Developer says they're done. Please review carefully.
```

Architect agent will provide a prioritised list of findings. Assess which ones you would like to fix and get the Developer agent to fix. 

Complete a few iterations of this review cycle until the Architect doesn't find anything worth fixing. 


## Skills-driven

Start with /craft-plan along with the input. 

- User story
- Acceptance criteria
- Designs
- High-level technical design

---

## Pilots

| Project | Outcome |
|---------|---------|
| Perth Airport | 82% developer time saved on mobile delivery. Team reduced from 4 mobile devs to 1. |
| Travel Money OZ | Engineering headcount on same delivery: 3 → 1.5 (2 devs + tech lead → 1 dev + part-time TL). |
| RACQ | In Progress |

See `case-studies/` for detailed learnings.

---


## What's in this repo

| Path | What it is |
|------|-----------|
| `methodology/` | Documentation of the 5-step method, setup, rollout, and measuring outcomes |
| `AGENTS.md` | Universal agent instructions — the source of truth, copied into any project to give agents their rules |
| `.github/copilot-instructions.md` | Symlink to `AGENTS.md` so GitHub Copilot reads the same rules |
| `.github/skills/` | The CRAFT skills as Copilot Agent Skills (`SKILL.md` per skill) and source of truth for all tools: `craft-plan`, `brainstorm`, `describe`, `plan`, `review`, `code-review`, `commit` |
| `templates/` | Starter files to copy into new projects (design doc, implementation plan, pilot checklist) |
| `prompts/` | Prompt templates for intake and brainstorm phases |
| `case-studies/` | Perth Airport and Travel Money OZ learnings |

### Using Claude Code?

These files mirror the canonical sources above so Claude Code reads the same instructions and skills.

| Path | What it is |
|------|-----------|
| `CLAUDE.md` | Symlink to `AGENTS.md` — Claude Code's instruction file |
| `.claude/skills/` | The CRAFT skills as native Claude Code skills (each `SKILL.md` symlinks to its `.github/skills/` counterpart) |
| `.claude/settings.json` | Claude Code project settings |

---