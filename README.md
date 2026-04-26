# LMS PAF

Learning Management System with three loosely-coupled feature areas:

- **Resource catalogue** — bookable lecture halls, labs, meeting rooms, and equipment.
- **Maintenance tickets** — incident reporting, technician assignment, comments, attachments.
- **Assessments** — instructor-authored quizzes and assignments with student submissions.

Backend is Spring Boot + MongoDB; frontend is React + Vite + Tailwind. Auth is JWT (HS384) with role-based authorization.

---

## Branch landscape (read this first)

| Branch | What it is | Should you base your work here? |
|---|---|---|
| `main` | Pre-Mongo, pre-auth historical baseline. | No. |
| `develop` | Same era as main; superseded. | No. |
| `Assessment-&-Submission-Service` | Original Mongo conversion of the ticket/auth subsystem. Resource catalogue absent. | No — already merged. |
| `facility-management` | Original facility/resource work on JPA + MySQL. **Preserved as a backup.** | No. |
| **`facility-management-mongo`** | **Current trunk for new work.** All three subsystems on Mongo, real JWT auth, seeded users + facilities. | **Yes — branch off this.** |

Anything you read in `main` or `facility-management` about MySQL, JPA, `@Entity`, `JpaSpecificationExecutor`, `mock-jwt-token-…`, etc. is obsolete. The migration commit on `facility-management-mongo` (`Migrate to MongoDB + add real JWT auth + facility catalogue`) is the source of truth.

---

## Tech stack

**Backend** — Java 17 (compiles cleanly on JDK 22/23), Spring Boot 4.0.5, Spring Data MongoDB, Spring Security, JJWT 0.12.6, Lombok, Maven.

**Frontend** — React 19, TypeScript 6, Vite 8, Tailwind v4, axios, react-hook-form, react-router-dom, lucide-react.

**Database** — MongoDB 5+ (local `mongod` for dev, or Atlas).

---

## Local setup

### Prerequisites
- JDK 17 or newer (we test on 23).
- Maven 3.8+.
- Node.js 18+ and npm.
- MongoDB running locally on `27017` (`mongod`), or an Atlas connection string with your IP whitelisted.

### 1. Clone and switch to the working branch
```
git clone https://github.com/umeshanethmi/LMS-PAF.git
cd LMS-PAF
git checkout facility-management-mongo
```

### 2. Set up `.env`
Copy the template and fill in real values:
```
cp .env.example .env
```
Then edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/lms_assessment_db
JWT_SECRET=<base64-encoded HMAC secret, >=32 bytes>
```
Generate a secret if you need one: `openssl rand -base64 48`.

`.env` is gitignored — never commit it. `application.properties` reads it via `spring.config.import=optional:file:./.env[.properties]`.

### 3. Run the backend
From the project root:
```
mvn spring-boot:run
```
Backend starts on `http://localhost:9090`. On first run, the seeders insert the default users and 7 facility resources into Mongo.

### 4. Run the frontend
```
cd frontend
npm install
npm run dev
```
Vite serves on `http://localhost:5173` (or the next free port). The frontend hits the backend at `http://localhost:9090/api` (hard-coded in `src/services/apiClient.ts` — change there if you re-port the backend).

---

## Default seeded users

`UserService.seedUsers()` inserts these on first startup if they don't already exist. Passwords are BCrypt-hashed.

| Role | Username | Email | Password |
|---|---|---|---|
| SUPERADMIN | `superadmin` | `admin@sliit.lk` | `Admin123` |
| ADMIN | `admin` | `admin@campus.com` | `admin123` |
| INSTRUCTOR | `instructor` | `instructor@sliit.lk` | `instructor123` |
| STUDENT | `student` | `student@sliit.lk` | `student123` |
| TECHNICIAN | `tech` | `tech@campus.com` | `tech123` |
| USER | `user` | `resident@campus.com` | `user123` |

Login accepts **either** username or email — the server checks the value for `@` and routes to `findByEmail` or `findByUsername` accordingly.

---

## Authentication

### Flow
1. `POST /api/auth/login` with `{ "username": "<email-or-username>", "password": "..." }`.
2. Response: `{ id, username, email, role, token }`. The `token` is an HS384 JWT signed with `app.jwt.secret`, expiring after `app.jwt.expiration-ms` (default 24 h).
3. Send `Authorization: Bearer <token>` on every subsequent request. The frontend's `apiClient.ts` attaches this from `localStorage.getItem('token')` automatically.

### Roles and authorization (`SecurityConfig.java`)
The JWT contains a `role` claim mapped to a Spring `ROLE_*` authority.

