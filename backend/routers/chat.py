from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.supabase_service import supabase_service
from backend.services.gemini_service import gemini_service

router = APIRouter(prefix="/api", tags=["chat"])

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Conversation"
    user_id: Optional[str] = "demo-user"

class ChatQueryRequest(BaseModel):
    project_id: str
    session_id: Optional[str] = None
    query: str
    user_id: Optional[str] = "demo-user"

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
    session = supabase_service.create_chat_session(project_id, user_id=req.user_id, title=req.title)
    return session

@router.get("/chat/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    return supabase_service.get_chat_messages(session_id)

@router.post("/chat/query")
def execute_rag_chat(req: ChatQueryRequest):
    project = supabase_service.get_project(req.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    session_id = req.session_id
    if not session_id:
        sessions = supabase_service.get_chat_sessions(req.project_id)
        if sessions:
            session_id = sessions[0]["id"]
        else:
            new_s = supabase_service.create_chat_session(req.project_id, user_id=req.user_id, title="Project Assistant")
            session_id = new_s["id"]

    # 1. Save user message
    supabase_service.save_chat_message(
        session_id=session_id,
        role="user",
        content=req.query,
        user_id=req.user_id
    )

    # 2. Compute query embedding for vector retrieval
    query_emb = gemini_service.generate_embedding(req.query)

    # 3. Retrieve relevant chunks strictly isolated by project_id
    retrieved_chunks = supabase_service.vector_search(
        project_id=req.project_id,
        query_embedding=query_emb,
        top_k=5,
        similarity_threshold=0.20
    )

    # 4. Fetch recent conversation history
    history = supabase_service.get_chat_messages(session_id)

    # 5. Execute grounded Gemini synthesis
    rag_result = gemini_service.rag_chat_response(
        project=project,
        user_query=req.query,
        retrieved_chunks=retrieved_chunks,
        chat_history=history
    )

    # 6. Save assistant response
    assistant_msg = supabase_service.save_chat_message(
        session_id=session_id,
        role="assistant",
        content=rag_result.get("answer", ""),
        citations=rag_result.get("citations", []),
        user_id=req.user_id
    )

    return {
        "message": assistant_msg,
        "citations": rag_result.get("citations", []),
        "retrieved_count": len(retrieved_chunks)
    }
