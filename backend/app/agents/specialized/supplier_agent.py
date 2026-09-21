from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.supplier_tools import GetSuppliersTool, EvaluateSuppliersTool
from app.ai.tools.product_tools import GetProductBySKUTool

class SupplierAgentInput(BaseModel):
    product_id: Optional[int] = Field(None, description="Target product to evaluate vendors for")
    sku: Optional[str] = Field(None, description="Target SKU")

class SupplierAgent(BaseAgent):
    name = "SupplierAgent"
    description = "Deterministic multi-criteria vendor scoring (Price 40%, Quality 35%, Lead Time 15%, Reliability 10%) based on verified supplier records."
    responsibility = "Vendor performance evaluation, lead-time tracking, and optimal vendor recommendation."
    input_schema = SupplierAgentInput

    def __init__(self):
        super().__init__()
        self.suppliers_tool = GetSuppliersTool()
        self.evaluate_tool = EvaluateSuppliersTool()
        self.prod_tool = GetProductBySKUTool()
        self.tools = [self.suppliers_tool, self.evaluate_tool, self.prod_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        tool_calls = []
        prod_id = kwargs.get("product_id")
        sku = kwargs.get("sku")

        if sku and not prod_id:
            res = self.call_tool(self.prod_tool, db, context, sku=sku)
            tool_calls.append(res)
            if res["output"].get("found"):
                prod_id = res["output"]["product"]["id"]

        if not prod_id:
            # Catalog list
            sups = self.call_tool(self.suppliers_tool, db, context)
            tool_calls.append(sups)
            out = sups["output"]
            summary = f"Currently tracking {out.get('total_suppliers', 0)} active enterprise suppliers across hardware and components."
            return AgentResult(
                agent_name=self.name,
                summary=summary,
                data=out,
                tool_calls=tool_calls,
                confidence=0.95
            )

        # Multi-factor evaluation
        eval_res = self.call_tool(self.evaluate_tool, db, context, product_id=prod_id)
        tool_calls.append(eval_res)
        eval_data = eval_res["output"]

        rec = eval_data.get("recommended_supplier")
        if not rec:
            return AgentResult(
                agent_name=self.name,
                summary=f"No approved vendor quotes found for {eval_data.get('product_name', f'Product #{prod_id}')}.",
                data=eval_data,
                confidence=0.4
            )

        summary = (
            f"Evaluated {eval_data['suppliers_evaluated']} suppliers for {eval_data['product_name']}. "
            f"Top recommendation: '{rec['supplier_name']}' with an overall score of {rec['overall_score']}/100 "
            f"(Unit Cost: ${rec['unit_cost']}, Quality: {rec['quality_score']}%, Delivery: {rec['lead_time_days']} days)."
        )

        recommendation = {
            "title": f"Preferred Supplier: {rec['supplier_name']}",
            "supplier_id": rec["supplier_id"],
            "unit_cost": rec["unit_cost"],
            "overall_score": rec["overall_score"],
            "lead_time_days": rec["lead_time_days"],
            "action": f"Route replenishment purchase orders for {eval_data['product_name']} to {rec['supplier_name']}."
        }

        return AgentResult(
            agent_name=self.name,
            summary=summary,
            data=eval_data,
            recommendations=[recommendation],
            tool_calls=tool_calls,
            confidence=0.94
        )
