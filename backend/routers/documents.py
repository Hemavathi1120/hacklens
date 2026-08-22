import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from backend.services.supabase_service import supabase_service
from backend.services.rag_pipeline import rag_pipeline

router = APIRouter(prefix="/api", tags=["documents"])

@router.get("/projects/{project_id}/documents")
def get_project_documents(project_id: str):
    docs = supabase_service.get_project_documents(project_id)
    return docs

@router.get("/documents/{document_id}")
def get_document_details(document_id: str):
    doc = supabase_service.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    chunks = supabase_service.get_document_chunks(document_id)
    return {**doc, "chunks": chunks}

@router.post("/documents/upload")
async def upload_documents(
    project_id: str = Form(...),
    user_id: str = Form("demo-user"),
    files: List[UploadFile] = File(...)
):
    project = supabase_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    uploaded_results = []

    for file in files:
        file_bytes = await file.read()
        filename = file.filename or "uploaded_document"
        file_type = file.content_type or "application/octet-stream"

        saved_doc = rag_pipeline.ingest_document(
            file_bytes=file_bytes,
            filename=filename,
            file_type=file_type,
            project_id=project_id,
            user_id=user_id
        )
        uploaded_results.append(saved_doc)

    return {"success": True, "documents": uploaded_results}

@router.post("/documents/{document_id}/reprocess")
def reprocess_document(document_id: str):
    doc = supabase_service.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    updated = rag_pipeline.reprocess_document(document_id=document_id, project_id=doc["project_id"])
    return {"success": True, "document": updated}

@router.delete("/documents/{document_id}")
def delete_document(document_id: str):
    doc = supabase_service.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    success = rag_pipeline.delete_document(document_id=document_id, project_id=doc["project_id"])
    return {"success": success, "id": document_id}

