# Implementation Plan — EventCraft Booking Wizard

## Overview

This plan implements the EventCraft two-step event booking wizard inside the existing
`eventcraft/` Next.js 16 (App Router, TypeScript) app, per
`docs/plans/eventcraft-booking-wizard/design.md`. Read that file and
`docs/plans/eventcraft-booking-wizard/brainstorm.md` before starting — this plan assumes
you understand the architecture (route-per-screen, Zustand + localStorage, simulated
API routes over mock JSON data) but not the codebase or toolset.

All paths below are relative to `eventcraft/` unless stated otherwise.

## Visual Design References

> **⚠️ IMPORTANT:** All UI implementation MUST match the HTML mockups pixel-for-pixel.
> These are the source of truth for layout, spacing, icons, and visual styling. Also
> read `designs/eventcraft/DESIGN.md` for the full design token system (colors,
> typography, spacing, shapes) referenced throughout this plan.

**HTML Design Mockups:**

| Screen | File | Description |
|--------|------|-------------|
| Step 1: Event Details | `designs/eventcraft_step_1_details_simplified/code.html` | Event type cards, details form, budget slider, stepper |
| Step 2: Equipment & Review | `designs/eventcraft_step_2_review_no_deposit/code.html` | Equipment accordions, budget tracker bar, review summary, contact form |
| Booking Confirmation | `designs/eventcraft_booking_successful/code.html` | Success screen |
| Booking Error | `designs/eventcraft_booking_error/code.html` | Error screen |

**Cross-Reference Checklist for Each Screen:**

1. Open the HTML mockup in a browser
2. Compare layout structure (header, sections, grids)
3. Match exact icons (Material Symbols names)
4. Verify spacing matches design tokens in `designs/eventcraft/DESIGN.md`
5. Check form field groupings and card containers
6. Confirm responsive breakpoints (1024px+ desktop, 768-1023px tablet, <768px mobile)

## Conventions for This Plan

- **TDD**: write the failing test first, then the implementation, for every task with
  logic (utilities, API routes, hooks, form validation). Pure presentational markup
  (matching a mockup 1:1) can be verified with a rendering/snapshot-free assertion test
  (e.g. "renders the heading", "renders N cards") rather than exhaustive UI tests.
- **Test runner**: Vitest + React Testing Library + jsdom (set up in Task 1). Not Jest —
  Vitest is faster and has native ESM/TS support matching this Next.js 16 setup.
- **Commit after every task.** Each task below is a single commit.
- **DRY/YAGNI**: don't add anything not specified in `design.md`. No venue/catering
  pricing, no authentication, no dashboard page (per brainstorm Q&A).

---

## Task 1: Set up the test runner ✅

**Files to touch:**
- `package.json` (add devDependencies + `test` script)
- `vitest.config.mts` (new)
- `vitest.setup.ts` (new)

**What to do:**

```bash
npm install -D vitest @vitejs/plugin-react@4 jsdom@25 @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Use `@vitejs/plugin-react@4` (not the latest major) — the latest requires Babel 8,
which conflicts with `shadcn`'s Babel 7 peer dependency. Use `jsdom@25` (not latest) —
newer jsdom's `html-encoding-sniffer` dependency chain is pure ESM and fails under
Vitest's default worker pool (`ERR_REQUIRE_ESM`) on this project's Node version.

Create `vitest.config.mts` (must be `.mts`, not `.ts` — the `.ts` extension gets
loaded as CJS by Vite's config loader and fails on this project's ESM-only
transitive dependencies):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

**How to test:** Create `src/lib/__tests__/sanity.test.ts` with `expect(1 + 1).toBe(2)`,
run `npm test`, confirm it passes, then delete the sanity test.

---

## Task 2: Tailwind theme from design tokens ✅

**Files to touch:** `src/app/globals.css`

**What to do:** `designs/eventcraft/DESIGN.md`'s frontmatter (`colors`, `typography`,
`rounded`, `spacing`) must become Tailwind v4 `@theme` tokens. Tailwind v4 configures
via CSS, not `tailwind.config.js`. In `globals.css`, add an `@theme` block mapping every
color from the DESIGN.md frontmatter (e.g. `--color-primary: #000000;
--color-secondary: #006c49; --color-budget-warning: #F59E0B; --color-budget-danger:
#EF4444;` etc. — copy every key), plus font family variables for Hanken Grotesk, Inter,
and JetBrains Mono (add `next/font/google` imports in `src/app/layout.tsx` for these
three fonts and expose them as CSS variables consumed by the `@theme` block).

