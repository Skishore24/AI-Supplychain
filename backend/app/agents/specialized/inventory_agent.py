from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.inventory_tools import GetInventoryTool, GetInventoryRiskTool
from app.ai.tools.product_tools import GetProductBySKUTool

class InventoryAgentInput(BaseModel):
    product_id: Optional[int] = Field(None, description="Filter inventory to specific product")
    sku: Optional[str] = Field(None, description="Filter inventory by SKU")

class InventoryAgent(BaseAgent):
    name = "InventoryAgent"
    description = "Inspects live warehouse stock positions, monitors reorder points (ROP), evaluates safety stock buffers, and projects days of coverage."
    responsibility = "Real-time inventory levels, stockout detection, and depletion modeling."
    input_schema = InventoryAgentInput

    def __init__(self):
        super().__init__()
        self.inv_tool = GetInventoryTool()
        self.risk_tool = GetInventoryRiskTool()
        self.prod_tool = GetProductBySKUTool()
        self.tools = [self.inv_tool, self.risk_tool, self.prod_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        tool_calls = []
        prod_id = kwargs.get("product_id")
        sku = kwargs.get("sku")

        if sku and not prod_id:
            res = self.call_tool(self.prod_tool, db, context, sku=sku)
            tool_calls.append(res)
            if res["output"].get("found"):
                prod_id = res["output"]["product"]["id"]

        if prod_id:
            inv_res = self.call_tool(self.inv_tool, db, context, product_id=prod_id)
            tool_calls.append(inv_res)
            items = inv_res["output"].get("items", [])
            if not items:
                return AgentResult(
                    agent_name=self.name,
                    summary=f"No inventory record found for product ID {prod_id}.",
                    confidence=0.5
                )
            target = items[0]
            summary = (
                f"{target['name']} ({target['sku']}): current physical stock is {target['current_stock']} units "
                f"({target['available_stock']} available, {target['reserved_stock']} reserved). "
                f"Daily burn-rate is {target['daily_demand']} units/day (~{target['days_of_coverage']} days of coverage). "
                f"Health Status: {target['health_status']}."
            )
            recommendations = []
            if target["available_stock"] <= target["reorder_point"]:
                recommendations.append({
                    "type": "replenishment_alert",
                    "action": f"Trigger purchase order for {target['name']}",
                    "suggested_units": max(15, int(target["reorder_point"] * 1.5))
                })

            return AgentResult(
                agent_name=self.name,
                summary=summary,
                data=target,
                recommendations=recommendations,
                tool_calls=tool_calls,
                metrics={
                    "available_stock": target["available_stock"],
                    "days_of_coverage": target["days_of_coverage"],
                    "health_status": target["health_status"]
                },
                confidence=0.95
            )

        # Catalog-wide overview
        risk_res = self.call_tool(self.risk_tool, db, context)
        tool_calls.append(risk_res)
        out = risk_res["output"]

        crit = out.get("critical_stockout_count", 0)
        low = out.get("low_stock_count", 0)
        summary = (
            f"Organization inventory scan: {out.get('total_at_risk', 0)} items requiring operational attention "
            f"({crit} critical stockouts, {low} items below reorder threshold)."
        )

        recs = [
            {
                "product_name": item["name"],
                "sku": item["sku"],
                "action": f"Reorder: {item['days_of_coverage']} days left (lead-time: {item['lead_time_days']} days)"
            }
            for item in out.get("items", [])[:5]
        ]

        return AgentResult(
            agent_name=self.name,
            summary=summary,
            data=out,
            recommendations=recs,
            tool_calls=tool_calls,
            metrics={"critical_stockouts": crit, "low_stock": low},
            confidence=0.92
        )
