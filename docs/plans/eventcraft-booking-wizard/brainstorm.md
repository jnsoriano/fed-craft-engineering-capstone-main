# Brainstorm — EventCraft Booking Wizard

## Source Documents

- `docs/specs/project-brief.md`
- `docs/specs/fsd.md`
- `docs/specs/tsd.md`
- `designs/eventcraft/DESIGN.md` (design tokens/system)

## Design Assets

Mockups found in `designs/` — source of truth for visual implementation:

- `designs/eventcraft_step_1_details_simplified/code.html` — Step 1: Event Details
- `designs/eventcraft_step_2_review_no_deposit/code.html` — Step 2: Equipment & Review (no deposit collected)
- `designs/eventcraft_booking_successful/code.html` — Booking Confirmation screen
- `designs/eventcraft_booking_error/code.html` — Booking Error screen
- `designs/eventcraft/DESIGN.md` — colors, typography, spacing, component styles

## Q&A

**Q1: Since there's no real backend, what determines whether a booking submission shows Success vs Error?**
A: Fails when a simulated mock validation rule is violated (e.g. over budget or another rule from the mock validation set); succeeds otherwise. Determined server-side by a simulated API route.

**Q2: Is the "Return to Dashboard" button on the Confirmation screen a real dashboard page, or a stub?**
A: No separate dashboard — it navigates back to the Step 1 (Event Details) page, i.e. the wizard's home route.

**Q3: Should each screen be its own route, or a single route with internal step state?**
A: Separate Next.js App Router routes per screen (e.g. `/`, `/review`, `/confirmation`, `/error`), giving real browser back/forward support while keeping an SPA feel via client-side navigation.

**Q4: Is booking submission purely client-side, or should there be a simulated server-side API route?**
A: Simulated Next.js API route (e.g. `POST /api/booking`) that validates against mock data server-side and returns success/error.

**Q5: Should reference data (EventTypes, Equipment, Pricing Rules) be served via API routes or imported directly as TS modules?**
A: Served via API routes (e.g. `GET /api/event-types`, `GET /api/equipment`, `GET /api/pricing-rules`), consistent with the simulated booking API. Exact route names/shapes to be finalized in the plan step once mock data is provided.

## Mock Data (ready, not yet provided)

User has the following mock data ready to drop in once the plan specifies file locations/shapes:

- EventTypes
- Equipment
- Pricing Rules and Calculation Data
- TypeScript Type Definitions
- Validation Rules Summary
- Local storage schema

## Notes

- No user accounts/authentication — single anonymous booking flow.
- Persistence is client-side via localStorage per TSD (form state across steps/refresh); the simulated API routes are for reference data and booking submission validation, not persistence.
- No deposit/payment collection (per `eventcraft_step_2_review_no_deposit` mockup and FSD booking fields — no payment fields listed).
