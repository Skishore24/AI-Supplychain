from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.forecast_tools import ForecastDemandTool
from app.ai.tools.product_tools import GetProductBySKUTool
from app.ai.tools.sales_tools import GetSalesHistoryTool
from app.ai.llm.provider import get_llm_provider
from app.ai.llm.prompts import DEMAND_FORECAST_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

class DemandForecastInput(BaseModel):
    product_id: Optional[int] = Field(None, description="Target product ID")
    sku: Optional[str] = Field(None, description="Target SKU")
    horizons: List[int] = Field([7, 30, 90], description="Forecast horizons")

class DemandForecastAgent(BaseAgent):
    name = "DemandForecastAgent"
    description = "Executes real statistical and Ridge ML forecasting over sales history to project 7d, 30d, and 90d demand with confidence intervals."
    responsibility = "Demand velocity modeling, seasonality detection, and explainable replenishment forecasts."
    input_schema = DemandForecastInput

    def __init__(self):
        super().__init__()
        self.forecast_tool = ForecastDemandTool()
        self.product_tool = GetProductBySKUTool()
        self.sales_tool = GetSalesHistoryTool()
        self.tools = [self.forecast_tool, self.product_tool, self.sales_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        tool_calls = []
        prod_id = kwargs.get("product_id")
        sku = kwargs.get("sku")
        horizons = kwargs.get("horizons", [7, 30, 90])

        # Resolve SKU if provided
        if sku and not prod_id:
            res = self.call_tool(self.product_tool, db, context, sku=sku)
            tool_calls.append(res)
            if res["output"].get("found"):
                prod_id = res["output"]["product"]["id"]

        if not prod_id:
            # Fallback to general sales velocity analysis
            sales_res = self.call_tool(self.sales_tool, db, context, days=30)
            tool_calls.append(sales_res)
            out = sales_res["output"]
            summary = (
                f"Overall organization daily sales velocity is {out.get('daily_velocity', 0)} units/day "
                f"with {out.get('total_units_sold', 0)} units sold across {out.get('total_transactions', 0)} orders over the last 30 days."
            )
            return AgentResult(
                agent_name=self.name,
                summary=summary,
                data=out,
                tool_calls=tool_calls,
                confidence=0.90
            )

        # Execute ML forecast
        fc_res = self.call_tool(self.forecast_tool, db, context, product_id=prod_id, horizons=horizons)
        tool_calls.append(fc_res)
        fc_data = fc_res["output"]

        p_name = fc_data.get("product_name", f"Product #{prod_id}")
        daily_vel = fc_data.get("daily_velocity", 1.0)
        trend = fc_data.get("trend", "stable")
        h_list = fc_data.get("horizons", [])
        h30 = next((h for h in h_list if h["horizon_days"] == 30), (h_list[0] if h_list else {}))
        pred_30 = h30.get("predicted_quantity", 30.0)
        lower_30 = h30.get("lower_bound", pred_30 * 0.85)
        upper_30 = h30.get("upper_bound", pred_30 * 1.15)
        conf = h30.get("confidence", 0.88)

        # Grounded natural-language summary
        summary = (
            f"Demand forecast for {p_name} ({fc_data.get('sku', '')}): projected 30-day demand is "
            f"{pred_30} units (estimated interval: {lower_30} – {upper_30} units) at a daily velocity "
            f"of {daily_vel} units/day. The demand trajectory is {trend}."
        )

        recommendation = {
            "title": f"Restock Planning for {p_name}",
            "action": f"Ensure active safety stock buffers accommodate at least {upper_30} units over the next 30 days.",
            "predicted_quantity": pred_30,
            "confidence": conf
        }

        return AgentResult(
            agent_name=self.name,
            summary=summary,
            data=fc_data,
            recommendations=[recommendation],
            tool_calls=tool_calls,
            metrics={"daily_velocity": daily_vel, "trend": trend, "confidence": conf},
            confidence=conf
        )
