# 📋 Tasks Management – Lateral Group Technical Assessment Project

This project is a **Lateral Group Tasks Management application**, built as a Technical Assessment to demonstrate clean architecture, pragmatic engineering decisions and production-ready patterns — without unnecessary over-engineering.

The solution prioritizes **clarity, maintainability, and correctness**, applying modern backend and frontend practices.

---

## 🧱 Tech Stack

### Backend
- .NET 10 (LTS)
- ASP.NET Minimal APIs
- Entity Framework Core
- PostgreSQL
- FluentValidation
- Result Pattern (no exceptions for business flow)
- xUnit + NSubstitute

### Frontend
- React + TypeScript
- Vite
- Material UI (MUI)
- React Hooks (no external state libraries)
- Vitest + Testing Library

### DevOps
- Docker
- Docker Compose
- Multi-container setup (API, Frontend, Database)

---

## 🧠 Backend Architecture

The backend follows **Clean Architecture principles**, enforcing clear boundaries between layers and keeping business rules isolated from infrastructure concerns.

### Layers

#### Domain
- Core entities (`TaskItem`)
- Enums (`TaskItemStatus`)
- Business rules (status transitions)
- No framework dependencies

#### Application
- Use cases (`TasksUseCases`)
- DTOs / Requests
- Validators (FluentValidation)
- Result pattern (`Result<T>`, `ResultError`)
- Interfaces (repositories, use cases)

#### Infrastructure
- Entity Framework Core
- PostgreSQL implementation
- Repository implementations
- Database migrations

#### API
- ASP.NET Core Minimal APIs
- Endpoint mapping
- Endpoint filters (FluentValidation)
- Result → HTTP mapping
- OpenAPI / Scalar documentation

---

## 🔁 Status Rules (Business Logic)

Tasks follow a **strict forward-only workflow**:

- `Pending` → `InProgress`
- `InProgress` → `Finished`
- `Finished` → ❌ (locked)

These rules are:
- Enforced in the **application layer**
- Validated at the **API boundary**
- Reflected in the **frontend UI**

---

## 📦 Result Pattern & Error Handling (Backend)

The backend never throws exceptions for business flow.

All operations return a `Result` or `Result<T>`.

### Error Model

Each error contains:
- `Code`
- `Message`
- `Type` (`Validation`, `NotFound`, `Conflict`, `Forbidden`, `Unexpected`)
- Optional `Field`

### HTTP Mapping

A centralized HTTP mapper converts results into proper HTTP responses:

- **400 / 422** → Validation errors
- **403** → Forbidden
- **404** → Not Found
- **409** → Conflict

---

## 📖 API Documentation

The API is documented using **OpenAPI** and exposed via **Scalar** (modern Swagger alternative).

Once the application is running, access:

https://localhost:5001/scalar


### Documented Endpoints
- List tasks (paged)
- Create task
- Update task status
- Bulk update task status

All request and response schemas are fully described.

---

## 🖥️ Frontend Architecture

The frontend follows a **feature-based structure**, keeping concerns well separated.

```text
frontend/
 ├── ui
	└── tasks
	├── pages
	├── components
	├── hooks
 ├── domain
 ├── services
 ```
 
### Folder Responsibilities

#### `ui/`
Contains everything related to **presentation and user interaction**.

- **Purpose:** Render UI, handle user input, and delegate behavior to hooks.
- **Rules:** No direct API calls, no business rules.

##### `ui/tasks/pages`
- **Purpose:** Page-level components (screens).
- **Responsibilities:**
  - Compose hooks and UI components
  - Orchestrate dialogs and page layout
  - Wire user actions to hooks
- **Example:** `TasksPage`

##### `ui/tasks/components`
- **Purpose:** Reusable UI components.
- **Responsibilities:**
  - Render visual elements
  - Emit events via props
  - Remain mostly stateless
- **Examples:** `StatusDialog`, `TasksList`

##### `ui/tasks/hooks`
- **Purpose:** Encapsulate business orchestration and side effects.
- **Responsibilities:**
  - Call services
  - Apply business rules duplicated from backend (UX safety)
  - Manage local UI state (loading, errors, selection)
- **Example:** `useTasksPage`

---

#### `domain/`
Contains **pure domain contracts and models**.

- **Purpose:** Define what the application *is*, not how it works.
- **Rules:** No framework or UI dependencies.

- **Includes:**
  - Entity models (`Task`)
  - Shared types (`PagedResult`)
  - Service interfaces (`ITasksService`)

This layer allows the UI and services to depend on **abstractions**, not implementations.

---

#### `services/`
Contains **infrastructure code** for external communication.

- **Purpose:** Handle HTTP communication with the backend.
- **Responsibilities:**
  - Call API endpoints
  - Translate backend errors into user-friendly messages
  - Return typed data to hooks
