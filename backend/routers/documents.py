import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from backend.services.supabase_service import supabase_service
from backend.services.document_parser import DocumentParser
from backend.services.gemini_service import gemini_service

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
        filename = file.filename
        file_size = len(file_bytes)
        file_type = file.content_type or "application/octet-stream"

        doc_id = str(uuid.uuid4())

        # 1. Parse text
        parsed = DocumentParser.extract_text(file_bytes, filename, file_type)
        
        if parsed.get("is_empty"):
            doc_data = {
                "id": doc_id,
                "project_id": project_id,
                "user_id": user_id,
                "filename": filename,
                "file_type": file_type,
                "file_size": file_size,
                "processing_status": "failed",
                "summary": "Text extraction unavailable — file may be scanned or empty."
            }
            saved_doc = supabase_service.save_document(doc_data)
            uploaded_results.append(saved_doc)
            continue

        # 2. Chunk text
        chunks_meta = DocumentParser.chunk_document(parsed.get("pages", []))

        # 3. Create document record
        summary_preview = parsed.get("full_text", "")[:280] + "..." if len(parsed.get("full_text", "")) > 280 else parsed.get("full_text", "")
        doc_data = {
            "id": doc_id,
            "project_id": project_id,
            "user_id": user_id,
            "filename": filename,
            "file_type": file_type,
            "file_size": file_size,
            "processing_status": "indexed",
            "summary": summary_preview
        }
        saved_doc = supabase_service.save_document(doc_data)

        # 4. Generate embeddings and save chunks
        chunks_to_save = []
        for c in chunks_meta:
            emb = gemini_service.generate_embedding(c["content"])
            chunks_to_save.append({
                "id": str(uuid.uuid4()),
                "document_id": doc_id,
                "project_id": project_id,
                "chunk_index": c["chunk_index"],
                "content": c["content"],
                "page_number": c["page_number"],
                "section_title": c["section_title"],
                "embedding": emb,
                "metadata": {"filename": filename, "file_type": file_type}
            })

        supabase_service.save_chunks(chunks_to_save)
        uploaded_results.append({**saved_doc, "chunk_count": len(chunks_to_save)})

    return {"success": True, "documents": uploaded_results}

@router.post("/documents/{document_id}/reprocess")
def reprocess_document(document_id: str):
    doc = supabase_service.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Fetch existing chunks to re-embed if needed
    chunks = supabase_service.get_document_chunks(document_id)
    re_embedded = []
    for c in chunks:
        emb = gemini_service.generate_embedding(c["content"])
        re_embedded.append({
            "id": c["id"],
            "document_id": document_id,
            "project_id": c["project_id"],
            "chunk_index": c["chunk_index"],
            "content": c["content"],
            "page_number": c["page_number"],
            "section_title": c["section_title"],
            "embedding": emb,
            "metadata": c.get("metadata", {})
        })
    supabase_service.save_chunks(re_embedded)
    
    updated = supabase_service.save_document({
        **doc,
        "processing_status": "indexed",
        "document_version": doc.get("document_version", 1) + 1
    })
    return {"success": True, "document": updated}

@router.delete("/documents/{document_id}")
def delete_document(document_id: str):
    success = supabase_service.delete_document(document_id)
    return {"success": success, "id": document_id}