| Endpoint | Public | Requires auth | Required role |
|---|---|---|---|
| `POST /api/auth/login` | yes | — | — |
| `GET /api/resources`, `GET /api/resources/**` | yes | — | — |
| `POST /api/resources` | — | yes | SUPERADMIN, ADMIN, INSTRUCTOR |
| `PUT/PATCH /api/resources/**` | — | yes | SUPERADMIN, ADMIN, INSTRUCTOR |
| `DELETE /api/resources/**` | — | yes | SUPERADMIN, ADMIN |
| `/api/users/**` | — | yes | SUPERADMIN, ADMIN |
| Everything else under `/api/**` | — | yes | any authenticated role |

Role enums live in `com.lms.assessment.model.user.User.Role`: `SUPERADMIN, ADMIN, INSTRUCTOR, STUDENT, TECHNICIAN, USER`.

### Frontend role mapping
`AuthContext.tsx` collapses backend roles into a binary UI role for the existing facility-management UX:

- `instructor` UI role → SUPERADMIN, ADMIN, INSTRUCTOR, TECHNICIAN
- `student` UI role → STUDENT, USER

If you need a finer-grained UI role gate, read `user.role` (the actual backend role) instead of `role` (the UI alias) from `useAuth()`.

---

## MongoDB collections

Seven collections, all created lazily by Spring Data MongoDB on first write.

### `users`
```
_id              ObjectId
username         string  (unique index)
email            string  (unique index)
password         string  (BCrypt hash)
role             enum    (SUPERADMIN | ADMIN | INSTRUCTOR | STUDENT | TECHNICIAN | USER)
```

### `resources`
The facility catalogue — `Resource.java`. Indexed on `type` and `status` for filtering.
```
_id                ObjectId
name               string
type               enum    (LECTURE_HALL | LAB | MEETING_ROOM | EQUIPMENT)
capacity           int?
location           string
description        string?
status             enum    (ACTIVE | OUT_OF_SERVICE)
availabilityStart  LocalTime?
availabilityEnd    LocalTime?
availableDays      string?  ("MON,TUE,WED" or "MON:08:00-17:00,...")
imageUrl           string?
createdAt          datetime  (auto, @CreatedDate)
updatedAt          datetime  (auto, @LastModifiedDate)
```

### `quizzes`
Quiz with **embedded** questions — there is no separate `quiz_questions` collection.
```
_id                       ObjectId
courseId                  string
createdByInstructorId     string
title, description        string
totalMarks, maxAttempts   int
availableFrom/Until       datetime?
published                 bool
questions[]               embedded QuizQuestion (id, questionText, questionType,
                          options[], correctAnswer, marks)
createdAt, updatedAt      datetime (auto)
```

### `quiz_attempts`
One document per student attempt, with **embedded** answers. Indexed on `quizId` and `studentId`.
```
_id              ObjectId
quizId           string  (ref → quizzes._id)
studentId        string
attemptNumber    int
status           enum-like string  (IN_PROGRESS | COMPLETED)
startedAt, submittedAt   datetime
obtainedMarks    int
answers[]        embedded QuizAnswer (id, questionId → quizzes.questions[].id,
                 givenAnswer, correct, awardedMarks)
```

### `assignments`
```
_id                      ObjectId
courseId                 string
createdByInstructorId    string
title, description       string
dueDate                  datetime
allowedFileTypes         string?  (e.g. ".pdf,.doc,.docx")
maxFileSizeBytes         long?
totalMarks               int
published                bool
createdAt, updatedAt     datetime (auto)
```

### `assignment_submissions`
One document per (assignment, student) pair. Indexed on `assignmentId` and `studentId`.
```
_id              ObjectId
assignmentId     string  (ref → assignments._id)
studentId        string
submittedAt      datetime  (auto, @CreatedDate)
textAnswer       string?
storedFilename   string?  (uuid filename on disk)
originalFilename string?
contentType      string?
fileSize         long?
obtainedMarks    int?
feedback         string?
status           string  (SUBMITTED | LATE | GRADED)
```

### `tickets`, `ticket_comments`, `ticket_attachments`
Maintenance ticketing. See `model/ticket/` for the exact field set. Comments are embedded inside `Ticket`; attachments are stored in `uploads/tickets/` on disk and referenced by filename.

---

## API endpoints

All routes are under `/api`. JSON in/out unless noted otherwise.

### Auth
- `POST /api/auth/login` — `{username, password}` (username may be email) → `{id, username, email, role, token}`.

