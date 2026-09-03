# 🚀 Multi-Agent Supply Chain AI & Commerce Platform

An enterprise-grade autonomous supply chain intelligence and e-commerce platform powered by multi-agent decision models, predictive demand forecasting, and real-time inventory optimization.

---

## 🌟 Key Features

### 🛒 Customer E-Commerce Store
- **Store Catalog**: Interactive product browsing with search, category filtering, and price sorting.
- **Product Intelligence**: Component details with real-time stock levels and live AI Supplier ranking insights.
- **Dynamic Shopping Cart**: Global persistent cart with live badge counters, quantity adjustments, tax/shipping calculations, and instant feedback.
- **Autonomous Checkout**: 1-click order placement that automatically decrements active warehouse stock and creates sales records.
- **Order Tracking**: Real-time shipment log and order history.

### 📊 Multi-Agent Supply Chain Admin Hub
- **Executive Dashboard**: KPI summary cards (Total Revenue, Inventory Valuation, Low-Stock Risks, Supply Health Score) and 1-click autonomous stock reordering.
- **Product Catalog Management**: Full CRUD (Create, Read, Update, Delete) with SKU enforcement and technical specifications.
- **Supplier AI Optimization Engine (Agent 1)**: Multi-criteria evaluation combining unit quote (40%), quality reliability (35%), and delivery lead-time (25%) with explainable rankings.
- **Inventory & Reorder Hub (Agent 2)**: Real-time stock monitor, safety reorder thresholds, and stockout mitigation alerts.
- **Sales & Demand Intelligence (Agent 3)**: Transaction audit logs, revenue analytics, and category demand breakdowns.
- **Multi-Agent Control Center**: Interactive agent simulators and 1-click sample database verification/seeding.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL with resilient fallback, Pydantic schemas, CORS Middleware.
- **Frontend**: React 19, Vite, React Router DOM v7, Tailwind CSS v4, Lucide Icons, Context API with localStorage persistence.

---

## ⚡ Quick Start Guide

### 1. Start the Backend API

```bash
cd backend

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs & Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 2. Start the Frontend Application

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Start Vite development server
npm run dev
```
- Frontend Web App: `http://localhost:5173` (or the port Vite outputs)

---

## 🤖 Multi-Agent System Breakdown

| Agent | Responsibility | Key Formula / Logic |
|---|---|---|
| **Agent 1: Supplier Optimizer** | Selects optimal vendor for every SKU | $Score = (PriceScore \times 0.40) + (Quality \times 0.35) + (DeliveryScore \times 0.25)$ |
| **Agent 2: Restock Analyzer** | Prevents stockouts & generates purchase payloads | Triggers warning when $Stock \le ReorderLevel$; Suggests $2 \times ReorderLevel - Stock$ |
| **Agent 3: Demand Forecaster** | Analyzes transaction velocity & inventory run-rate | Categorizes sales distribution and tracks category demand velocity |