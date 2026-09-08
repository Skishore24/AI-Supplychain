from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from models.ai import InventoryAlert, AIAuditLog
from ai.tools.base_tool import AITool

class GetRiskAlertsTool(AITool):
    name = "get_risk_alerts"
    description = "Retrieve open inventory, supplier, and demand alerts from the database."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        alerts = db.query(InventoryAlert).filter(InventoryAlert.status == "open").order_by(InventoryAlert.created_at.desc()).all()
        return {
            "alerts_count": len(alerts),
            "alerts": [
                {
                    "id": a.id,
                    "product_id": a.product_id,
                    "severity": a.severity,
                    "title": a.title,
                    "reason": a.reason,
                    "affected_entity": a.affected_entity,
                    "recommended_action": a.recommended_action
                }
                for a in alerts
            ]
        }

class CreateInventoryAlertTool(AITool):
    name = "create_inventory_alert"
    description = "Authorized tool to register a critical supply chain risk alert."
    is_write = True
    requires_auth = True
    allowed_roles = ["admin", "manager"]

    def execute(
        self,
        db: Session,
        user: Optional[Any] = None,
        product_id: int = 0,
        severity: str = "WARNING",
        title: str = "",
        reason: str = "",
        affected_entity: str = "",
        recommended_action: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        alert = InventoryAlert(
            product_id=product_id,
            severity=severity.upper(),
            title=title or "Supply Chain Anomaly Detected",
            reason=reason,
            affected_entity=affected_entity,
            recommended_action=recommended_action,
            status="open"
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return {"success": True, "alert_id": alert.id, "message": "Alert registered successfully."}
