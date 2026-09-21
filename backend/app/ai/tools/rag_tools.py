from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.ai.rag.pipeline import RAGPipeline

class AskRAGKnowledgeInput(BaseModel):
    question: str = Field(..., description="Specific question regarding company policy, supplier terms, or manuals")
    document_type: Optional[str] = Field(None, description="Optional filter by document type (policy, contract, sop, invoice)")

class AskRAGKnowledgeTool(AITool):
    name = "ask_rag_knowledge"
    description = "Answer questions with verified citations from company policy, vendor contracts, and SOP manuals."
    input_schema = AskRAGKnowledgeInput
    permission_level = ToolPermissionLevel.READ

    def __init__(self):
        self.rag_pipeline = RAGPipeline()

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        return self.rag_pipeline.answer_question(
            db=db,
            question=params["question"],
            organization_id=organization_id,
            document_type=params.get("document_type")
        )
