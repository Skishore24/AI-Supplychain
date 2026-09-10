# Enterprise Security & Governance Architecture

## 1. Security Principles

The EMOX platform implements defense-in-depth security controls across authentication, multi-tenant isolation, AI tool execution, and local inference privacy.

---

## 2. Core Security Controls

### 2.1 100% Local Inference & Zero Data Egress
- All LLM inference and embeddings run locally on the organization's infrastructure via Ollama (`http://localhost:11434`).
- No internal proprietary catalogs, sales transactions, supplier pricing agreements, or employee records are transmitted to third-party APIs.

### 2.2 Role-Based Access Control (RBAC)
- **SUPER_ADMIN**: Global platform management, tenant organization provisioning, and system audits.
- **ORG_ADMIN**: Organization workspace management, billing plans, and member role assignment.
- **MANAGER**: Full operational control, purchase order approval, inventory modifications, and ML retraining.
- **ANALYST**: Read-only access to analytics, forecasting projections, and AI assistant queries.
- **USER / MEMBER**: Basic catalog browsing and store orders.

### 2.3 AI Safety & Tool Execution Guardrails
- Tools are classified into `READ`, `WRITE`, and `ADMIN`.
- Read tools execute dynamically during orchestrator reasoning.
- Write tools (e.g. `create_purchase_order`) require verified JWT authorization from an authenticated Manager or Admin.
- The platform prohibits the LLM from executing raw dynamic SQL or filesystem bash commands.

### 2.4 Prompt Injection Defense
- User chat messages are stripped of known jailbreak prefixes and delimiter overrides before system prompt assembly.
- All agent responses are parsed and validated against typed Pydantic output schemas.

### 2.5 HTTP Security Headers & Rate Limiting
- Automatic headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Sliding window in-memory rate limiter protects `/auth/login` (30 reqs/min) and AI chat endpoints (150 reqs/min).
