from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.supabase_service import supabase_service
from backend.services.gemini_service import gemini_service

router = APIRouter(prefix="/api", tags=["ai_board"])

class BoardItemCreateRequest(BaseModel):
    column_name: str # PROBLEM, IDEA, REQUIREMENTS, AI INSIGHTS, RISKS, IMPROVEMENTS, NEXT STEPS
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "MEDIUM" # HIGH, MEDIUM, LOW
    source_type: Optional[str] = "manual"
    source_id: Optional[str] = ""
    completed: Optional[bool] = False
    is_pinned: Optional[bool] = False
    position: Optional[int] = 0
    user_id: Optional[str] = "demo-user"

class BoardItemUpdateRequest(BaseModel):
    column_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    is_pinned: Optional[bool] = None
    position: Optional[int] = None

@router.get("/projects/{project_id}/board")
def get_project_board(project_id: str):
    items = supabase_service.get_board_items(project_id)
    return items

@router.post("/projects/{project_id}/board")
def create_board_item(project_id: str, req: BoardItemCreateRequest):
    project = supabase_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    item_data = req.model_dump()
    item_data["project_id"] = project_id
    saved = supabase_service.save_board_item(item_data)
    return saved

@router.put("/board/{item_id}")
def update_board_item(item_id: str, req: BoardItemUpdateRequest):
    update_data = req.model_dump(exclude_unset=True)
    update_data["id"] = item_id
    saved = supabase_service.save_board_item(update_data)
    return saved

@router.delete("/board/{item_id}")
def delete_board_item(item_id: str):
    success = supabase_service.delete_board_item(item_id)
    return {"success": success, "id": item_id}

@router.post("/projects/{project_id}/board/sync")
def sync_board_from_evaluation(project_id: str):
    project = supabase_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    evals = supabase_service.get_project_evaluations(project_id)
    if not evals:
        raise HTTPException(status_code=400, detail="No evaluations found to sync. Run an evaluation first.")

    latest_eval = evals[0]
    cards = gemini_service.generate_ai_board_cards(project, latest_eval)
    saved_cards = []
    for c in cards:
        c["project_id"] = project_id
        c["user_id"] = project.get("user_id", "demo-user")
        saved_cards.append(supabase_service.save_board_item(c))

    return {"success": True, "synced_count": len(saved_cards), "items": saved_cards}
