from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.risk_tools import GetRiskRadarTool

class RiskAgent(BaseAgent):
    name = "RiskAgent"
    description = "Synthesizes multi-echelon supply chain risks (stockouts, vendor quality lapses, demand surges) into an actionable risk radar."
    responsibility = "Vulnerability ranking, disruption risk mitigation, and proactive alert generation."

    def __init__(self):
        super().__init__()
        self.risk_tool = GetRiskRadarTool()
        self.tools = [self.risk_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        res = self.call_tool(self.risk_tool, db, context)
        radar = res["output"]

        crit = radar.get("critical_count", 0)
        warn = radar.get("warning_count", 0)
        health = radar.get("overall_health_score", 100.0)

        summary = (
            f"Supply chain vulnerability audit: Overall operational health score is {health}/100. "
            f"Identified {crit} critical risk bottlenecks and {warn} operational warnings requiring proactive intervention."
        )

        top_recs = []
        for item in radar.get("items", [])[:5]:
            top_recs.append({
                "severity": item["severity"],
                "risk_type": item["risk_type"],
                "title": item["title"],
                "action": item["recommended_action"],
                "affected": item["affected_entity"]
            })

        return AgentResult(
            agent_name=self.name,
            summary=summary,
            data=radar,
            recommendations=top_recs,
            tool_calls=[res],
            metrics={"overall_health_score": health, "critical_risks": crit, "warnings": warn},
            confidence=0.95
        )
