# Local Developer Onboarding & Testing Guide

## 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 15+ (local or container)
- Ollama CLI ([Download](https://ollama.com/))

---

## 2. Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/Skishore24/AI-Supplychain.git
cd AI-Supplychain

# 2. Setup backend virtual environment
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# 3. Apply database migrations & seed benchmark data
python -m alembic upgrade head
python seed.py

# 4. Start backend server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# 5. In a separate terminal, start frontend
cd ../frontend
npm install
npm run dev
```

---

## 3. Running Automated Tests

```bash
# Multi-tenant and security tests
python -m pytest tests/test_saas_platform.py -v

# AI platform tests (Ollama, agents, ML forecasting, RAG)
python -m pytest tests/test_ai_platform.py -v

# Full end-to-end regression suite
python tests/test_e2e_platform.py

# Frontend production build validation
cd frontend && npm run build
```
