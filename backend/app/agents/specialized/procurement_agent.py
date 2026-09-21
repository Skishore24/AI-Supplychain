from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.procurement_tools import GetOpenPurchaseOrdersTool, CreatePurchaseOrderTool
from app.ai.tools.supplier_tools import EvaluateSuppliersTool
from app.ai.tools.inventory_tools import GetInventoryTool

class ProcurementAgentInput(BaseModel):
    product_id: Optional[int] = Field(None, description="Product ID to generate replenishment for")
    auto_create_draft: bool = Field(False, description="Whether to automatically generate a draft purchase order")

class ProcurementAgent(BaseAgent):
    name = "ProcurementAgent"
    description = "Optimizes purchase orders, recommends reorder lot sizes, evaluates vendor quotes, and prepares draft purchase orders for management approval."
    responsibility = "Procurement strategy, purchase order lifecycle management, and restock order creation."
    input_schema = ProcurementAgentInput

    def __init__(self):
        super().__init__()
        self.open_po_tool = GetOpenPurchaseOrdersTool()
        self.create_po_tool = CreatePurchaseOrderTool()
        self.evaluate_tool = EvaluateSuppliersTool()
        self.inv_tool = GetInventoryTool()
        self.tools = [self.open_po_tool, self.create_po_tool, self.evaluate_tool, self.inv_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        tool_calls = []
        prod_id = kwargs.get("product_id")
        auto_draft = kwargs.get("auto_create_draft", False)

        if not prod_id:
            open_pos = self.call_tool(self.open_po_tool, db, context)
            tool_calls.append(open_pos)
            out = open_pos["output"]
            summary = f"There are currently {out.get('total_open_orders', 0)} active purchase orders awaiting dispatch, approval, or delivery."
            return AgentResult(
                agent_name=self.name,
                summary=summary,
                data=out,
                tool_calls=tool_calls,
                confidence=0.95
            )

        # 1. Check current inventory
        inv_res = self.call_tool(self.inv_tool, db, context, product_id=prod_id)
        tool_calls.append(inv_res)
        inv_items = inv_res["output"].get("items", [])
        if not inv_items:
            return AgentResult(
                agent_name=self.name,
                summary=f"Unable to find inventory parameters for product {prod_id}.",
                confidence=0.4
            )
        target_inv = inv_items[0]

        # 2. Evaluate optimal supplier
        sup_res = self.call_tool(self.evaluate_tool, db, context, product_id=prod_id)
        tool_calls.append(sup_res)
        best_sup = sup_res["output"].get("recommended_supplier")

        if not best_sup:
            return AgentResult(
                agent_name=self.name,
                summary=f"No approved active supplier found with price quotes for {target_inv['name']}.",
                confidence=0.5
            )

        # Calculate optimal replenishment order quantity
        reorder_qty = max(best_sup.get("min_order_qty", 10), int(target_inv["reorder_point"] * 1.5))
        unit_cost = best_sup["unit_cost"]
        total_estimate = round(reorder_qty * unit_cost, 2)

        summary = (
            f"Recommended restock order for {target_inv['name']}: {reorder_qty} units from "
            f"top-ranked supplier '{best_sup['supplier_name']}' (Overall Score: {best_sup['overall_score']}/100, "
            f"Lead Time: {best_sup['lead_time_days']} days, Unit Cost: ${unit_cost}). Estimated Total: ${total_estimate}."
        )

        recommendation = {
            "action": "CREATE_PURCHASE_ORDER",
            "product_id": prod_id,
            "product_name": target_inv["name"],
            "supplier_id": best_sup["supplier_id"],
            "supplier_name": best_sup["supplier_name"],
            "quantity": reorder_qty,
            "unit_cost": unit_cost,
            "estimated_total": total_estimate
        }

        # Auto create draft if requested and user has write role
        created_po_info = None
        if auto_draft and context.user_role in ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER", "ADMIN", "MANAGER"]:
            create_res = self.call_tool(
                self.create_po_tool,
                db,
                context,
                supplier_id=best_sup["supplier_id"],
                items=[{"product_id": prod_id, "quantity": reorder_qty, "unit_cost": unit_cost}],
                notes=f"Auto-generated draft restock order for {target_inv['name']}"
            )
            tool_calls.append(create_res)
            created_po_info = create_res["output"]
            summary += f" Draft Purchase Order {created_po_info.get('po_number')} generated in PENDING_APPROVAL status."

        return AgentResult(
            agent_name=self.name,
            summary=summary,
            data={"supplier": best_sup, "inventory": target_inv, "created_po": created_po_info},
            recommendations=[recommendation],
            tool_calls=tool_calls,
            confidence=0.92
        )
