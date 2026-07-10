# Enterprise EMR Appointment Management

One Git repository contains two separately deployable TypeScript applications:

```text
.
├── backend/       # Node.js, Express, MongoDB, Mongoose, Socket.IO
├── frontend/      # React, Vite, React Router, React Query, Socket.IO client
├── ARCH.md
├── TICKET.md
└── package.json   # npm workspaces and repository-wide commands
```

## Getting started

1. Install dependencies from the repository root with `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`.
3. Run both applications with `npm run dev`.

The frontend and backend keep independent source trees, environment files, TypeScript
configuration, build output, and deployment targets. The root npm workspace provides a
single lockfile and convenient commands without coupling the applications at runtime.

