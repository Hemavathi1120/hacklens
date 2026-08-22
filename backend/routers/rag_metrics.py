from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from backend.services.supabase_service import supabase_service
from backend.services.rag_pipeline import rag_pipeline

router = APIRouter(prefix="/api", tags=["rag_metrics"])

@router.get("/projects/{project_id}/rag-metrics")
def get_rag_metrics(project_id: str):
    project = supabase_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    diagnostics = rag_pipeline.get_rag_diagnostics(project_id)
    return diagnostics

