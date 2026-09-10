# Database Domain Model & Multi-Tenant Schema

## 1. Relational Database Overview

EMOX utilizes PostgreSQL as the primary relational and vector storage database. The schema is fully normalized and managed with version-controlled Alembic migrations.

---

## 2. Multi-Tenant SaaS Entities

### `organizations`
- `id` (PK, Serial)
- `name` (String, indexed)
- `slug` (String, unique, indexed)
- `plan` (String, default: "starter")
- `is_active` (Boolean, default: True)
- `created_at`, `updated_at` (DateTime)

### `organization_memberships`
- `id` (PK, Serial)
- `user_id` (FK -> `users.id`, Cascade)
- `organization_id` (FK -> `organizations.id`, Cascade)
- `role` (String: SUPER_ADMIN, ORG_ADMIN, MANAGER, ANALYST, MEMBER)
- `is_default` (Boolean)
- `created_at` (DateTime)

---

## 3. Operational Domain Entities

All operational tables contain an indexed `organization_id` foreign key for strict tenant isolation:

- **`products`**: `id`, `name`, `sku` (unique), `category_id`, `price`, `cost_price`, `reorder_point`, `safety_stock`, `lead_time_days`, `organization_id`.
- **`inventory`**: `id`, `product_id` (unique), `warehouse_id`, `current_stock`, `reserved_stock`, `reorder_level`, `safety_stock`, `organization_id`.
- **`suppliers`**: `id`, `name`, `price`, `quality_score`, `delivery_days`, `reliability_score`, `overall_score`, `organization_id`.
- **`purchase_orders`**: `id`, `po_number` (unique), `supplier_id`, `status`, `total_cost`, `expected_delivery`, `created_by`, `approved_by`, `organization_id`.
- **`purchase_order_items`**: `id`, `purchase_order_id`, `product_id`, `quantity`, `received_quantity`, `unit_cost`, `total_cost`.
- **`sales`**: `id`, `product_id`, `order_id`, `quantity_sold`, `sale_date`, `unit_price`, `total_amount`, `currency`, `organization_id`.

---

## 4. AI & RAG Persistence Entities

- **`knowledge_documents`**: `id`, `name`, `document_type`, `file_path`, `mime_type`, `file_size`, `status`, `chunk_count`, `organization_id`.
- **`document_chunks`**: `id`, `document_id`, `chunk_index`, `content`, `metadata_json`, `embedding`.
- **`ai_recommendations`**: `id`, `agent_name`, `entity_type`, `entity_id`, `recommendation`, `confidence`, `suggested_action`, `status`, `organization_id`.
- **`ai_jobs`**: `id`, `job_type`, `status`, `started_at`, `completed_at`, `error`, `result`, `organization_id`.
- **`ai_audit_logs`**: `id`, `user_email`, `agent`, `tool`, `action`, `entity`, `result`, `model`, `timestamp`, `organization_id`.

---

## 5. Migrations Workflow

```bash
# Generate new migration
python -m alembic revision --autogenerate -m "migration_description"

# Apply migrations to database
python -m alembic upgrade head

# Rollback last migration
python -m alembic downgrade -1
```
