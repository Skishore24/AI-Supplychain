from typing import Dict, List, Optional, Any
from app.agents.base import BaseAgent
from app.agents.specialized.demand_forecast_agent import DemandForecastAgent
from app.agents.specialized.inventory_agent import InventoryAgent
from app.agents.specialized.procurement_agent import ProcurementAgent
from app.agents.specialized.supplier_agent import SupplierAgent
from app.agents.specialized.risk_agent import RiskAgent
from app.agents.specialized.analytics_agent import AnalyticsAgent
from app.agents.specialized.document_agent import DocumentAgent

class AgentRegistry:
    """Central registry of active specialized agents."""

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self):
        default_agents = [
            DemandForecastAgent(),
            InventoryAgent(),
            ProcurementAgent(),
            SupplierAgent(),
            RiskAgent(),
            AnalyticsAgent(),
            DocumentAgent()
        ]
        for agent in default_agents:
            self.register(agent)

    def register(self, agent: BaseAgent):
        self._agents[agent.name.lower()] = agent
        # Also register normalized names
        clean_name = agent.name.lower().replace("agent", "").strip()
        if clean_name:
            self._agents[clean_name] = agent

    def get(self, name: str) -> Optional[BaseAgent]:
        return self._agents.get(name.lower().strip())

    def list_agents(self) -> List[Dict[str, Any]]:
        seen = set()
        result = []
        for agent in self._agents.values():
            if agent.name not in seen:
                seen.add(agent.name)
                result.append({
                    "name": agent.name,
                    "description": agent.description,
                    "responsibility": agent.responsibility,
                    "tools_count": len(agent.tools),
                    "allowed_roles": agent.allowed_roles
                })
        return result

agent_registry = AgentRegistry()