**How to test:** No automated test (pure config) — visually confirm in Task 4+ that
`bg-primary`, `text-secondary`, `font-[family-name:--font-hanken]` etc. resolve
correctly by using them in a throwaway element and checking computed styles render.

---

## Task 3: Domain pricing utility (`lib/pricing.ts`) ✅

**Files to touch:**
- `src/lib/pricing.ts` (new)
- `src/lib/__tests__/pricing.test.ts` (new)

**What to do:** Write the failing tests first. `calculatePriceBreakdown` takes selected
equipment (`Record<equipmentId, quantity>`), the equipment catalog, the event date, and
an optional promo code, and returns a `PriceBreakdown` (already typed in
`src/types/eventcraft.ts`):

```ts
import type { PriceBreakdown } from '@/types/eventcraft';
import type { EquipmentItem } from '@/types/eventcraft';

export function calculatePriceBreakdown(
  selectedEquipment: Record<string, number>,
  catalog: Record<string, EquipmentItem[]>,
  eventDate: Date,
  promoCode?: { discountPercentage?: number; discountAmount?: number },
): PriceBreakdown
```

Logic (per `pricing-rules.json` and design.md Section 2):
1. Flatten `catalog` to a lookup by `id`, sum `price * quantity` for each selected item
   → `equipment.subtotal`.
2. If `eventDate` falls on Fri/Sat/Sun, apply `weekendSurcharge.percentage` (15%) to the
   running subtotal → `weekendSurcharge` amount.
3. Apply promo code discount (percentage or flat amount) before GST, if provided.
4. Apply `gst.percentage` (10%) to get `gst` amount.
5. `total = subtotal (post-discount) + gst`.

**Test cases (write these first, watch them fail, then implement):**
- No equipment selected → subtotal 0, gst 0, total 0.
- Single item, quantity 2, weekday date → surcharge 0, gst = 10% of subtotal.
- Weekend date → 15% surcharge applied before GST.
- Percentage promo code → discount applied before GST, reduces total correctly.
- Flat-amount promo code → same, using `discountAmount`.
- Unknown equipment id in selection → ignored (no crash), per DRY/defensive handling.

---

## Task 4: Validation schemas (`lib/validation.ts`)

**Files to touch:**
- `src/lib/validation.ts` (new)
- `src/lib/__tests__/validation.test.ts` (new)

**What to do:** Write two `zod` schemas mirroring `validation-rules.json` exactly —
don't invent extra rules:

- `eventDetailsSchema` — covers `eventType` (required string), `eventName` (3-100
  chars), `eventDescription` (optional, max 500), `eventDate` (required, must be ≥ 14
  days from now, or ≥ 21 days if `expectedGuests > 200` — use a `.refine()`),
  `startTime`/`endTime` (required, end after start, duration 2-12h via `.refine()`),
  `expectedGuests` (10-500), `budgetRange` (1000-100000).
- `bookingContactSchema` — `contactName` (required), `email` (required, email format),
  `phone` (required, basic phone format regex), `companyOrganization` (optional),
  `specialRequests` (optional, max 1000), `termsAccepted` (must be `true`), `promoCode`
  (optional string).

