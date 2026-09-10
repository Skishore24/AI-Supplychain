# REST API v1 Specification & Endpoints

## 1. Overview & Authentication

All API endpoints are versioned under `/api/v1/...` and accept and return `application/json`.
Protected endpoints require a JWT Bearer token in the HTTP Authorization header:
```http
Authorization: Bearer <access_token>
```

Legacy endpoints (`/api/...`) remain active as an alias for full backward compatibility.

---

## 2. Core Endpoint Index

### 2.1 Health & Diagnostics
- `GET /api/v1/health`: System health status and database engine type.
- `GET /api/v1/ai/health`: Ollama local AI server connectivity and model availability.

### 2.2 Authentication & Organizations
- `POST /api/v1/auth/login`: Authenticate with email/password. Returns JWT access token and user metadata.
- `POST /api/v1/auth/register`: Register new user and provision default tenant workspace.
- `GET /api/v1/auth/me`: Retrieve current authenticated profile.
- `GET /api/v1/organizations`: List organizations accessible to the authenticated user.
- `POST /api/v1/organizations`: Provision a new tenant organization (Assigns creator as ORG_ADMIN).
- `GET /api/v1/organizations/{id}/members`: List organization team members and assigned roles.
- `POST /api/v1/organizations/{id}/members`: Add/invite a team member with specified RBAC role.

### 2.3 Operations & Inventory
- `GET /api/v1/products`: List catalog products with pagination, search, and category filters.
- `POST /api/v1/products`: Create a new product (Requires Manager/Admin).
- `GET /api/v1/inventory`: Physical inventory levels, available stock, and warehouse locations.
- `GET /api/v1/inventory/alerts`: Active low-stock and stockout risk warnings.
- `GET /api/v1/suppliers`: Supplier directory with quality, price, and delivery scores.
- `GET /api/v1/purchase-orders`: List purchase orders by status (`draft`, `pending_approval`, `approved`, `sent`).
- `POST /api/v1/purchase-orders`: Create a purchase order (Requires Manager/Admin authorization).
- `PUT /api/v1/purchase-orders/{id}/status`: Transition PO status (`approve`, `send`, `receive`).

### 2.4 Intelligence, ML & RAG
- `GET /api/v1/forecasting/predict/{product_id}`: Scikit-learn Ridge regression demand forecast.
- `POST /api/v1/ai/chat`: Multi-agent natural language chat with intent routing and tool execution.
- `GET /api/v1/ai/recommendations`: Actionable replenishment and dual-sourcing recommendations.
- `POST /api/v1/knowledge/upload`: Ingest PDF/DOCX/TXT documents with semantic chunking.
- `GET /api/v1/knowledge/documents`: List ingested knowledge documents and indexing status.
- `GET /api/v1/jobs`: Telemetry and status for background ML training and document ingestion jobs.
- `GET /api/v1/analytics/overview`: High-level operations KPI metrics (Revenue, PO totals, Stockout risks).
