from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.models.ai import KnowledgeDocument

class SearchDocumentsInput(BaseModel):
    query: Optional[str] = Field(None, description="Keywords to match against uploaded documents")

class SearchDocumentsTool(AITool):
    name = "search_documents"
    description = "List and search uploaded organization contracts, invoices, and standard operating procedures."
    input_schema = SearchDocumentsInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        query_text = params.get("query")

        q = db.query(KnowledgeDocument).filter(KnowledgeDocument.organization_id == organization_id)
        if query_text:
            q = q.filter(KnowledgeDocument.name.ilike(f"%{query_text}%"))

        docs = q.order_by(KnowledgeDocument.created_at.desc()).limit(20).all()

        return {
            "total_documents": len(docs),
            "documents": [
                {
                    "id": d.id,
                    "name": d.name,
                    "document_type": d.document_type,
                    "status": d.status,
                    "chunk_count": d.chunk_count,
                    "created_at": d.created_at.isoformat() if d.created_at else None
                }
                for d in docs
            ]
        }
