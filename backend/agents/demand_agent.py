from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models.product import Product
from models.inventory import Inventory
from models.sales import Sale
from agents.base_agent import BaseAgent
from ml.forecasting.predict import generate_demand_prediction
from ai.llm.provider import get_llm_provider
from ai.llm.prompts import DEMAND_FORECAST_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

class DemandAgentInput(BaseModel):
    product_id: Optional[int] = None
    horizons: List[int] = [7, 30, 90]

class DemandAgent(BaseAgent):
    name = "demand_agent"
    description = "Executes chronological ML time-series forecasting (baseline vs Ridge/ML) and generates grounded explanations."
    input_schema = DemandAgentInput

    def run(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        target_prod_id = kwargs.get("product_id")
        horizons = kwargs.get("horizons", [7, 30, 90])

        if target_prod_id:
            products = db.query(Product).filter(Product.id == target_prod_id).all()
        else:
            products = db.query(Product).filter(Product.status == "active").all()

        llm = get_llm_provider()
        forecasts = []
        category_demand = {}

        for prod in products:
            inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
            current_stock = inv.current_stock if inv else 0
            available_stock = max(0, current_stock - (inv.reserved_stock if inv else 0))

            # Execute real ML forecasting pipeline
            pred_data = generate_demand_prediction(db, prod.id, horizons=horizons)
            h_map = {h_data["horizon_days"]: h_data for h_data in pred_data["horizons"]}

            p7 = h_map.get(7, {}).get("predicted_quantity", 7.0)
            p30 = h_map.get(30, {}).get("predicted_quantity", 30.0)
            p90 = h_map.get(90, {}).get("predicted_quantity", 90.0)
            conf_lower = h_map.get(30, {}).get("lower_bound", p30 * 0.8)
            conf_upper = h_map.get(30, {}).get("upper_bound", p30 * 1.2)
            confidence = h_map.get(30, {}).get("confidence", 0.85)

            velocity = pred_data["daily_velocity"]
            days_stock_left = round(available_stock / max(0.1, velocity), 1)
            risk = "HIGH" if days_stock_left < 7 else ("MEDIUM" if days_stock_left < 20 else "LOW")

            explanation = (
                f"30-day projected demand is {p30} units (estimated between {conf_lower} and {conf_upper} units) "
                f"at a daily velocity of {velocity} units/day. Current stock of {available_stock} provides ~{days_stock_left} days of coverage."
            )

            # If single product query, enrich with LLM explanation
            if target_prod_id:
                prompt = DEMAND_FORECAST_PROMPT.format(
                    product_name=prod.name,
                    sku=prod.sku,
                    velocity=velocity,
                    days_stock_left=days_stock_left,
                    p7=p7,
                    p30=p30,
                    conf_lower=conf_lower,
                    conf_upper=conf_upper,
                    p90=p90,
                    trend=pred_data["trend_direction"],
                    growth_pct=pred_data["growth_rate_pct"],
                    model_name=pred_data["model_used"],
                    model_version=pred_data["model_version"]
                )
                llm_exp = llm.generate(prompt=prompt, system=SYSTEM_PROMPT_SUPPLY_CHAIN_BASE)
                if llm_exp and "[AI Note:" not in llm_exp:
                    explanation = llm_exp

            item_result = {
                "product_id": prod.id,
                "product_name": prod.name,
                "sku": prod.sku,
                "category": prod.category,
                "current_stock": current_stock,
                "available_stock": available_stock,
                "daily_velocity": velocity,
                "projected_7d": p7,
                "projected_30d": p30,
                "projected_90d": p90,
                "confidence_lower": conf_lower,
                "confidence_upper": conf_upper,
                "confidence": confidence,
                "trend_direction": pred_data["trend_direction"],
                "growth_rate": pred_data["growth_rate_pct"],
                "days_of_stock_left": days_stock_left,
                "stockout_risk": risk,
                "model_name": pred_data["model_used"],
                "model_version": pred_data["model_version"],
                "explanation": explanation
            }
            forecasts.append(item_result)

            cat = prod.category
            if cat not in category_demand:
                category_demand[cat] = {"category": cat, "monthly_projected_units": 0, "daily_velocity": 0.0}
            category_demand[cat]["monthly_projected_units"] += p30
            category_demand[cat]["daily_velocity"] += velocity

        return {
            "forecast_horizon_days": 30,
            "items": forecasts,
            "forecasts": forecasts,  # for backwards compatibility
            "category_run_rates": list(category_demand.values())
        }

# Backwards compatible alias
def generate_demand_forecast(db: Session) -> Dict[str, Any]:
    agent = DemandAgent()
    return agent.run(db)

def get_supply_chain_risk_overview(db: Session) -> Dict[str, Any]:
    from agents.risk_agent import RiskAgent
    agent = RiskAgent()
    return agent.run(db)
