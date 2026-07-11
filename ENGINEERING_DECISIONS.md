# Engineering Decisions

The backend uses route → middleware → service → model separation so transport concerns,
authorization, business rules, and persistence can evolve independently. MongoDB
collections model users, doctors, schedules, departments, patients, appointments, refresh
tokens, and audit logs; references preserve clear ownership while targeted population keeps
API payloads useful.

Double booking is prevented by a unique `bookingKey` composed from doctor, date, and slot
start. Slot availability checks improve error messages, but the atomic MongoDB constraint is
the source of correctness during races. Compound indexes support doctor/date/status,
patient history, department/date reporting, token expiry, and audit lookups.

Security includes bcrypt password hashing, short-lived access tokens, hashed and rotated
refresh tokens, RBAC, schema validation, Helmet, restricted CORS, safe error envelopes, and
no sensitive-field selection. Performance measures include lean reads, projections,
pagination, bounded limits, indexed filters, on-demand slots, and room-scoped WebSockets.

At millions of appointments, the next steps are cursor pagination, archival, read replicas,
Redis schedule caching and Socket.IO adapter, horizontally scaled APIs, asynchronous audit
events, and a shard key selected from measured doctor/date access patterns.