### Users (admin-only)
- `GET /api/users`
- `DELETE /api/users/{id}`
- `PATCH /api/users/{id}/role?role=SUPERADMIN|...`
- `GET /api/users/technicians`

### Resource catalogue
- `GET /api/resources?type=&minCapacity=&location=&status=` — search/filter (public).
- `GET /api/resources/{id}` (public).
- `POST /api/resources` — create (instructor+).
- `PUT /api/resources/{id}` — update.
- `DELETE /api/resources/{id}` — delete (admin+).
- `PATCH /api/resources/{id}/status?status=ACTIVE|OUT_OF_SERVICE` — toggle availability.

### Quizzes — instructor (`/api/instructor/quizzes`)
- `POST /` — create quiz.
- `GET /{id}`, `PUT /{id}`, `DELETE /{id}`.
- `GET /course/{courseId}` — all quizzes for a course (including unpublished).
- `POST /{id}/questions` — append a question.
- `GET /{id}/questions` — list questions.
- `PUT /questions/{questionId}`, `DELETE /questions/{questionId}` — modify a single question by its embedded id.
- `GET /{id}/attempts/student/{studentId}` — see a specific student's attempts.

### Quizzes — student (`/api/student/quizzes`)
- `GET /course/{courseId}` — only **published** quizzes.
- `GET /{id}`, `GET /{id}/questions`.
- `POST /{id}/attempts/start` — start (or resume an in-progress) attempt. Body: `{studentId}`.
- `POST /attempts/{attemptId}/answers` — submit/update an answer to a single question. Body: `{questionId, givenAnswer}`.
- `POST /attempts/{attemptId}/complete` — finalize (auto-grades and timestamps).
- `GET /{id}/attempts/student/{studentId}` — own attempt history.

### Assignments — instructor (`/api/instructor/assignments`)
- `POST /`, `PUT /{id}`, `DELETE /{id}`, `GET /{id}`, `GET /course/{courseId}`.
- `GET /{id}/submissions` — list all submissions for an assignment.
- `PUT /submissions/{submissionId}/grade?obtainedMarks=&feedback=` — grade a submission.
- `GET /submissions/{submissionId}/file` — download the submitted file.

### Assignments — student (`/api/student/assignments`)
- `GET /course/{courseId}`, `GET /{id}`.
- `POST /{id}/submit` — multipart form: `studentId` (form field), `textAnswer` (optional), `file` (optional). Idempotent per (assignment, student); subsequent submissions overwrite the previous one (and replace the stored file).
- `GET /submissions/{submissionId}`, `GET /submissions/{submissionId}/file`.

### Maintenance tickets (`/api/tickets`)
- `POST /` — create (multipart, optional attachments).
- `GET /?currentUserId=&role=USER|TECHNICIAN|ADMIN` — role-scoped list.
- `GET /{id}`.
- `PUT /{id}/assign?technicianId=&currentUserId=&role=` — assign a technician.
- `PUT /{id}/status?currentUserId=&role=` — body `{status, technicianUserId?}`.
- `PUT /{id}/start?currentUserId=` — technician starts work.
- `POST /{id}/comments` — body `{content}`.
- `PUT /{id}/comments/{commentId}`, `DELETE /{id}/comments/{commentId}`.
- `GET /attachments/{fileName}` — stream a stored attachment.

### Ticket comments (legacy mount; same data)
- `POST /api/comments`, `GET /api/comments/{ticketId}`.

> The ticket endpoints currently take `currentUserId` and `role` as query params instead of deriving them from the JWT — that's a holdover from the pre-auth design. Not a security boundary on its own; `SecurityConfig` still requires a valid JWT to reach these handlers. **TODO**: switch the ticket service to read identity from `SecurityContextHolder` and drop the query params.

---

## Project structure