Export both plus a `warningsNonBlocking` helper function
`getBudgetWarning(currentSpend: number, budget: number): string | null` implementing
the two conditions from `validation-rules.json`'s `warningsNonBlocking` (over 100% →
"You are over budget"; over 80% → "You are approaching your budget limit"; else null).

**Test cases:** one passing case and one failing case per field constraint (e.g.
`eventName` too short fails, exactly 3 chars passes); the large-event date refinement
(200 guests requires 21 days, 199 guests requires only 14); `getBudgetWarning` at 79%,
80%, 100%, 101% spend.

---

## Task 5: Zustand store + localStorage persistence

**Files to touch:**
- `src/lib/store.ts` (new)
- `src/lib/__tests__/store.test.ts` (new)

**What to do:** Create a Zustand store typed against `WizardState` (from
`src/types/eventcraft.ts`), persisted via `use-local-storage-state`'s pattern — since
`use-local-storage-state` is a hook (not a Zustand middleware), wrap it as: the store
holds state + actions in-memory, and a small `useWizardPersistence()` hook (used once in
the root layout) reads/writes the store's serialized state to `use-local-storage-state('eventcraft_wizard_state', { defaultValue: initialState })`
on every store change, matching the shape in `storage-schema.json` (`version: 1`,
`lastUpdated`, `currentStep`, `eventDetails`, `equipment`, `booking`). On mount, if a
stored value exists, hydrate the Zustand store from it.

Store actions: `setEventDetails(partial)`, `setEquipmentQuantity(id, qty)`,
`setBookingContact(partial)`, `setCurrentStep(step)`, `reset()` (clears store +
localStorage — used by "Plan Another Event" and after successful booking, per
`clearConditions` in `storage-schema.json`).

Wrap equipment state specifically with `use-undo` (per design.md Section 2) — expose
`undoEquipment()` / `redoEquipment()` from the store for a future "undo last change"
affordance on the quantity steppers (wire the button in Task 9; this task only exposes
the capability).

**Test cases:** setting each slice updates state correctly; `reset()` clears all slices
back to defaults; hydration from a pre-populated fake localStorage value restores state.
Use `vi.stubGlobal('localStorage', ...)` or `use-local-storage-state`'s testing guidance
(check its README `resetLocalStorage` mock utility) — do not test against real browser
localStorage.

---

## Task 6: GET API routes for reference data

**Files to touch:**
- `src/app/api/event-types/route.ts` (new)
- `src/app/api/equipment/route.ts` (new)
- `src/app/api/pricing-rules/route.ts` (new)
- `src/app/api/event-types/__tests__/route.test.ts` (new, and equivalent for the other two)

**What to do:** Each route is a trivial Next.js Route Handler:

```ts
import eventTypesData from '@/lib/mock-data/event-types.json';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(eventTypesData);
}
```

Repeat for `equipment.json` and `pricing-rules.json`.

**Test cases:** import the route's `GET` function directly (no server needed) and
assert the `NextResponse` body matches the JSON file content (`await response.json()`
deep-equals the imported JSON).

---

## Task 7: POST /api/booking route

**Files to touch:**
- `src/app/api/booking/route.ts` (new)
- `src/app/api/booking/__tests__/route.test.ts` (new)

**What to do:** Accept a JSON body typed as
`{ eventDetails: EventDetailsState; equipment: EquipmentState; booking: BookingContactState }`.

1. Validate `eventDetails` and `booking` against the Task 4 schemas; if either fails,
   return `NextResponse.json({ success: false, reason: 'validation_failed', errors },
   { status: 400 })`.
2. Recompute the price breakdown server-side via `calculatePriceBreakdown` (Task 3) —
   never trust a client-sent total.
3. Check `getBudgetWarning(total, eventDetails.budgetRange) === 'You are over budget'`
   — if over budget, return `{ success: false, reason: 'over_budget' }` (this is the
   simulated validation failure agreed in brainstorm Q1).
