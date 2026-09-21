# AI-Supplychain Backend

Enterprise Multi-Tenant AI Supply Chain Intelligence, Inventory Optimization & SaaS Operations Platform.

## Canonical Package Management with UV

All backend development, execution, testing, and migration workflows must be run via `uv`:

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
uv run pytest
uv run alembic upgrade head
```
