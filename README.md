# 📋 Tasks Management – Lateral Group Technical Assessment Project

This project is a **Lateral Group Tasks Management application**, built as a Technical Assessment to demonstrate clean architecture, pragmatic engineering decisions, and production-ready patterns — without unnecessary over-engineering.

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
- Database migrations (applied automatically on startup)

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

All request and response schemas are fully described and versioned.d

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
 ├── tests
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

#### `tests/`
- **Purpose:** - **Purpose:** Provides consistent Material-UI theming and baseline styles for component tests.
- **Responsibilities:**
  - Applies a shared MUI theme and disables button ripple effects.
  - Injects CssBaseline for global style normalization.
  - Supports optional custom wrappers for extra providers.
- **Example:** `TestUtils`

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

### How to run

1. **Install Docker**  
   Download and install Docker from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) and ensure it is running on your machine.
2. **Clone the repository** and navigate to the project root. (LateralTest)
3. **Start the services** using Docker Compose command in cmd:
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

These items represent common production concerns and are intentionally not part of the take-home scope.

This project intentionally keeps a pragmatic scope suitable for a take-home assignment.  
In a real-world production scenario, the following improvements could be incrementally introduced to enhance security, reliability, and user experience.

---

#### 🔐 API Security & Reliability
- **Rate limiting** to protect against abuse
- **Request correlation IDs** for end-to-end tracing
- **API versioning strategy** to preserve backward compatibility
- **CORS hardening** and standard **security headers**
- **HTTPS enforcement** and **HSTS**
- **Secure secrets management** using environment-based configuration
- **Input validation and request size limits**

---

#### 🔑 Authentication & Authorization
- **Authentication layer** (JWT or OAuth2 / OpenID Connect)
- **Role-based authorization**
- **Fine-grained access rules** for sensitive operations
- **Token refresh and revocation strategy**

> Authentication and authorization were intentionally excluded to keep the focus on core domain logic.

---

#### 🧠 Domain & Backend Enhancements
- **Audit trail** for task status changes
- **Optimistic concurrency control** to prevent lost updates
- **Background processing** for non-blocking operations
- **Stronger database constraints** to enforce data integrity

---

#### 🖥️ Frontend Improvements
- **Filtering and searching** by task name and status
- **Optimistic UI updates** for better perceived performance
- **Global notifications and error handling**
- **Improved empty, loading, and error states**
- **Accessibility (a11y) improvements**

---

#### 🧪 Testing & Quality
- **End-to-end tests** for critical user flows
- **Contract tests** between frontend and backend
- **Static analysis and security scanning**
- **Performance testing** for core endpoints

---

#### 🚀 DevOps & Observability
- **CI/CD pipelines**
- **Environment-based configuration**
- **Health checks and readiness probes**
- **Centralized logging, metrics, and tracing**

---

These improvements were intentionally left out of the current version to avoid over-engineering, while clearly outlining how the system could evolve into a production-grade solution.

### ✅Final Notes

This project intentionally balances engineering rigor with pragmatism, aiming to reflect how a real production system would be designed — without unnecessary complexity for a take-home assignment.

If you have any questions or want to discuss architectural decisions, feel free to ask.