4. If a `promoCode` is present, validate it against `pricing-rules.json`'s
   `promoCodes` (`validUntil` in the future, or today's day-of-week in `validDays`) —
   an invalid/expired code returns `{ success: false, reason: 'invalid_promo_code' }`.
5. Otherwise, generate a reference code matching `bookingReferenceFormat`
   (`EVT-YYYYMMDD-XXXX`, e.g. `EVT-20260830-4821` — YYYYMMDD from today, XXXX random
   4-digit) and return `{ success: true, referenceCode }`.
6. Add an artificial delay (`await new Promise(r => setTimeout(r, 600))`) before
   responding, per design.md Section 3.

**Test cases:** valid payload → success with correctly formatted reference code; missing
required field → 400 with validation_failed; over-budget payload → over_budget failure;
expired promo code → invalid_promo_code failure; valid promo code → success with
discount reflected (assert via a second call comparing totals, or expose the computed
total in the response for the test to inspect).

---

## Task 8: Shared UI components

**Files to touch (each with a co-located test in `__tests__/`):**
- `src/components/ProgressStepper.tsx`
- `src/components/BudgetTrackerBar.tsx`
- `src/components/EventTypeCard.tsx`
- `src/components/EquipmentCategoryAccordion.tsx`
- `src/components/QuantityStepper.tsx`

**What to do:** Match each component to its mockup section exactly (see Cross-Reference
Checklist above). Use `shadcn/ui` primitives already scaffolded in
`src/components/ui/` where applicable (buttons, etc.) — add more via `npx shadcn add
<component>` as needed (e.g. `accordion`, `slider`, `checkbox`) rather than
hand-rolling. Use the Tailwind theme tokens from Task 2, not hardcoded hex values.

- `ProgressStepper`: renders 2 steps (Details, Review), highlights the active step,
  shows a checkmark on completed steps, includes an `aria-live="polite"` region
  announcing "Step X of 2: <name>" on change.
- `BudgetTrackerBar`: props `currentSpend`, `totalBudget`; renders green/amber/red per
  the 80%/100% thresholds (color + icon, not color alone, per accessibility
  requirement); `aria-live="polite"` on threshold change.
- `EventTypeCard`: icon + label per `EventType`, selected state with 2px primary border
  and checkmark badge (per DESIGN.md Card-Based Selections).
- `EquipmentCategoryAccordion`: one category (name + icon) containing `QuantityStepper`
  rows per item; collapsed by default on mobile per TSD.
- `QuantityStepper`: +/- buttons with the current quantity, respecting `maxQuantity` /
  `maxQuantityRule` (disable increment at the max).

**Test cases (React Testing Library):** each component renders expected text/ARIA
roles; `BudgetTrackerBar` shows the correct color class at 79%/80%/100%/101%;
`QuantityStepper` increment disables at max, decrement disables at 0; `EventTypeCard`
calls its `onSelect` handler on click.

---

## Task 9: Step 1 page (`/`)

**Files to touch:**
- `src/app/page.tsx` (replace boilerplate)
- `src/app/__tests__/page.test.tsx` (new)

**What to do:** Replace the default `create-next-app` content entirely. Wire
`react-hook-form` with the Task 4 `eventDetailsSchema` via `@hookform/resolvers/zod`.
Fetch `/api/event-types` on mount (or via a small `useEventTypes()` hook) to render
`EventTypeCard`s. Use `react-day-picker` for the date field (disable dates <14 days out
by default; the 21-day rule re-validates once `expectedGuests` exceeds 200). Budget
range uses a `shadcn/ui` slider with the "typical range" band overlay from the selected
event type's `suggestedBudgetPerGuest * expectedGuests`. Include the `ProgressStepper`
(step 1 active). On valid submit, write to the Zustand store (Task 5) and navigate to
`/review`.

**Test cases:** form shows validation errors for invalid input; submit button disabled
while invalid; valid submission updates the store and navigates (mock `next/navigation`'s
`useRouter`).

---

## Task 10: Step 2 page (`/review`)

**Files to touch:**
- `src/app/review/page.tsx` (new)
- `src/app/review/__tests__/page.test.tsx` (new)

**What to do:** Redirect to `/` if no `eventDetails` in the store (guards direct URL
access). Fetch `/api/equipment` and render `EquipmentCategoryAccordion`s per category.
Show the sticky `BudgetTrackerBar` (desktop: top; mobile: bottom, per design.md — use a
responsive Tailwind class toggle). Render the collapsible `ReviewSummary` (event details
+ equipment, each with an "Edit" link back to `/`, preserving other data per FSD).
Promo code input + "Apply" button calls a client-side check against
`/api/pricing-rules`'s `promoCodes` (mirrors the server check in Task 7, for immediate
feedback) before enabling final submission. Booking contact form uses
`bookingContactSchema` (Task 4) via `react-hook-form`. On submit, call `POST
/api/booking` (Task 7); on `success: true`, store the reference code and navigate to
`/confirmation`; on `success: false`, store the `reason` and navigate to `/error`.

