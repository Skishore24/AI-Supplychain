from agents.base_agent import BaseAgent
from agents.supplier_agent import SupplierAgent, evaluate_suppliers_for_product
from agents.inventory_agent import InventoryAgent, calculate_inventory_intelligence
from agents.demand_agent import DemandAgent, generate_demand_forecast, get_supply_chain_risk_overview
from agents.risk_agent import RiskAgent
from agents.procurement_agent import ProcurementAgent

AGENT_REGISTRY = {
    "supplier_agent": SupplierAgent(),
    "inventory_agent": InventoryAgent(),
    "demand_agent": DemandAgent(),
    "risk_agent": RiskAgent(),
    "procurement_agent": ProcurementAgent(),
}

def get_agent(name: str) -> BaseAgent:
    clean = name.lower().strip()
    if clean in AGENT_REGISTRY:
        return AGENT_REGISTRY[clean]
    # Common synonyms
    synonyms = {
        "supplier": "supplier_agent",
        "inventory": "inventory_agent",
        "demand": "demand_agent",
        "risk": "risk_agent",
        "procurement": "procurement_agent"
    }
    if clean in synonyms:
        return AGENT_REGISTRY[synonyms[clean]]
    raise ValueError(f"Agent '{name}' not found in multi-agent registry.")

__all__ = [
    "BaseAgent",
    "SupplierAgent",
    "InventoryAgent",
    "DemandAgent",
    "RiskAgent",
    "ProcurementAgent",
    "AGENT_REGISTRY",
    "get_agent",
    "evaluate_suppliers_for_product",
    "calculate_inventory_intelligence",
    "generate_demand_forecast",
    "get_supply_chain_risk_overview"
]
