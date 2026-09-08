from ai.tools.base_tool import AITool
from ai.tools.product_tools import GetProductTool, GetProductBySKUTool
from ai.tools.inventory_tools import GetInventoryTool, GetInventoryRiskTool
from ai.tools.supplier_tools import GetSupplierTool, GetSupplierPerformanceTool
from ai.tools.sales_tools import GetSalesHistoryTool, GetSalesAnalyticsTool
from ai.tools.purchase_order_tools import GetOpenPurchaseOrdersTool, CreatePurchaseOrderTool
from ai.tools.analytics_tools import GetSupplyChainKPIsTool
from ai.tools.forecast_tools import GetDemandForecastTool
from ai.tools.risk_tools import GetRiskAlertsTool, CreateInventoryAlertTool

TOOL_REGISTRY = {
    "get_product": GetProductTool(),
    "get_product_by_sku": GetProductBySKUTool(),
    "get_inventory": GetInventoryTool(),
    "get_inventory_risk": GetInventoryRiskTool(),
    "get_supplier": GetSupplierTool(),
    "get_supplier_performance": GetSupplierPerformanceTool(),
    "get_sales_history": GetSalesHistoryTool(),
    "get_sales_analytics": GetSalesAnalyticsTool(),
    "get_open_purchase_orders": GetOpenPurchaseOrdersTool(),
    "create_purchase_order": CreatePurchaseOrderTool(),
    "get_supply_chain_kpis": GetSupplyChainKPIsTool(),
    "get_demand_forecast": GetDemandForecastTool(),
    "get_risk_alerts": GetRiskAlertsTool(),
    "create_inventory_alert": CreateInventoryAlertTool(),
}

def get_tool(tool_name: str) -> AITool:
    if tool_name not in TOOL_REGISTRY:
        raise ValueError(f"Unknown AI tool '{tool_name}' requested.")
    return TOOL_REGISTRY[tool_name]

__all__ = ["TOOL_REGISTRY", "get_tool"]
