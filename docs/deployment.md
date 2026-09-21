# Enterprise Deployment & Infrastructure Guide

## 1. Production Deployment Topology

```
                  [ Internet / Clients ]
                            │
                      [ Cloudflare / TLS ]
                            │
               [ Reverse Proxy: NGINX / Caddy ]
                   ┌────────┴────────┐
                   ▼                 ▼
          [ React SPA (Vite) ]   [ FastAPI API (Uvicorn) ]
                                     │
                        ┌────────────┼────────────┐
                        ▼            ▼            ▼
                   [PostgreSQL]   [Ollama]   [Disk Storage]
                   (pgvector)     (11434)    (uploaded_docs)
```

---

## 2. Docker Compose Production Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    environment:
      POSTGRES_DB: supply_chain_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  ollama:
    image: ollama/ollama:latest
    restart: always
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql+psycopg2://postgres:${POSTGRES_PASSWORD}@postgres:5432/supply_chain_db
      JWT_SECRET: ${JWT_SECRET}
      OLLAMA_BASE_URL: http://ollama:11434
    depends_on:
      - postgres
      - ollama
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"

volumes:
  pgdata:
  ollama_models:
```

---

## 3. Production Environment Checklist

1. Generate a 256-bit cryptographically secure `JWT_SECRET`.
2. Ensure database password is set in `.env` (never commit real credentials to source control).
3. Pull required Ollama open-weights models:
   ```bash
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ollama pull llama3.2-vision
   ```
4. Execute database migrations:
   ```bash
   python -m alembic upgrade head
   ```
5. Seed initial benchmark organizations and accounts:
   ```bash
   python seed.py
   ```
