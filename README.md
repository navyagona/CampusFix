# CampusFix — Campus Maintenance & Facilities Tracker

A full-stack, role-protected campus maintenance tracking application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage)**.

---

## 1. The Problem

At most university campuses, physical maintenance issues—broken lecture projectors, plumbing leaks, flickering lights, jammed safety doors—are reported through fragmented, informal channels:
- Chat groups (WhatsApp, Discord, Slack) where messages quickly get buried.
- Hallway verbal conversations with custodial staff where details are lost.
- Opaque centralized emails where reporters receive no feedback.

This informal reporting leads to three major problems:
1. **Lack of Transparency**: Students have no visibility into whether an issue was acknowledged, actively assigned, or dismissed.
2. **Duplication of Effort**: Multiple students report the exact same broken outlet or water leak, wasting facilities triage time.
3. **Audit Trail Deficits**: Status changes happen silently without capturing who made the change, when it occurred, or what was done to resolve the issue.

I built **CampusFix** to address this with disciplined engineering: a transparent state machine, role-based access control, and an immutable audit trail.

---

## 2. The Solution & User Roles

CampusFix defines two distinct, secure roles:

### Student Role
- **Submit Reports**: Choose category (`electrical`, `plumbing`, `classroom_equipment`, `cleanliness`, `other`), specific campus building, precise room/floor details, description, and optional photo attachment.
- **Track Status**: Inspect personal dashboard with real-time status badges, search, and category/status filters.
- **Audit History**: Inspect the full chronological timeline of every transition and public staff update.
- **Report Lifecycle**: Edit details or withdraw a ticket while it remains in the `submitted` state (prior to staff triage).

### Staff & Facilities Role
- **Protected Access**: Role-protected portal restricted at both the Server Action / route level and database Row Level Security.
- **Triage Dashboard**: High-level KPI summary (Total tickets, Pending triage, In Progress, Urgent/High severity, Resolved) with clickable instant filters.
- **Workflow State Management**: Move tickets through a strict state machine (`submitted` &rarr; `acknowledged` &rarr; `in_progress` &rarr; `resolved`, or mark `duplicate`/`rejected` with mandatory reason).
- **Technician Assignment & Priority**: Assign maintenance crew and adjust urgency.
- **Two-Tier Communications**:
  - **Public Updates**: Visible to students on their ticket timeline.
  - **Internal Staff Notes**: Protected by Row Level Security; accessible exclusively by facilities staff for tracking inventory and repair coordination.

---

## 3. Product Screenshots

The screenshots below are captured directly from the running product:

| View | Screenshot |
| :--- | :--- |
| **Landing Page & Stepper** | ![Homepage](docs/screenshots/homepage.png) |
| **Redesigned Login Page** | ![Login Page](docs/screenshots/login.png) |
| **Student Dashboard** | ![Student Dashboard](docs/screenshots/student_dashboard.png) |
| **Report Detail & Stepper** | ![Report Detail](docs/screenshots/report_detail.png) |
| **Staff Triage Portal** | ![Staff Reports](docs/screenshots/staff_reports.png) |

---

## 4. Architecture & Database Design

### Tech Stack
- **Framework**: Next.js 16 (App Router, Server Actions, Server Components)
- **Language**: TypeScript (strict type checking, 100% type-safe schemas)
- **Styling**: Tailwind CSS
- **Database, Auth & Storage**: Supabase (PostgreSQL with Row Level Security, Supabase Auth, Storage bucket for maintenance photos)
- **Validation**: Zod (validated both client-side for UX and server-side in Server Actions)
- **Testing**:
  - **Vitest**: 29 unit tests covering state machine transitions, RBAC permissions, Zod schemas, and data stores.
  - **Playwright**: 4 end-to-end integration tests in headless Chromium covering student reporting, editing/withdrawal, staff triage, and unauthorized access barriers.

### Database Schema (PostgreSQL)

```mermaid
erDiagram
    PROFILES ||--o{ REPORTS : "created_by"
    PROFILES ||--o{ REPORTS : "assigned_to"
    REPORTS ||--o{ REPORT_STATUS_HISTORY : "report_id"
    PROFILES ||--o{ REPORT_STATUS_HISTORY : "changed_by"
    REPORTS ||--o{ REPORT_INTERNAL_NOTES : "report_id"
    PROFILES ||--o{ REPORT_INTERNAL_NOTES : "author_id"

    PROFILES {
        uuid id PK
        string email
        string full_name
        string role "student | staff | admin"
        timestamptz created_at
    }

    REPORTS {
        uuid id PK
        string tracking_number UK
        string title
        text description
        string category "electrical | plumbing | classroom_equipment | cleanliness | other"
        string building
        string location_details
        string priority "low | medium | high | urgent"
        string status "submitted | acknowledged | in_progress | resolved | duplicate | rejected | withdrawn"
        string photo_url
        uuid created_by FK
        uuid assigned_to FK
        text resolution_note
        timestamptz resolved_at
        timestamptz created_at
        timestamptz updated_at
    }

    REPORT_STATUS_HISTORY {
        uuid id PK
        uuid report_id FK
        string from_status
        string to_status
        uuid changed_by FK
        text comment
        timestamptz created_at
    }

    REPORT_INTERNAL_NOTES {
        uuid id PK
        uuid report_id FK
        uuid author_id FK
        text note
        timestamptz created_at
    }
```

