# Backend API

Base URL: `/api/v1`. Private endpoints require `Authorization: Bearer <accessToken>`.

| Method | Path | Roles |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Public |
| POST | `/auth/logout` | Authenticated |
| POST | `/admin/departments` | Super Admin |
| POST | `/admin/users` | Super Admin |
| GET | `/doctors?departmentId=` | Authenticated |
| POST | `/doctors/:doctorId/schedules` | Super Admin |
| GET | `/slots?doctorId=&date=YYYY-MM-DD` | Authenticated |
| GET | `/patients/search?query=` | Authenticated |
| POST | `/appointments` | Super Admin, Receptionist |
| GET | `/appointments` | Authenticated; doctors are scoped to themselves |
| PUT | `/appointments/:id` | Authenticated, role-scoped |
| DELETE | `/appointments/:id` | Super Admin, Receptionist |
| POST | `/appointments/:id/arrive` | Super Admin, Receptionist |
| POST | `/appointments/:id/complete` | Super Admin, Doctor |

Appointment list query parameters: `doctorId`, `departmentId`, `status`, `dateFrom`,
`dateTo`, `search`, `page`, `limit`, `sortBy`, and `order`.

Responses consistently use `{ success, message, data, meta }`. Validation errors use
HTTP 422, authentication errors 401, authorization errors 403, missing resources 404,
invalid state or duplicate booking conflicts 409, and unexpected failures 500.

