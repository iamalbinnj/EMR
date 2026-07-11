# Engineering Decisions

This document explains the main technical decisions made for the Enterprise EMR
Appointment Management System. The decisions prioritize correctness, maintainability,
security, and a clear path from an assessment-sized application to a production system.

## 1. Why I chose this project architecture

I used a single Git repository with separate `frontend` and `backend` npm workspaces. This
keeps installation and repository management simple while allowing each application to
have its own source structure, environment variables, build process, and deployment unit.
The frontend and backend are not coupled at runtime and could be deployed independently.

The backend follows this flow:

```text
Route → Middleware → Service → Mongoose Model → Response
```

- **Routes** define endpoints and translate HTTP input into service calls.
- **Middleware** handles authentication, role authorization, validation, request IDs, and
  centralized error handling.
- **Services** contain appointment, schedule, slot, authentication, and audit business
  rules. Database operations remain outside UI and transport code.
- **Models** define MongoDB document structure, relationships, validation, and indexes.
- **Utilities** provide reusable JWT, logging, error, and response behavior.

This separation makes business rules easier to test and prevents Express-specific details
from spreading throughout the application. For example, slot generation is a pure service
function that can be tested without starting Express or MongoDB.

On the frontend, presentational components and pages are kept simple. API calls, form state,
side effects, and reusable behavior live in `src/hooks`. Axios provides one configured HTTP
client, React Query manages cached server reads, Context stores authentication and toast
messages, and Socket.IO triggers live cache refreshes.

I did not introduce Redux because the application has limited client-owned global state.
Most data belongs to the API, so React Query plus small Context providers is sufficient and
requires less boilerplate.

## 2. How I designed the MongoDB schema

I created separate collections for distinct business entities:

- `users`: login identity, password hash, role, active state, and optional doctor link.
- `refresh_tokens`: hashed refresh tokens, expiry, and revocation state.
- `departments`: department master data.
- `doctors`: doctor profile, specialization, user, and department relationships.
- `doctor_schedules`: working days, sessions, breaks, slot duration, and effective dates.
- `patients`: patient code, demographics, mobile number, and contact information.
- `appointments`: patient, doctor, department, date, time, status, purpose, and notes.
- `audit_logs`: actor, role, action, entity, metadata, IP address, and timestamp.

I used MongoDB references rather than embedding complete patient or doctor records inside an
appointment. Patients and doctors are shared across many appointments, so embedding would
duplicate mutable data. References keep ownership clear and allow current patient and doctor
details to be populated when reading appointments.

The appointment also stores `departmentId`. Although the department can be found through
the doctor, storing it on the appointment preserves the department used when the appointment
was made and supports efficient department/date reporting without an extra lookup.

Appointment dates are stored as `YYYY-MM-DD` and times as `HH:mm`. This matches the domain's
date-only and local clinic-time requirements and makes doctor/date/slot keys predictable.
A production system serving multiple clinic time zones would also store the clinic time zone
and normalized UTC instants.

Doctor schedules use `effectiveFrom` and `effectiveTo` so schedule changes can be versioned.
Future slots are not stored as documents. They are calculated on demand from sessions,
duration, working days, and breaks, avoiding millions of unused slot records.

## 3. How I prevented double booking

Each appointment has a `bookingKey`:

```text
doctorId_date_slotStartTime
```

MongoDB enforces a unique index on this value. Appointment creation uses one database insert.
If two receptionists submit the same doctor, date, and start time concurrently, both requests
may initially observe the slot as available, but only one insert can satisfy the unique
constraint. The second receives MongoDB error `E11000`, which the service converts to:

```text
409 Conflict — Slot already booked
```

The unique database constraint is the source of correctness. An application-only
"check availability, then insert" approach would contain a race between the check and the
write and would also fail when multiple API instances are running.

When an appointment is created with a new patient, a MongoDB transaction creates the patient
and appointment atomically when the database is a replica set. For convenient local testing,
standalone MongoDB uses a compensated fallback: if appointment creation fails, the newly
created patient is removed. Production should use a replica set so the transaction provides
the stronger guarantee.

The repository also contains a concurrency script that sends multiple parallel inserts for
one booking key and verifies that exactly one succeeds.

## 4. Database indexes and why they were created

### Appointments

| Index | Reason |
|---|---|
| `{ bookingKey: 1 }`, unique | Guarantees that one doctor slot cannot be booked twice |
| `{ doctorId: 1, date: 1, status: 1 }` | Supports scheduler and doctor appointment queries |
| `{ patientId: 1, date: -1 }` | Supports patient history in newest-first order |
| `{ date: 1, departmentId: 1, status: 1 }` | Supports department, date, status, and reporting filters |

### Patients

| Index | Reason |
|---|---|
| `{ patientCode: 1 }`, unique | Provides a unique human-readable patient identifier |
| `{ mobile: 1 }` | Supports receptionist search by mobile number |
| Text/name index | Supports patient-name search |

