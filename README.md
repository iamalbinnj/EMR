# Enterprise EMR Appointment Management System

> Special thanks to **Adam Finastra** for providing this assignment and the opportunity to
> demonstrate full-stack MERN development and engineering practices.

## How to run

For development with automatic reload:

```bash
npm install
npm run setup:env
npm run seed -w backend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs at
[http://localhost:4000](http://localhost:4000).

To build and start both production builds:

```bash
npm run build
npm start
```

MongoDB must be running before seeding or starting the backend.

## Project Overview

This project is an Appointment Management module for an Enterprise Electronic Medical
Record system. It supports secure authentication, role-based authorization, doctor
schedules, dynamic slot generation, patient search and creation, concurrency-safe booking,
appointment status management, audit logging, pagination, filtering, and real-time updates.

The application uses one Git repository containing independently structured frontend and
backend applications.

### Technology stack

- MongoDB and Mongoose
- Express.js and Node.js
- React and React Router
- TypeScript on frontend and backend
- Tailwind CSS
- TanStack React Query for server data
- Socket.IO for live scheduler updates
- JWT access and refresh tokens
- Zod request validation

## Folder Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/       
│   │   ├── middleware/   
│   │   ├── models/       
│   │   ├── routes/       
│   │   ├── scripts/      
│   │   ├── services/     
│   │   ├── sockets/      
│   │   ├── types/        
│   │   └── utils/        
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/          
│   │   ├── components/   
│   │   ├── context/      
│   │   ├── hooks/        
│   │   ├── pages/        
│   │   ├── routes/       
│   │   └── types/        
│   └── .env.example
├── scripts/              
└── package.json          
```

## Architecture Overview

The backend follows this request flow:

```text
Route → Authentication/RBAC/Validation → Service → Mongoose Model → API Response
```

Routes handle HTTP input and call services. Services contain business rules and database
operations. Models define data constraints and indexes. A centralized error handler returns
safe and consistent responses.

The frontend keeps display components simple. API requests, state, form submission, and
side effects live in `src/hooks`. React Query manages cached server data, Context manages
authentication and messages, and Socket.IO invalidates live scheduler data.

## Database Design

### Collections

| Collection | Purpose |
|---|---|
| `users` | Login identities, roles and doctor linkage |
| `refresh_tokens` | Hashed, revocable refresh tokens |
| `departments` | Medical departments |
| `doctors` | Doctor profiles and department relationships |
| `doctor_schedules` | Working days, sessions, breaks and slot duration |
| `patients` | Patient demographics and searchable patient codes |
| `appointments` | Patient, doctor, department, slot and status records |
| `audit_logs` | Important user and appointment actions |

### Relationships

```text
Department 1 ── many Doctors
Doctor 1 ── many Doctor Schedules
Doctor 1 ── many Appointments
Patient 1 ── many Appointments
User 1 ── many Refresh Tokens
User 1 ── many Audit Logs
```

### Important indexes

- Unique appointment `bookingKey` prevents double booking.
- Doctor, date, and status index supports scheduler queries.
- Patient and date index supports patient history.
- Department, date, and status index supports filtering and reporting.
- Patient code is unique; patient mobile and name are searchable.
- Refresh-token expiry uses a MongoDB TTL index.

Slots are calculated dynamically from schedules and are not stored as empty future records.

## API Documentation

All endpoints use the `/api/v1` prefix. Private routes require:

```http
Authorization: Bearer <access-token>
```

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Public |
| POST | `/auth/logout` | Authenticated |
| POST | `/admin/departments` | Super Admin |
| POST | `/admin/users` | Super Admin |
| GET | `/doctors` | Authenticated |
| POST | `/doctors/:doctorId/schedules` | Super Admin |
| GET | `/slots?doctorId=&date=` | Authenticated |
| GET | `/patients/search?query=` | Authenticated |
| POST | `/appointments` | Super Admin, Receptionist |
| GET | `/appointments` | Authenticated and role-scoped |
| PUT | `/appointments/:id` | Authenticated and role-scoped |
| DELETE | `/appointments/:id` | Super Admin, Receptionist |
| POST | `/appointments/:id/arrive` | Super Admin, Receptionist |
| POST | `/appointments/:id/complete` | Super Admin, Doctor |

Successful response format:

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {},
  "meta": {}
}
```

More details are available in [backend/API.md](backend/API.md).

## Environment Variables

Create both environment files safely with:

```bash
npm run setup:env
```

Existing `.env` files are not overwritten.

### Backend

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/emr_appointments
FRONTEND_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

Use strong, unique secrets in production and never commit `.env` files.

### Frontend

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

## Installation Instructions

Requirements:

- Node.js LTS
- npm
- MongoDB

Clone and install:

```bash
git clone https://github.com/iamalbinnj/EMR.git
cd EMR
npm install
npm run setup:env
```

Seed sample accounts and schedule data:

```bash
npm run seed -w backend
```

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@emr.local` | `Admin123!` |
| Receptionist | `reception@emr.local` | `Reception123!` |
| Doctor | `doctor@emr.local` | `Doctor123!` |

Seed credentials are for local demonstration only.

## Running the Project

Run frontend and backend together in development:

```bash
npm run dev
```

Run only one application:

```bash
npm run dev -w backend
npm run dev -w frontend
```

Production build and start:

```bash
npm run build
npm start
```





## Assumptions Made

- Dates use the `YYYY-MM-DD` format and appointment times use `HH:mm`.
- A doctor has one active effective schedule for a requested date.
- Cancelled appointments preserve their audit history instead of being deleted.
- Doctor users are linked to one doctor profile and see only their own appointments.
- The seeded schedule runs Monday through Friday with 15-minute slots.
- Access tokens are stored in browser local storage for assessment simplicity.
- The frontend and API are served from the configured trusted origins.

## Known Limitations

- The frontend account screen currently creates receptionist accounts; doctor department
  assignment is available through the API.
- Full schedule management is API-based and has no administration screen yet.
- Consultation notes use the existing appointment update API but have no dedicated editor.
- Automated frontend component tests have not yet been added.
- Local standalone MongoDB uses compensated new-patient booking because transactions require
  a replica set. Production should always use a replica set.
- Refresh tokens and access tokens use local storage for this assessment; production systems
  may prefer secure HTTP-only cookies depending on deployment architecture.
