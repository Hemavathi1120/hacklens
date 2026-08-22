from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.supabase_service import supabase_service
from backend.services.rag_pipeline import rag_pipeline
from backend.services.rag_database import rag_database
from backend.services.transformer_service import transformer_service

router = APIRouter(prefix="/api", tags=["chat"])

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Conversation"
    user_id: Optional[str] = "demo-user"

class ChatQueryRequest(BaseModel):
    project_id: str
    session_id: Optional[str] = None
    query: str
    user_id: Optional[str] = "demo-user"

class SandboxQueryRequest(BaseModel):
    project_id: str
    query: str
    top_k: Optional[int] = 5

@router.get("/projects/{project_id}/chat/sessions")
def get_project_chat_sessions(project_id: str):
    sessions = supabase_service.get_chat_sessions(project_id)
    if not sessions:
        # Create a default initial session if none exists
        default_session = supabase_service.create_chat_session(project_id, title="Project Assistant")
        sessions = [default_session]
    return sessions

@router.post("/projects/{project_id}/chat/sessions")
def create_project_chat_session(project_id: str, req: CreateSessionRequest):
    session = supabase_service.create_chat_session(project_id, user_id=req.user_id or "demo-user", title=req.title or "New Conversation")
    return session

@router.get("/chat/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    return supabase_service.get_chat_messages(session_id)

@router.post("/chat/query")
def execute_rag_chat(req: ChatQueryRequest):
    try:
        result = rag_pipeline.query(
            project_id=req.project_id,
            user_query=req.query,
            session_id=req.session_id,
            user_id=req.user_id or "demo-user"
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG execution error: {str(e)}")

@router.post("/chat/sandbox")
def execute_rag_sandbox(req: SandboxQueryRequest):
    """
    Developer sandbox endpoint to inspect dense similarity, BM25 scores,
    and RRF fused rankings for any test query in real time.
    """
    project = supabase_service.get_project(req.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query_emb = transformer_service.generate_embedding(req.query)
    dense_results = rag_database.dense_vector_search(req.project_id, query_emb, top_k=req.top_k or 5)
    sparse_results = rag_database.sparse_bm25_search(req.project_id, req.query, top_k=req.top_k or 5)
    hybrid_results = rag_database.hybrid_search(req.project_id, req.query, query_emb, top_k=req.top_k or 5)

    return {
        "query": req.query,
        "dense_results": dense_results,
        "sparse_results": sparse_results,
        "hybrid_results": hybrid_results,
        "token_estimate": transformer_service.estimate_tokens(req.query)
    }