### Schedules, tokens, and audit logs

| Index | Reason |
|---|---|
| `{ doctorId: 1, effectiveFrom: -1 }` | Finds the most recent effective doctor schedule |
| Refresh token `{ userId: 1 }` | Supports token lookup and user token management |
| TTL index on `refresh_tokens.expiresAt` | Automatically removes expired refresh-token records |
| `{ entity: 1, entityId: 1, createdAt: -1 }` | Supports chronological audit history for an entity |

Indexes were selected from actual endpoint filter patterns. They improve reads but add write
and storage cost, so I avoided indexing every field. In production, I would validate these
choices using MongoDB `explain()` and real query metrics.

## 5. Security measures implemented

- Passwords are hashed with bcrypt using a work factor of 12. Plain passwords are never
  stored or returned.
- Access tokens are short-lived JWTs and private endpoints require a valid bearer token.
- Refresh tokens are stored as SHA-256 hashes, rotated after use, revocable on logout, and
  removed automatically after expiry.
- Role middleware restricts Super Admin, Receptionist, and Doctor operations.
- Doctor appointment queries are scoped in the service layer to the authenticated doctor's
  ID. This prevents bypassing the rule by changing URL query parameters.
- Zod validates request bodies and rejects malformed or unexpected data before services run.
- Helmet supplies secure HTTP response headers.
- CORS is restricted to the configured frontend origin.
- Centralized error handling returns safe messages and does not expose stack traces or
  internal database errors to clients.
- Sensitive values are read from environment variables rather than source code.
- The password hash uses `select: false`, reducing the chance of accidental API exposure.
- Socket.IO verifies the access token during the connection handshake.
- Login, logout, appointment creation, update, and cancellation produce audit records.
- Request IDs are returned and attached to logs to support investigation and tracing.

For a production deployment, I would additionally use HTTPS everywhere, secret management,
HTTP-only secure cookies where appropriate, strict Content Security Policy, account lockout
or adaptive rate limits, refresh-token reuse detection, and regular dependency scanning.

## 6. Performance optimizations applied

- Compound indexes match the primary appointment filters.
- Read-only Mongoose queries use `.lean()` to avoid document hydration overhead.
- Queries use field projections where only a subset of fields is required.
- Appointment lists use server-side filtering, sorting, and pagination with a bounded page
  size, preventing the entire collection from being transferred.
- Patient search results are limited.
- Slots are generated dynamically rather than pre-created for every future day.
- Existing bookings are converted to a `Set`, providing constant-time availability checks
  during slot generation.
- React Query caches doctors, slots, patients, and appointments and prevents avoidable
  duplicate requests.
- Socket.IO rooms are scoped by doctor and date, so clients receive only relevant appointment
  events rather than all system activity.
- Socket events refresh the relevant cached data instead of requiring frequent polling.
- API responses use a consistent envelope and return only required populated fields.

Offset pagination is appropriate for this assessment and small administrative result sets.
For deep pages at production scale, I would replace it with cursor-based pagination.

## 7. Scaling to millions of appointments

If the system needed to support millions of appointments, I would make the following changes:

### Data and query scaling

- Replace offset pagination with cursor pagination using a stable compound cursor such as
  date plus `_id`.
- Archive old completed and cancelled appointments to a cold collection or object storage,
  keeping the operational collection small.
- Re-evaluate compound indexes using production query telemetry and remove unused indexes.
- Introduce MongoDB read replicas for reporting and patient-history reads.
- Shard appointments using a key derived from measured access patterns. A doctor/date-based
  strategy can keep scheduler queries targeted, but shard-key selection must also avoid hot
  doctors and uneven write distribution.

### Application scaling

- Run multiple stateless API instances behind a load balancer.
- Use Redis to cache doctor schedules and reusable slot templates because schedules change
  much less frequently than they are read.
- Use the Socket.IO Redis adapter so room events reach clients connected to different API
  instances.
- Move audit logging and non-critical notifications to a durable queue such as Kafka,
  RabbitMQ, or a managed queue, reducing booking-request latency.
- Apply rate limiting and backpressure to protect booking endpoints during traffic spikes.
- Keep MongoDB's unique booking constraint even after horizontal scaling because distributed
  application locks alone are not a sufficient correctness boundary.

### Reliability and operations

- Deploy MongoDB as a production replica set with tested backups and point-in-time recovery.
- Add idempotency keys to booking requests so safe retries cannot create duplicate operations.
- Add structured metrics for booking latency, conflicts, errors, socket connections, and
  database query duration.
- Add distributed tracing and centralized logs using request correlation IDs.
- Use health/readiness probes, automated deployment rollback, and zero-downtime migrations.
- Load-test realistic doctor/date access patterns and capacity-plan from measured results.

These changes would preserve the same core service boundaries while allowing the API,
database reads, real-time events, and background work to scale independently.
