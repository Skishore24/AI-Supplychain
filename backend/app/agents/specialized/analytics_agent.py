from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.analytics_tools import GetExecutiveAnalyticsTool

class AnalyticsAgentInput(BaseModel):
    timeframe: str = Field("30d", description="Lookback window: 7d, 30d, 90d, 12m")

class AnalyticsAgent(BaseAgent):
    name = "AnalyticsAgent"
    description = "Computes high-level executive performance metrics, revenue trajectories, inventory valuations, and order fulfillment KPIs."
    responsibility = "Cross-functional KPI summarization and financial metrics analysis."
    input_schema = AnalyticsAgentInput

    def __init__(self):
        super().__init__()
        self.analytics_tool = GetExecutiveAnalyticsTool()
        self.tools = [self.analytics_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        tf = kwargs.get("timeframe", "30d")
        res = self.call_tool(self.analytics_tool, db, context, timeframe=tf)
        out = res["output"]

        summary = (
            f"Executive summary ({tf}): Total revenue is ${out['total_revenue']:,} across {out['order_count']} orders "
            f"({out['total_units_sold']:,} units sold, AOV ${out['average_order_value']}). "
            f"Total on-hand inventory valuation is ${out['inventory_valuation']:,} ({out['total_inventory_units']:,} units). "
            f"Active suppliers: {out['active_supplier_count']}. Pending POs: {out['pending_po_count']}."
        )

        recs = []
        if out["low_stock_sku_count"] > 0:
            recs.append({
                "type": "inventory_health",
                "action": f"{out['low_stock_sku_count']} SKUs are below reorder threshold. Review restock queue."
            })

        return AgentResult(
            agent_name=self.name,
            summary=summary,
            data=out,
            recommendations=recs,
            tool_calls=[res],
            metrics={
                "revenue": out["total_revenue"],
                "orders": out["order_count"],
                "inventory_valuation": out["inventory_valuation"]
            },
            confidence=0.98
        )
