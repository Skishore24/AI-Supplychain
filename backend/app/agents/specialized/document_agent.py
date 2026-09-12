from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.ai.tools.rag_tools import AskRAGKnowledgeTool
from app.ai.tools.document_tools import SearchDocumentsTool

class DocumentAgentInput(BaseModel):
    question: str = Field(..., description="Inquiry regarding company policy, supplier contracts, or operating manuals")
    document_type: Optional[str] = Field(None, description="Optional document type filter")

class DocumentAgent(BaseAgent):
    name = "DocumentAgent"
    description = "Searches company policies, vendor agreements, and operating procedures using tenant-isolated pgvector RAG, returning grounded answers with citations."
    responsibility = "Document question answering, compliance verification, and contract inspection."
    input_schema = DocumentAgentInput

    def __init__(self):
        super().__init__()
        self.rag_tool = AskRAGKnowledgeTool()
        self.doc_tool = SearchDocumentsTool()
        self.tools = [self.rag_tool, self.doc_tool]

    def run(self, db: Session, context: AgentContext, **kwargs) -> AgentResult:
        question = kwargs.get("question", "")
        doc_type = kwargs.get("document_type")

        rag_res = self.call_tool(
            self.rag_tool,
            db,
            context,
            question=question,
            document_type=doc_type
        )
        out = rag_res["output"]

        citations = out.get("sources", [])
        answer = out.get("answer", "No context found.")
        conf = out.get("confidence", 0.75)

        return AgentResult(
            agent_name=self.name,
            summary=answer,
            data={"has_context": out.get("has_context", False)},
            citations=citations,
            tool_calls=[rag_res],
            confidence=conf
        )
