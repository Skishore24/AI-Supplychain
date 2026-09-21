# Multi-Agent System Architecture & Specifications

## 1. Multi-Agent Overview

The platform deploys five specialized AI agents operating under an Orchestrator. Every agent adheres to a strict contract:
1. **Deterministic Grounding**: The agent computes mathematical calculations directly against database records.
2. **Safety Classification**: Tools are strictly segregated into `READ`, `WRITE`, and `ADMIN`.
3. **Human-in-the-Loop Safeguard**: Agents cannot autonomously commit financial transactions; purchase order recommendations require human approval.

---

## 2. Agent Specifications

### 2.1 Supplier Agent (`SupplierAgent`)
- **Responsibility**: Multi-factor vendor evaluation, dual-sourcing recommendations, and price/quality/delivery trade-offs.
- **Scoring Formula**:
  $$\text{Score} = (\text{PriceScore} \times 0.40) + (\text{QualityScore} \times 0.30) + (\text{DeliveryScore} \times 0.20) + (\text{ReliabilityScore} \times 0.10)$$
- **Output Schema**:
  - `winner_id`: Optimal supplier ID
  - `winner_name`: Vendor name
  - `score`: Composite score (0-100)
  - `rankings`: Full sorted vendor comparison list
  - `dual_sourcing_recommendation`: Secondary vendor to mitigate supply bottlenecks
  - `explanation`: Natural language summary synthesized by Ollama

### 2.2 Inventory Agent (`InventoryAgent`)
- **Responsibility**: Prevent stockouts, monitor consumption velocity, and maintain dynamic safety stock buffers.
- **Core Formulas**:
  $$\text{Daily Velocity } d = \frac{\sum \text{Sales}_{\text{30d}}}{30}$$
  $$\text{Lead-Time Demand } D_L = d \times L$$
  $$\text{Reorder Point } ROP = D_L + SS$$
  $$\text{Coverage Days} = \frac{\text{Current Stock}}{d}$$
- **Output Schema**:
  - `reorder_required`: Boolean
  - `current_stock`: Physical units
  - `reorder_point`: Calculated threshold
  - `safety_stock`: Minimum emergency buffer
  - `coverage_days`: Days before stockout
  - `recommended_reorder_qty`: Suggested order quantity

### 2.3 Demand Forecast Agent (`DemandAgent`)
- **Responsibility**: Machine learning velocity projections and seasonal trend modeling.
- **Model**: Scikit-learn regularized Ridge regression trained on chronological 70/15/15 train/val/test splits with 7-day, 14-day, and 30-day rolling averages, day-of-week seasonality, and trend slopes.
- **Evaluation Metrics**:
  $$\text{MAE} = \frac{1}{n} \sum |y_i - \hat{y}_i|$$
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2}$$
  $$\text{MAPE} = \frac{100\%}{n} \sum \left| \frac{y_i - \hat{y}_i}{y_i} \right|$$

### 2.4 Risk Agent (`RiskAgent`)
- **Responsibility**: Identify single-source dependencies, vendor lead-time variances, and geopolitical or port disruptions.
- **Output Schema**:
  - `risk_score`: 0 to 100
  - `vulnerability_factors`: List of identified risks
  - `single_source_dependencies`: List of SKUs lacking dual suppliers
  - `mitigation_steps`: Recommended actions

### 2.5 Procurement Agent (`ProcurementAgent`)
- **Responsibility**: Formulate purchase order payloads with financial impact analysis.
- **Safety Policy**: Recommends orders with status `pending_approval`. Only users with `ADMIN` or `MANAGER` roles can authorize final PO creation.

---

## 3. Tool Safety Classification

| Tool Name | Type | Access Level | Description |
|---|---|---|---|
| `get_product_by_sku` | READ | Anyone | Retrieves catalog product specs |
| `get_inventory_levels` | READ | Anyone | Queries physical warehouse stock |
| `get_supplier_performance`| READ | Anyone | Returns historical vendor metrics |
| `forecast_demand` | READ | Anyone | Runs Scikit-learn Ridge forecast |
| `analyze_risk` | READ | Anyone | Computes supply chain risk index |
| `search_knowledge_base` | READ | Anyone | Vector & BM25 hybrid document search |
| `create_purchase_order` | WRITE | Admin / Manager | Creates official Purchase Order in DB |
