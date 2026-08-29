# Design — EventCraft Booking Wizard

## Source Documents

- `docs/specs/project-brief.md`
- `docs/specs/fsd.md`
- `docs/specs/tsd.md`
- `designs/eventcraft/DESIGN.md` (design tokens/system)
- `docs/plans/eventcraft-booking-wizard/brainstorm.md`

## 1. Architecture & Routing

The app lives in `eventcraft/` (Next.js 16, App Router, TypeScript). The booking wizard is split into distinct routes rather than a single-page component with internal state, giving native browser back/forward support while Next.js's client-side navigation preserves an SPA-like feel:

- `/` — Step 1: Event Details
- `/review` — Step 2: Equipment & Review
- `/confirmation` — Booking Confirmation (success)
- `/error` — Booking Error

Each route matches one mockup in `designs/`. Form state (event details + equipment selections) is held in a Zustand store, persisted to `localStorage` via `use-local-storage-state`, so refreshing the browser or navigating back/forward never loses progress. `use-undo` wraps the store where "back to previous step" needs to restore prior values without re-entering them.

Two categories of API routes back the flow:

- `GET /api/event-types`, `GET /api/equipment`, `GET /api/pricing-rules` — serve the mock reference data (JSON, read from static files in the route handler)
- `POST /api/booking` — accepts the full booking payload, runs the mock validation rules server-side, and returns either a success payload (booking reference `EVT-YYYYMMDD-XXXX`) or an error payload; the frontend routes to `/confirmation` or `/error` based on the response

No authentication, no real database — everything is mock data + localStorage, matching the TSD.

## 2. Data Layer & State Management

Reference data (`event-types.json`, `equipment.json`, `pricing-rules.json`, `validation-rules.json`) is served through three GET API routes that read the JSON files directly: `/api/event-types`, `/api/equipment`, `/api/pricing-rules`. The frontend fetches these once on load rather than importing JSON directly, keeping the "simulated backend" boundary consistent with `POST /api/booking`.

Wizard state (`WizardState` — event details, equipment selections, booking contact) lives in a Zustand store, mirrored to `localStorage` under the `eventcraft_wizard_state` key via `use-local-storage-state`, matching the shape in `storage-schema.json` (`version`, `lastUpdated`, `currentStep`, `eventDetails`, `equipment`, `booking`). `use-undo` wraps the equipment selection state specifically, since quantity steppers benefit from undo on misclicks; event details use plain Zustand state since `react-hook-form` already manages field-level state there.

Pricing is computed client-side from `pricingRules` + `equipment` selections: equipment subtotal → weekend surcharge (if event falls Fri-Sun) → GST → total, matching `PriceBreakdown`. Promo codes apply a discount before GST. This produces the live budget tracker figure compared against `budgetRange`. Venue and catering costs are out of scope — pricing is equipment-only, per explicit confirmation (no venue/catering mock data provided).

Validation uses `zod` schemas generated to match `validation-rules.json` (min/max lengths, required fields, date rules), wired into `react-hook-form` via its zod resolver. The same rule set is duplicated server-side in `/api/booking`'s handler so the mock "server-side validation failure" has real rules to fail against — e.g. a submission is rejected if `currentSpend > budget` beyond some threshold, simulating a validation-driven booking error.

## 3. Booking Submission & Simulated API

`POST /api/booking` accepts the full `WizardState` payload (event details, equipment selections, booking contact). It re-validates against `validation-rules.json` server-side and re-computes the price breakdown independently (never trusting the client's total) to check the "over budget" condition from `warningsNonBlocking`. If validation passes and the mock rule doesn't flag a failure, it returns `{ success: true, referenceCode: "EVT-YYYYMMDD-XXXX" }` using `bookingReferenceFormat`; otherwise `{ success: false, reason: "..." }`.

On the client, submitting the review step calls this route, then routes to `/confirmation` (passing the reference code) or `/error` (passing the reason) based on the response — matching the two mockups exactly. A short artificial delay (e.g. 500-800ms) simulates network latency so the loading state feels real, per the "polished UX" requirement in the brief.

Promo codes (`pricing-rules.json`) are validated in this same route on "Apply": checking code existence and `validUntil`/`validDays` constraints, returning the discount to apply before GST — matching the FSD's "validate on apply" requirement.

## 4. Screens & Component Structure

Each route renders from its matching mockup in `designs/`, using the design tokens from `designs/eventcraft/DESIGN.md` (Deep Navy primary, Emerald secondary, Hanken Grotesk headlines, Inter body, JetBrains Mono for budget figures/reference codes) translated into Tailwind config + `shadcn/ui` components.

- **`/` (Step 1: Event Details)** — Card-based `EventTypeSelector` (icon + label per FSD event type), `react-hook-form` fields for name/description/guests/times, `react-day-picker` for the date field, a budget range slider showing the "typical range" band per selected event type, and the top progress stepper (2 steps: Details, Review).
- **`/review` (Step 2: Equipment & Review)** — Accordion-grouped `EquipmentCategory` sections (Audio/Visual, Decor, Staging, Lighting, Furniture) with quantity steppers, a sticky `BudgetTrackerBar` (green/amber/red per thresholds), collapsible `ReviewSummary` sections with per-section edit links back to Step 1, the promo code input + Apply button, and the booking contact form + terms checkbox.
- **`/confirmation`** — Success icon, "Booking Confirmed" heading, reference code in monospace, and the two action buttons (Return to Dashboard → `/`, Plan Another Event → `/` with state cleared).
- **`/error`** — Error icon, "Oops! Something went wrong" heading, Try Again (resubmits) and Return to Review (`/review`) buttons.

The stepper, budget bar, and card components are shared across routes as reusable components in `src/components/`; each route/page composes them rather than duplicating markup.

## 5. Validation, Responsive & Accessibility Behavior

Validation runs in real-time via `react-hook-form` + the `zod` resolver: fields show inline errors on blur/change, and the "Continue" button is disabled while the current step has errors (step-level validation blocking progress). Budget warnings from `warningsNonBlocking` (over 80%, over 100%) render as non-blocking amber/red banners near the budget tracker — they inform but never prevent submission, unlike field errors.

Responsive behavior follows the DESIGN.md breakpoints: desktop (1024px+) uses the 12-column grid with equipment cards in a grid layout and the budget bar pinned at the top; mobile (<768px) stacks cards vertically, collapses equipment categories into accordions by default, and moves the budget bar to a sticky bottom position with touch-friendly quantity steppers (larger tap targets, per TSD).

Accessibility: all interactive elements (cards, steppers, sliders, accordion headers) get ARIA labels and roles; the progress stepper announces step changes via an `aria-live` region; budget threshold changes are also announced via `aria-live` (polite) so screen reader users get the amber/red warnings without needing to focus the bar. Focus moves to the new step's heading on every route transition. The budget indicator pairs color with icons (not color alone) for color-blind accessibility, per DESIGN.md's "Color-blind friendly budget indicators" note.

## Mock Data (in place)

- `eventcraft/src/lib/mock-data/event-types.json`
- `eventcraft/src/lib/mock-data/equipment.json`
- `eventcraft/src/lib/mock-data/pricing-rules.json`
- `eventcraft/src/lib/mock-data/validation-rules.json`
- `eventcraft/src/lib/storage-schema.json`
- `eventcraft/src/types/eventcraft.ts` (TypeScript type definitions)
