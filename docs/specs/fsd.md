## Functional Specification Document (FSD)

**Project Name:** EventCraft — Event Planning Wizard

## Step 1: Event Details

**Purpose:** Define the type of event and basic details

### Fields

| Field | Type | Validation |
|---|---|---|
| Event Type | Card selection | Required |
| Event Name | Text input | Required, 3-100 characters |
| Event Description | Textarea | Optional, max 500 characters |
| Event Date | Date picker | Required, must be at least 14 days in future |
| Start Time | Time picker | Required |
| End Time | Time picker | Required, must be after start time |
| Expected Guests | Number stepper | Required, min 10, max 500 |
| Budget Range | Range slider | Required, $1,000 - $100,000 |

### Event Types

| Type | Icon (Material Symbol) | Min Guests | Typical Duration | Base Complexity |
|---|---|---|---|---|
| Corporate | work | 50 | 4-8 hours | High |
| Wedding | favorite | 30 | 5-6 hours | High |
| Birthday | cake | 10 | 3-4 hours | Low |
| Launch | rocket_launch | 40 | 2-4 hours | Medium |
| Gala | local_activity | 80 | 4-5 hours | High |
| Workshop | school | 15 | 2-6 hours | Low |

### Business Rules

- Event duration must be between 2-12 hours
- Weekend events (Fri-Sun) incur 15% surcharge
- Events over 200 guests require minimum 21 days notice
- Budget slider should show "typical range" indicator based on event type and guest count
- Display warning if budget seems low for selected event type/size
- Corporate events require minimum 50 guests

## Step 2: Equipment & Review

**Purpose:** Select additional equipment and review complete booking

### Equipment Categories

| Category | Icon (Material Symbol) | Options |
|---|---|---|
| Audio/Visual | surround_sound | Projector + Screen, Wireless microphone, Speakers, Video recording |
| Decor | celebration | Floral centerpieces, Balloon arrangements, Themed decorations |
| Staging | layers | Stage/platform, Lectern/podium, Backdrop, Red carpet |
| Lighting | lightbulb | Basic lighting, Uplighting, Spotlights, Dance floor lighting |
| Furniture | chair | Extra chairs, Cocktail tables, Lounge seating, Photo booth |

### Equipment Display Requirements

- Organized by category with expand/collapse accordion
- Each item shows: Name, description, unit price, quantity selector
- Some items are "per event" (e.g., stage), others "per unit" (e.g., chairs)
- Show "Recommended" badge based on event type

### Pricing Examples

| Item | Unit | Price |
|---|---|---|
| Projector + Screen | Per event | $150 |
| Wireless microphone | Per event | $75 |
| Stage/platform | Per event | $400 |
| Lectern/podium | Per event | $80 |
| Basic lighting | Per event | $150 |
| Floral centerpieces | Per table | $85 |
| Extra chairs | Per 10 | $50 |

### Equipment Business Rules

- Event type recommendations: Corporate: Projector, microphones, lectern (auto-suggested), Wedding: Centerpieces, dance floor lighting (auto-suggested)
- Quantity limits based on guest count: Centerpieces: max = number of tables, Microphones: max 4

### Budget Tracker

Display persistent budget bar showing:

- Total budget (from Step 1)
- Current spend (sum of all selections)
- Remaining budget
- Visual indicator: Green (under 80%), Yellow/Amber (80-100%), Red (over budget)

### Review Summary Display

- Collapsible sections for each category: Event Details (type, date, time, guests), Equipment (itemized list)
- Edit button per section (returns to that step, preserves other data)
- Itemized price breakdown with subtotals per category

### Pricing Breakdown

| Category | Calculation |
|---|---|
| Venue (Base + Parking) | Fixed venue cost based on guest count |
| Catering | Per-guest rate × number of guests |
| Equipment | Sum of all selected items × quantities |
| Weekend Surcharge | 15% of subtotal (if Fri-Sun event) |
| Subtotal | Sum of above |
| GST (10%) | 10% of subtotal |
| Total | Subtotal + GST |

### Booking Fields

| Field | Type | Validation |
|---|---|---|
| Contact Name | Text | Required |
| Email | Email | Required, valid format |
| Phone | Phone | Required, valid format |
| Company/Organization | Text | Optional |
| Special Requests | Textarea | Optional, max 1000 chars |
| Promo Code | Text + Apply button | Optional, validate on apply |
| Terms & Conditions | Checkbox | Required to submit |

### Booking Business Rules

- If over budget, show warning with suggestions
- Promo code field with validation and "Apply" button
- Terms & Conditions checkbox must be accepted before booking
- Generate booking reference number on submit (format: EVT-YYYYMMDD-XXXX)

## Booking Confirmation Screen

**Purpose:** Display successful booking confirmation to the user

### Display Elements

- Success icon: Green checkmark circle (Material Symbol: check_circle, filled)
- Heading: "Booking Confirmed"
- Message: "Your event details have been successfully secured. We've sent a confirmation email with next steps."
- Reference Code display: EVT-YYYYMMDD-XXXX format (monospace styling)

### Actions

| Button | Style | Action |
|---|---|---|
| Return to Dashboard | Primary (filled) | Navigate to user dashboard |
| Plan Another Event | Secondary (outlined) | Start new event wizard |

## Booking Error Screen

**Purpose:** Display error state when booking submission fails

### Display Elements

- Error icon: Red error circle (Material Symbol: error, filled)
- Heading: "Oops! Something went wrong"
- Message: "We couldn't process your booking at this time. Please check your details and try again."

### Actions

| Button | Style | Action |
|---|---|---|
| Try Again | Primary (filled) | Retry booking submission |
| Return to Review | Secondary (outlined) | Navigate back to review step |

## Navigation & Stepper

**Purpose:** Guide users through the booking flow

### Stepper States

| State | Visual Treatment |
|---|---|
| Completed | Green background with checkmark icon (secondary color) |
| Active/Current | Primary border, bold text, step number visible |
| Upcoming | Outline variant border, muted text |

### Steps

1. Event Details
2. Review

### Navigation Actions

- "Save & Exit" button in header to save draft
- "Save Draft" button to persist current state
- "Continue to Review" to proceed to next step
- "Back" button to return to previous step