**Test cases:** redirects to `/` when store is empty; renders equipment categories from
a mocked fetch; budget tracker reflects selected equipment total; submit calls the
booking API and navigates correctly for both success and failure mocked responses.

---

## Task 11: Confirmation page (`/confirmation`)

**Files to touch:**
- `src/app/confirmation/page.tsx` (new)
- `src/app/confirmation/__tests__/page.test.tsx` (new)

**What to do:** Match `designs/eventcraft_booking_successful/code.html` exactly (success
icon, heading, message, monospace reference code, two buttons). "Return to Dashboard"
and "Plan Another Event" both call the store's `reset()` (clearing localStorage per
`clearConditions`) and navigate to `/`. Redirect to `/` if no reference code is present
in state (guards direct URL access).

**Test cases:** renders the reference code from store state; both buttons call `reset()`
and navigate to `/`; redirects when no reference code present.

---

## Task 12: Error page (`/error`)

**Files to touch:**
- `src/app/error/page.tsx` (new)
- `src/app/error/__tests__/page.test.tsx` (new)

**What to do:** Match `designs/eventcraft_booking_error/code.html` exactly. "Try Again"
re-submits the same payload to `POST /api/booking` (reusing the Task 10 submit logic —
extract it to a shared hook, e.g. `useSubmitBooking()`, during Task 10 if not already
done, to avoid duplicating the fetch/navigate logic here). "Return to Review" navigates
to `/review` without clearing state. Redirect to `/` if no wizard state is present.

**Test cases:** "Try Again" calls the booking API again; "Return to Review" navigates
to `/review`; redirects when no state present.

---

## Task 13: Accessibility pass

**Files to touch:** all components/pages touched above (no new files)

**What to do:** Audit against design.md Section 5: focus moves to each page's `<h1>` on
route change (use a small `useFocusHeading()` effect hook shared across pages); confirm
every interactive element (cards, steppers, accordion headers, slider) has an accessible
name; confirm `aria-live` regions exist on the stepper and budget bar (added in Task 8 —
verify here, don't re-implement).

**How to test:** extend the Task 8/9/10 RTL tests with `screen.getByRole` assertions for
each interactive element's accessible name; add one test per page confirming the heading
receives focus after mount (`document.activeElement`).

---

## Task 14: Final integration check

**What to do:** Run the full user flow manually in the browser (`npm run dev`):
Step 1 → Step 2 → submit a valid booking → confirm the Confirmation screen matches its
mockup exactly; then force an over-budget submission and confirm the Error screen
matches its mockup. Test browser back/forward between `/` and `/review` preserves form
data. Test a full page refresh mid-flow restores state from localStorage. Resize to
mobile width and confirm the responsive layout changes (stacked cards, bottom budget
bar, collapsed accordions).

**How to test:** `npm run build && npm test` — both must pass cleanly with no console
errors/warnings before considering the feature done. Then hand off to `/review` (CRAFT
Step 5).
