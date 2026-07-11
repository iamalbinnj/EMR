# EMR Backend

Production-oriented Express and MongoDB API for appointment management.

## Run

```bash
cp .env.example .env
npm install
npm run seed -w backend
npm run dev -w backend
```

MongoDB must be running. A replica set is required for the new-patient-and-appointment
transaction; existing-patient booking works with a standalone MongoDB instance.

## Architecture

Routes apply authentication, RBAC, and validation before calling services. Services own
business rules and database access. Mongoose models enforce schema and index invariants.
The unique appointment `bookingKey` is the final concurrency boundary, guaranteeing only
one insert per doctor/date/start time across processes.

Run `npm test -w backend` for deterministic slot tests and
`npm run test:concurrency -w backend` against a seeded database for the parallel-booking
verification.