```
src/main/java/com/lms/assessment/
  AssessmentServiceApplication.java   ← entrypoint
  config/
    MongoConfig.java                  ← @EnableMongoAuditing + Mongo client bean
    SecurityConfig.java               ← stateless JWT, CORS, role-based authz
    ResourceSeeder.java               ← seeds 7 facilities on first boot
  security/
    JwtService.java                   ← issue + parse HS384 tokens
    JwtAuthenticationFilter.java      ← Bearer header → SecurityContext
  model/
    Resource.java, enums/{ResourceType, ResourceStatus}.java
    Quiz, QuizQuestion (embedded), QuizAttempt, QuizAnswer (embedded),
      Assignment, AssignmentSubmission
    user/User.java                    ← Role enum lives here
    ticket/{Ticket, TicketComment, TicketAttachment, ...}.java
  repository/
    AssignmentRepository.java, QuizRepository.java, ...   ← MongoRepository<X, String>
    resource/, ticket/, user/ subfolders
  service/
    UserService.java                  ← seed users + login (issues JWT)
    resource/, ticket/                ← feature services
    AssignmentService(Impl), QuizService(Impl), FileStorageService
  controller/
    user/{AuthController, UserController}
    resource/ResourceController
    {Instructor,Student}{Quiz,Assignment}Controller
    ticket/TicketController, TicketCommentController
  dto/
    resource/, ticket/, user/, plus the assessment DTOs at the package root

frontend/src/
  App.tsx                 ← routes + login form on Home
  contexts/AuthContext.tsx ← real backend login, JWT in localStorage
  components/common/{Sidebar, ProtectedRoute, FileUpload}.tsx
  components/tickets/...   ← ticket UI bits (sourced from Assessment branch)
  pages/
    instructor/{CreateAssignment, CreateQuiz, AssignmentSubmissions, QuizSubmissions}.tsx
    student/{StudentTaskPortal, SubmitAssignment, QuizAttempt}.tsx
    resources/{ResourceCatalogue, ResourceDetail, ResourceForm}.tsx
    maintenance/IncidentTicketsPage.tsx
  services/
    apiClient.ts          ← axios instance with Bearer interceptor
    resourceService.ts, ticketApi.ts
```

---

## Common dev tasks

**Add a new seeded user** — append a `registerUser(...)` call to `UserService.seedUsers()`.

**Add a new resource type** — extend `ResourceType.java` enum + handle the new value in the four `TYPE_*` lookup maps in `frontend/src/pages/resources/ResourceCatalogue.tsx` and `ResourceDetail.tsx`.

**Add a new endpoint** — drop a controller method, decide whether it needs auth (`SecurityConfig.filterChain` has the public path list — anything not in there is `authenticated()`), and bump role rules there if needed. The JWT filter is already wired.

**Reset the database during development** — easiest path is `mongosh` then `use lms_assessment_db; db.dropDatabase()`. Restart the backend and the seeders re-run.

**Re-seed users without dropping the DB** — change a username/email in `UserService.seedUsers()` so the `existsByUsername`/`existsByEmail` check fails, then restart. Or delete the specific document via `mongosh`.

**Talk to the API without the frontend** — log in to grab a token, then:
```
curl -s http://localhost:9090/api/resources \
  -H "Authorization: Bearer <token>"
```
Resource GETs are public, so the token is only needed for write operations.

---

## Things to know / gotchas

- **All ids are `String` (Mongo ObjectId hex)**, not `Long`. If you see `Long id` anywhere it's leftover JPA — file a bug.
- **Embedded sub-documents have their own `id` fields** that we generate as UUID strings (`Quiz.questions[].id`, `QuizAttempt.answers[].id`). They're not Mongo ObjectIds — Mongo doesn't auto-generate ids for embedded objects. The service layer assigns them on insert.
- **Spring Boot 4.x no longer auto-wires Lombok** as a maven-compiler annotation processor. The `pom.xml` declares it explicitly under `annotationProcessorPaths`. If you fork the build, keep that.
- **Atlas may need an IP allowlist update.** If `mongo+srv://...` connections fail with `SSLException: Received fatal alert: internal_error`, your IP isn't on Atlas's Network Access list — add it (or 0.0.0.0/0 for dev) on the Atlas console.
- **`uploads/` is gitignored.** Ticket attachments and assignment submission files land there; don't commit them.
- **Default Spring Security generated password** still prints in the boot log (`Using generated security password: ...`). It's harmless — `UserDetailsServiceAutoConfiguration` still kicks in but our `JwtAuthenticationFilter` runs first. To silence, exclude that auto-config or define an empty `UserDetailsService` bean.
- **Tickets pass `currentUserId` and `role` as query params** — to be moved to `SecurityContextHolder` (see TODO above).

---

## Known TODOs

- SUPERADMIN/ADMIN currently route to the instructor dashboard via the UI role mapping. A real `/admin` console (user management UI, resource oversight) hasn't been built yet — `UserController` exposes the data but no page consumes it.
- Ticket controllers should derive identity from the JWT, not query params.
- Frontend has no token-refresh flow; expired tokens just 401 and the user has to log in again.
- `Sidebar.tsx` and the dashboards under `pages/dashboards/` are leftover Assessment-branch UI not currently routed by `App.tsx`. Either wire them in or delete.
