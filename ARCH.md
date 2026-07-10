# Architecture

This project uses a single Git repository with two npm workspaces:

- `backend/`: Express API, MongoDB/Mongoose persistence, authentication, RBAC, audit
  logging, appointment services, and the Socket.IO server.
- `frontend/`: React SPA, routing, React Query server-state cache, auth context, and the
  Socket.IO client.

The applications share a root lockfile and repository-wide commands, but have separate
source trees, environment configuration, builds, and deployment units.

Backend request flow:

```text
route -> auth/RBAC/validation middleware -> controller -> service -> Mongoose model
```

Appointment booking is protected by a unique `bookingKey` database index. Competing
inserts for the same doctor, date, and start time therefore result in one success and one
HTTP 409 response rather than a check-then-write race.

