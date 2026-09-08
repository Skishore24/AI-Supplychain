from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

from agents.base_agent import BaseAgent
from agents.inventory_agent import InventoryAgent
from ml.anomaly.detector import SupplyChainAnomalyDetector
from ai.tools.risk_tools import GetRiskAlertsTool
from ai.llm.provider import get_llm_provider
from ai.llm.prompts import RISK_ANALYSIS_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

class RiskAgent(BaseAgent):
    name = "risk_agent"
    description = "Detects, quantifies, and ranks multi-dimensional supply chain risks across stockouts, suppliers, demand surges, and inventory discrepancies."

    def __init__(self):
        super().__init__()
        self.tools = [GetRiskAlertsTool()]
        self.detector = SupplyChainAnomalyDetector()

    def run(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        risks = []

        # 1. Stockout Risks from Inventory Analysis
        inv_agent = InventoryAgent()
        inv_intel = inv_agent.run(db)

        for alert in inv_intel.get("alerts", []):
            if alert["severity"] == "CRITICAL":
                risks.append({
                    "id": f"RISK-STOCKOUT-{alert['product_id']}",
                    "risk_type": "stockout_risk",
                    "category": "Stockout",
                    "severity": "CRITICAL",
                    "probability": 0.95,
                    "impact": 0.90,
                    "risk_score": 85.5,
                    "title": f"Imminent Stockout: {alert['product_name']}",
                    "reason": alert["reason"],
                    "affected_entity": f"{alert['sku']} ({alert['product_name']})",
                    "recommended_action": f"Approve replenishment of {alert['suggested_reorder_units']} units from {alert['recommended_supplier']}.",
                    "supporting_data": alert
                })
            elif alert["severity"] == "WARNING":
                risks.append({
                    "id": f"RISK-STOCKOUT-{alert['product_id']}",
                    "risk_type": "stockout_risk",
                    "category": "Stockout",
                    "severity": "HIGH",
                    "probability": 0.75,
                    "impact": 0.70,
                    "risk_score": 52.5,
                    "title": f"Low Stock Warning: {alert['product_name']}",
                    "reason": alert["reason"],
                    "affected_entity": f"{alert['sku']} ({alert['product_name']})",
                    "recommended_action": f"Schedule purchase order for {alert['suggested_reorder_units']} units.",
                    "supporting_data": alert
                })

        # 2. Demand & Supplier Anomalies from Anomaly Detector
        anomalies = self.detector.detect_all(db)
        for idx, an in enumerate(anomalies):
            risks.append({
                "id": f"RISK-ANOMALY-{idx+1}",
                "risk_type": an.get("risk_type", "general_anomaly"),
                "category": an.get("title", "").split(":")[0],
                "severity": an.get("severity", "MEDIUM"),
                "probability": an.get("probability", 0.70),
                "impact": an.get("impact", 0.60),
                "risk_score": an.get("risk_score", 42.0),
                "title": an.get("title", "Supply Chain Anomaly"),
                "reason": an.get("reason", ""),
                "affected_entity": an.get("affected_entity", ""),
                "recommended_action": an.get("recommended_action", ""),
                "supporting_data": an
            })

        # Sort risks descending by risk score
        risks.sort(key=lambda r: r["risk_score"], reverse=True)

        # Overall Supply Chain Risk Score
        if not risks:
            overall_score = 10.0
            risk_level = "OPTIMAL"
        else:
            crit_count = sum(1 for r in risks if r["severity"] == "CRITICAL")
            high_count = sum(1 for r in risks if r["severity"] == "HIGH")
            overall_score = min(98.0, max(12.0, (crit_count * 25.0) + (high_count * 12.0)))

            if overall_score >= 70:
                risk_level = "CRITICAL"
            elif overall_score >= 45:
                risk_level = "ELEVATED"
            elif overall_score >= 25:
                risk_level = "MODERATE"
            else:
                risk_level = "OPTIMAL"

        # LLM Synthesis of Top Risks
        llm = get_llm_provider()
        risk_summary_lines = [
            f"- [{r['severity']}] {r['title']}: {r['reason']} (Score: {r['risk_score']})"
            for r in risks[:5]
        ]
        summary_prompt = RISK_ANALYSIS_PROMPT.format(risks_summary="\n".join(risk_summary_lines))
        llm_briefing = llm.generate(prompt=summary_prompt, system=SYSTEM_PROMPT_SUPPLY_CHAIN_BASE)
        if not llm_briefing or "[AI Note:" in llm_briefing:
            llm_briefing = f"Active supply chain risk level is {risk_level} with {len(risks)} total anomalies detected. Immediate attention required for critical stockouts."

        return {
            "overall_risk_score": round(overall_score, 1),
            "risk_level": risk_level,
            "critical_alerts_count": sum(1 for r in risks if r["severity"] == "CRITICAL"),
            "warning_alerts_count": sum(1 for r in risks if r["severity"] in ("HIGH", "MEDIUM")),
            "total_risks_count": len(risks),
            "risks": risks,
            "executive_briefing": llm_briefing
        }
