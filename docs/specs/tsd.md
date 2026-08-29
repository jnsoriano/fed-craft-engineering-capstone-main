# Technical Specification Document (TSD)

**Project Name:** EventCraft — Event Planning Wizard

## Technical Requirements

### Tech Stack

- React 18+/Typescript 5+/Next.js 14+
- react-hook-form + zod (Form & Validation)
- Zustand, use-local-storage-state, use-undo (State management and persistence)
- shadcn/ui + Tailwind CSS (UI)
- react-day-picker (Date/Time handling)

### State Management

- Form state must persist across both steps
- Browser refresh should not lose progress (localStorage)
- Support browser back/forward navigation between steps
- Budget tracker updates in real-time as selections change

### Progress Indicator

- Visual stepper showing both steps
- Completed steps show checkmark with summary (e.g., "Wedding • 120 guests")
- Current step highlighted
- Allow clicking back to previous step (but not skipping ahead)

### Validation

- Real-time field validation with inline error messages
- Step-level validation preventing progress with errors
- Budget warnings (non-blocking) vs errors (blocking)

### Responsive Design

- Mobile-first approach
- Cards stack vertically on mobile, grid on desktop
- Collapsible categories for equipment on mobile
- Sticky budget tracker on mobile
- Touch-friendly quantity steppers

### Accessibility

- Full keyboard navigation
- ARIA labels on all interactive elements
- Screen reader announcements for step changes and budget updates
- Focus management on step transitions
- Color-blind friendly budget indicators (use icons + colors)