- **Examples:** `TasksService`, `httpError`

---

### Architectural Flow

```text
UI (Pages / Components)
↓
Hooks
↓
Services
↓
Backend API
```


This structure ensures:
- Clear separation of concerns
- Easy testability (hooks and services mocked independently)
- Predictable data flow
- Scalable growth without refactors

### Key Concepts
- Business rules duplicated on the client for UX safety
- Hooks encapsulate orchestration and side effects
- UI components are mostly stateless
- Centralized error handling

---

## ⚠️ Error Handling (Frontend)

Backend errors are translated into user-friendly messages through a centralized mapper.

### Handled Scenarios
- Validation errors (`ValidationProblemDetails`)
- Business rule violations (`ProblemDetails`)
- Network or unexpected errors

### Guarantees
- No raw HTTP errors shown to users
- Clear, actionable feedback

---

## 🧪 Testing Strategy

### Backend Tests
- Unit tests per layer
- Validators fully covered
- Use cases tested in isolation
- No over-engineered integration tests (appropriate for take-home scope)

### Frontend Tests
- Hook tests (`useTasksPage`)
- Component tests (`StatusDialog`, `TasksPage`)
- Service tests (`TasksService`)
- Error mapping tests (`httpError`)

Tests focus on **behavior**, not implementation details.

---

## 🐳 Running with Docker

### Prerequisites
- Docker
- Docker Compose

### Start the Application

```sh
docker-compose up --build
```

### Available Services

| Service | URL | 
|---------|-----|
| Frontend  | http://localhost:5173  |
| Backend  | https://localhost:5001  |
| API Docs  | https://localhost:5001/scalar  |
| PostgreSQL | localhost:5432 |

Database migrations are applied automatically on startup.

### 📂 Project Structure

```text
backend/
 ├── src/
 │   ├── Domain
 │   ├── Application
 │   ├── Infrastructure
 │   └── API
 └── tests/
     ├── Application.UnitTests
     ├── API.UnitTests

frontend/
 ├── ui
 ├── domain
 ├── services
 └── tests
```

### 🚀 Possible Improvements (Future Versions)

This project intentionally keeps a pragmatic scope, but several enhancements could be introduced in future versions to improve **security, scalability, resilience, and user experience**.

#### 🔐 API Security & Reliability
- **Rate limiting** (per IP / per user) to protect against abuse and brute-force attacks
- **Idempotency keys** for write operations (especially `POST` and `PUT`) to prevent duplicated processing in retry scenarios
- **Request correlation IDs** propagated across logs and responses
- **Improved validation error details** with standardized error codes per rule
- **Global exception handling** with structured logging
- **API versioning strategy** (`/v1`, `/v2`) to support backward compatibility
- **CORS hardening** and stricter allowed origins
- **HTTPS enforcement and HSTS**
- **Security headers** (Content Security Policy, X-Content-Type-Options, etc.)
- **Audit logging** for sensitive operations (status updates, bulk actions)

---

#### 🔑 Authentication & Authorization
- **Authentication layer** (JWT or OAuth2 / OpenID Connect)
- **Role-based authorization** (e.g., Admin, User, Read-only)
- **Per-action authorization rules** (who can bulk update, finish tasks, etc.)
- **Token refresh and revocation strategy**

---

#### 🧠 Domain & Backend Enhancements
- **Soft delete** instead of hard delete
- **Audit trail** for task status changes
- **Optimistic concurrency control** (row versioning)
- **Event-driven notifications** on task changes
- **Background jobs** for async processing
- **Database indexes and performance tuning**
- **Outbox pattern** for reliable event publishing

---

#### 🖥️ Frontend Improvements
- **Optimistic UI updates**
- **Global toast / notification system**
- **Retry UI for transient failures**
- **Better empty / error states**
- **Accessibility (ARIA, keyboard navigation)**
- **Internationalization (i18n)**
- **Improved loading skeletons**
- **Client-side caching strategies**

---

#### 🧪 Testing & Quality
- **Contract tests** between frontend and backend
- **End-to-end tests** (Playwright / Cypress)
- **Mutation testing** for critical business rules
- **Static analysis and security scanning**
- **Performance and load testing**

---

#### 🚀 DevOps & Delivery
- **CI/CD pipelines**
- **Automated database migrations**
- **Environment-based configuration**
- **Health checks and readiness probes**
- **Centralized logging and metrics**
- **Feature flags**
- **Blue/green or canary deployments**

---

These improvements would elevate the solution from a take-home assignment to a **production-grade system**, while preserving the same architectural foundations.


###✅Final Notes

This project intentionally balances engineering rigor with pragmatism, aiming to reflect how a real production system would be designed — without unnecessary complexity for a take-home assignment.

If you have any questions or want to discuss architectural decisions, feel free to ask.