const appointmentListParameters: any[] = [
  ...["doctorId", "departmentId", "status", "dateFrom", "dateTo", "search", "sortBy", "order"].map((name) => ({
    name,
    in: "query",
    schema: { type: "string" },
  })),
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
];

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Enterprise EMR Appointment API",
    version: "1.0.0",
    description:
      "REST API for authentication, doctor schedules, patients, dynamic slots, and appointment management.",
  },
  servers: [{ url: "http://localhost:4000/api/v1", description: "Local API" }],
  tags: [
    { name: "Authentication" },
    { name: "Administration" },
    { name: "Doctors" },
    { name: "Slots" },
    { name: "Patients" },
    { name: "Appointments" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: { type: "object", nullable: true },
          meta: { type: "object" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
          doctorId: { type: "string", nullable: true },
        },
      },
      PatientInput: {
        type: "object",
        required: ["name", "mobile"],
        properties: {
          name: { type: "string", example: "Arjun Kumar" },
          mobile: { type: "string", example: "9876543210" },
          gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
          dob: { type: "string", format: "date" },
          address: { type: "string" },
        },
      },
      Appointment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          patientId: { oneOf: [{ type: "string" }, { type: "object" }] },
          doctorId: { oneOf: [{ type: "string" }, { type: "object" }] },
          departmentId: { oneOf: [{ type: "string" }, { type: "object" }] },
          date: { type: "string", format: "date", example: "2026-07-13" },
          slotStartTime: { type: "string", example: "09:00" },
          slotEndTime: { type: "string", example: "09:15" },
          status: { type: "string", enum: ["SCHEDULED", "ARRIVED", "COMPLETED", "CANCELLED"] },
          purpose: { type: "string" },
          notes: { type: "string" },
        },
      },
      Slot: {
        type: "object",
        properties: {
          startTime: { type: "string", example: "09:00" },
          endTime: { type: "string", example: "09:15" },
          available: { type: "boolean" },
        },
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"], summary: "Log in",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "admin@emr.local" }, password: { type: "string", format: "password", example: "Admin123!" } } } } } },
        responses: { "200": { description: "Login successful" }, "401": { description: "Invalid credentials" }, "422": { description: "Validation error" } },
      },
    },
    "/auth/refresh": {
      post: { tags: ["Authentication"], summary: "Rotate a refresh token", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } } } } }, responses: { "200": { description: "New token pair" }, "401": { description: "Invalid or revoked refresh token" } } },
    },
    "/auth/logout": {
      post: { tags: ["Authentication"], summary: "Revoke a refresh token", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } } } } }, responses: { "200": { description: "Logout successful" }, "401": { description: "Authentication required" } } },
    },
    "/admin/departments": {
      post: { tags: ["Administration"], summary: "Create a department", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", example: "Cardiology" }, description: { type: "string" } } } } } }, responses: { "201": { description: "Department created" }, "403": { description: "Super Admin required" } } },
    },
    "/admin/users": {
      post: { tags: ["Administration"], summary: "Create a receptionist or doctor user", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password", "role"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 }, role: { type: "string", enum: ["RECEPTIONIST", "DOCTOR"] }, departmentId: { type: "string" }, specialization: { type: "string" } } } } } }, responses: { "201": { description: "User created" }, "403": { description: "Super Admin required" } } },
    },
    "/doctors": {
      get: { tags: ["Doctors"], summary: "List active doctors", security: [{ bearerAuth: [] }], parameters: [{ name: "departmentId", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Doctors retrieved" } } },
    },
    "/doctors/{doctorId}/schedules": {
      post: { tags: ["Doctors"], summary: "Create a doctor schedule", security: [{ bearerAuth: [] }], parameters: [{ name: "doctorId", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["workingDays", "sessions", "effectiveFrom"], properties: { workingDays: { type: "array", items: { type: "string", enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] } }, sessions: { type: "array", items: { type: "object", properties: { name: { type: "string" }, startTime: { type: "string" }, endTime: { type: "string" }, slotDurationMinutes: { type: "integer" } } } }, breaks: { type: "array", items: { type: "object", properties: { startTime: { type: "string" }, endTime: { type: "string" }, label: { type: "string" } } } }, effectiveFrom: { type: "string", format: "date" }, effectiveTo: { type: "string", format: "date" } } } } } }, responses: { "201": { description: "Schedule created" }, "422": { description: "Invalid or overlapping schedule" } } },
    },
    "/slots": {
      get: { tags: ["Slots"], summary: "Get dynamically generated doctor slots", security: [{ bearerAuth: [] }], parameters: [{ name: "doctorId", in: "query", required: true, schema: { type: "string" } }, { name: "date", in: "query", required: true, schema: { type: "string", format: "date" } }], responses: { "200": { description: "Slots retrieved", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Slot" } } } } } } } } },
    },
    "/patients/search": {
      get: { tags: ["Patients"], summary: "Search patients by code, name, or mobile", security: [{ bearerAuth: [] }], parameters: [{ name: "query", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Patients retrieved" } } },
    },
    "/appointments": {
      get: { tags: ["Appointments"], summary: "List and filter appointments", security: [{ bearerAuth: [] }], parameters: appointmentListParameters, responses: { "200": { description: "Paginated appointments" } } },
      post: { tags: ["Appointments"], summary: "Book an appointment", description: "Provide either patientId or patient for a new patient. A unique database constraint prevents double booking.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["doctorId", "date", "slotStartTime"], properties: { patientId: { type: "string" }, patient: { $ref: "#/components/schemas/PatientInput" }, doctorId: { type: "string" }, date: { type: "string", format: "date" }, slotStartTime: { type: "string", example: "09:00" }, purpose: { type: "string" }, notes: { type: "string" } } } } } }, responses: { "201": { description: "Appointment created" }, "409": { description: "Slot already booked" }, "422": { description: "Invalid or unavailable slot" } } },
    },
    "/appointments/{id}": {
      put: { tags: ["Appointments"], summary: "Update appointment purpose or notes", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { purpose: { type: "string" }, notes: { type: "string" } } } } } }, responses: { "200": { description: "Appointment updated" }, "404": { description: "Appointment not found" } } },
      delete: { tags: ["Appointments"], summary: "Cancel an appointment", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Appointment cancelled" }, "409": { description: "Invalid status transition" } } },
    },
    "/appointments/{id}/arrive": {
      post: { tags: ["Appointments"], summary: "Mark patient as arrived", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Patient marked as arrived" }, "409": { description: "Invalid status transition" } } },
    },
    "/appointments/{id}/complete": {
      post: { tags: ["Appointments"], summary: "Complete an arrived appointment", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Appointment completed" }, "409": { description: "Invalid status transition" } } },
    },
  },
} as const;