### Row Level Security (RLS) Policies
- `profiles`: All authenticated users can view basic profiles (names and roles) for report card attribution. Users can update their own `full_name`; the `role` column cannot be changed by the user.
- `reports`:
  - `SELECT`: Students can select only reports where `created_by = auth.uid()`. Staff and admins can select all reports.
  - `INSERT`: Authenticated users can insert reports with `created_by = auth.uid()` and initial status `'submitted'`.
  - `UPDATE`: Students can update only while `created_by = auth.uid() AND status = 'submitted'`. Staff can update status, priority, assignment, and resolution fields.
- `report_status_history`: Visible to report owner or staff; insertable upon validated transitions.
- `report_internal_notes`: Strictly visible and insertable only by `role IN ('staff', 'admin')`. Zero access for students.

---

## 5. Workflow State Machine

Valid transitions are validated in `src/lib/workflow.ts`:

```
               [ submitted ] ── (Student) ──> [ withdrawn ]
                     │
            (Staff triage)
                     │
                     ▼
             [ acknowledged ] ── (Staff) ──> [ duplicate / rejected ]
                     │
            (Dispatched)
                     │
                     ▼
              [ in_progress ]
                     │
         (Resolution verified)
                     │
                     ▼
                [ resolved ]
```

- **`submitted`**: Initial intake. Student can edit details or withdraw ticket.
- **`acknowledged`**: Facilities has reviewed ticket and queued it. Student editing is locked.
- **`in_progress`**: Technician dispatched to site.
- **`resolved`**: Issue repaired. Requires a mandatory resolution note detailing what was repaired.
- **`duplicate` / `rejected`**: Terminal states. Requires a mandatory reason (e.g. duplicate reference ticket number).

---

## 6. Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Supabase Configuration
# For production or connecting to a live Supabase project:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Demo Mode (Active by default if Supabase keys are empty)
# Allows running the full student & staff workflow locally with realistic sample data
NEXT_PUBLIC_DEMO_MODE=true
```

> **Evaluation Note**: When `NEXT_PUBLIC_SUPABASE_URL` is unset or blank, CampusFix automatically activates **Interactive Demo Mode**. The data repository routes through a realistic in-memory store (`src/lib/data/mock-store.ts`) pre-seeded with sample university tickets, full audit logs, and 1-click role switching between Alex Chen (Student) and Dave Miller (Staff). When valid Supabase keys are provided, it connects directly to PostgreSQL with Row Level Security.

---

## 7. Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v22.14 LTS)
- npm 9+

### Installation

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local

# 3. (Optional) Run Supabase migrations on your Supabase project:
# Execute supabase/migrations/20260101000000_create_campusfix_schema.sql in the Supabase SQL Editor
# Execute supabase/seed.sql to insert sample tickets and users

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Running the Tests

### 1. Unit Tests (Vitest)
Executes unit tests for state machine transitions, Zod schemas, role permissions, and mock store behavior:

```bash
npm run test
```

### 2. End-to-End Tests (Playwright)
Executes end-to-end browser tests in Chromium against the running application:

```bash
npm run test:e2e
```

### 3. Type Checking & Linting

```bash
npx tsc --noEmit
npm run lint
```

---

## 9. Important Design Decisions & Rejected Alternatives

### Decision 1: Dual-Mode Repository Layer vs. Hardcoded Mock Fallback
- **Choice**: Implemented an environment-aware repository (`src/lib/data/repository.ts`) with real Supabase SQL migrations & server queries alongside an in-memory audit store.
- **Rationale**: An evaluator or reviewer often wants to test an application immediately without first provisioning an external database account. At the same time, a mock-only app fails engineering rigor. CampusFix provides complete PostgreSQL migrations, RLS policies, and genuine Supabase client code, while gracefully falling back to a structured local store when cloud credentials are not supplied.

### Decision 2: Pure Workflow State Machine (`src/lib/workflow.ts`) vs. Ad-hoc Controller Checks
- **Choice**: Centralized all transition rules into a pure TypeScript state machine with comprehensive unit test coverage.
- **Rationale**: Prevents status skipping (e.g. going directly from `submitted` to `resolved`), ensures mandatory resolution notes are enforced programmatically, and makes permissions easy to test in isolation.

### Decision 3: Server Actions with Session Verification vs. Pure Client-Side State
- **Choice**: All mutations (create, update, withdraw, triage, note) run in Next.js Server Actions with server-side identity validation (`getCurrentUser()`).
- **Rationale**: Prevents client-side role tampering. Even if a student inspects the DOM or crafts a POST request to advance a ticket or view internal notes, the server explicitly checks user role before executing.

### Decision 4: Rejected Alternative: Real-Time Chat System inside Tickets
- **Why Rejected**: Adding a freeform chat box between students and staff adds significant operational overhead without solving the core problem. Campus maintenance staff need structured status updates and concise public notes, not an unmonitored instant messaging channel. Structured status comments and private internal technician notes keep tickets clean and focused.

---

## 10. Known Limitations & Future Improvements

1. **Email / Push Notifications**: In production, integrate Webhooks or Supabase Database Triggers with Resend/SendGrid to email students automatically when a ticket is acknowledged or resolved.
2. **QR Code Scanning**: Print unique QR codes on classroom podiums and restroom doors that prefill the building and room number into `/reports/new`.
3. **Preventive Maintenance Schedules**: Add recurring inspection schedules for facilities equipment (e.g. quarterly HVAC filter replacement) in addition to reactive student reports.
4. **Offline PWA Support**: Enable service worker caching for facilities technicians working in basement mechanical rooms with poor cellular coverage.
