import json
import os
import re
import sqlite3
import uuid
from pathlib import Path
from backend.services.supabase_service import supabase_service

def clean_uid(user_id):
    if not user_id:
        return None
    if re.match(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', str(user_id)):
        return str(user_id)
    return None

def to_valid_uuid(val):
    if not val:
        return str(uuid.uuid4())
    val_str = str(val).strip()
    if re.match(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', val_str):
        return val_str
    # Generate deterministic UUID for non-standard IDs
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, val_str))

def migrate():
    print("=" * 60)
    print("STARTING SUPABASE CLOUD DATA MIGRATION")
    print("=" * 60)

    client = supabase_service.client
    if not client:
        print("ERROR: Supabase client is not connected. Check your SUPABASE_URL and SUPABASE_SECRET_KEY.")
        return

    db_path = supabase_service.db_path
    if not db_path.exists():
        print(f"SQLite DB not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Step 0: Normalize non-UUID ids in SQLite to standard UUIDs
    print("\n0. Normalizing any legacy IDs in local SQLite to standard UUIDs...")
    id_map = {
        "demo-civiclens-ai-001": to_valid_uuid("demo-civiclens-ai-001"),
        "demo-doc-001": to_valid_uuid("demo-doc-001")
    }

    # Update SQLite records with mapped UUIDs
    for old_id, new_id in id_map.items():
        c.execute("UPDATE projects SET id = ? WHERE id = ?", (new_id, old_id))
        c.execute("UPDATE project_requirements SET project_id = ? WHERE project_id = ?", (new_id, old_id))
        c.execute("UPDATE documents SET project_id = ? WHERE project_id = ?", (new_id, old_id))
        c.execute("UPDATE documents SET id = ? WHERE id = ?", (new_id, old_id))
        c.execute("UPDATE document_chunks SET project_id = ? WHERE project_id = ?", (new_id, old_id))
        c.execute("UPDATE document_chunks SET document_id = ? WHERE document_id = ?", (new_id, old_id))
        c.execute("UPDATE evaluations SET project_id = ? WHERE project_id = ?", (new_id, old_id))
        c.execute("UPDATE ai_board_items SET project_id = ? WHERE project_id = ?", (new_id, old_id))
        c.execute("UPDATE chat_sessions SET project_id = ? WHERE project_id = ?", (new_id, old_id))
    conn.commit()
    print("  -> Legacy IDs normalized in SQLite.")

    # 1. Migrate Projects
    print("\n1. Migrating Projects to Supabase...")
    c.execute("SELECT * FROM projects")
    projects = [dict(r) for r in c.fetchall()]
    supabase_projects = []
    for p in projects:
        p_id = to_valid_uuid(p["id"])
        target_users = json.loads(p.get("target_users") or "[]")
        technologies = json.loads(p.get("technologies") or "[]")
        constraints = json.loads(p.get("constraints") or "[]")
        supabase_projects.append({
            "id": p_id,
            "user_id": clean_uid(p.get("user_id")),
            "name": p.get("name") or "Untitled Project",
            "description": p.get("description") or "",
            "problem_statement": p.get("problem_statement") or "",
            "initial_idea": p.get("initial_idea") or "",
            "target_users": target_users,
            "technologies": technologies,
            "constraints": constraints,
            "status": p.get("status") or "draft",
            "overall_score": float(p.get("overall_score") or 0.0),
            "created_at": p.get("created_at"),
            "updated_at": p.get("updated_at")
        })

    if supabase_projects:
        for i in range(0, len(supabase_projects), 20):
            batch = supabase_projects[i:i+20]
            client.table("projects").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_projects)} projects.")

    # 2. Migrate Project Requirements
    print("\n2. Migrating Project Requirements to Supabase...")
    c.execute("SELECT * FROM project_requirements")
    reqs = [dict(r) for r in c.fetchall()]
    supabase_reqs = []
    for r in reqs:
        supabase_reqs.append({
            "id": to_valid_uuid(r["id"]),
            "project_id": to_valid_uuid(r["project_id"]),
            "category": r.get("category") or "functional",
            "requirement": r.get("requirement") or "",
            "priority": r.get("priority") or "MEDIUM",
            "status": r.get("status") or "pending",
            "created_at": r.get("created_at")
        })

    if supabase_reqs:
        for i in range(0, len(supabase_reqs), 50):
            batch = supabase_reqs[i:i+50]
            client.table("project_requirements").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_reqs)} project requirements.")

    # 3. Migrate Documents
    print("\n3. Migrating Documents to Supabase...")
    c.execute("SELECT * FROM documents")
    docs = [dict(r) for r in c.fetchall()]
    supabase_docs = []
    for d in docs:
        supabase_docs.append({
            "id": to_valid_uuid(d["id"]),
            "project_id": to_valid_uuid(d["project_id"]),
            "user_id": clean_uid(d.get("user_id")),
            "filename": d.get("filename") or "Document",
            "file_type": d.get("file_type") or "application/octet-stream",
            "file_size": int(d.get("file_size") or 0),
            "storage_path": d.get("storage_path") or "",
            "processing_status": d.get("processing_status") or "indexed",
            "document_version": int(d.get("document_version") or 1),
            "summary": d.get("summary") or "",
            "created_at": d.get("created_at"),
            "updated_at": d.get("updated_at")
        })

    if supabase_docs:
        for i in range(0, len(supabase_docs), 20):
            batch = supabase_docs[i:i+20]
            client.table("documents").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_docs)} documents.")

    # 4. Migrate Document Chunks & Embeddings (RAG Vector Store)
    print("\n4. Migrating Document Chunks & Vector Embeddings to Supabase...")
    c.execute("SELECT * FROM document_chunks")
    chunks = [dict(r) for r in c.fetchall()]
    supabase_chunks = []
    for ch in chunks:
        emb_val = None
        if ch.get("embedding"):
            try:
                emb_val = json.loads(ch["embedding"])
            except Exception:
                emb_val = None
        meta_val = {}
        if ch.get("metadata"):
            try:
                meta_val = json.loads(ch["metadata"])
            except Exception:
                meta_val = {}

        supabase_chunks.append({
            "id": to_valid_uuid(ch["id"]),
            "document_id": to_valid_uuid(ch["document_id"]),
            "project_id": to_valid_uuid(ch["project_id"]),
            "chunk_index": int(ch.get("chunk_index") or 0),
            "content": ch.get("content") or "",
            "page_number": int(ch.get("page_number") or 1),
            "section_title": ch.get("section_title") or "General",
            "embedding": emb_val,
            "metadata": meta_val,
            "created_at": ch.get("created_at")
        })

    if supabase_chunks:
        for i in range(0, len(supabase_chunks), 40):
            batch = supabase_chunks[i:i+40]
            client.table("document_chunks").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_chunks)} chunks with 3072-dim embeddings to Supabase pgvector.")

    # 5. Migrate Evaluations
    print("\n5. Migrating Evaluations to Supabase...")
    c.execute("SELECT * FROM evaluations")
    evals = [dict(r) for r in c.fetchall()]
    supabase_evals = []
    for ev in evals:
        strengths = json.loads(ev.get("strengths") or "[]")
        weaknesses = json.loads(ev.get("weaknesses") or "[]")
        risks = json.loads(ev.get("risks") or "[]")
        improvements = json.loads(ev.get("improvements") or "[]")
        judge_feedback = json.loads(ev.get("judge_feedback") or "{}")

        supabase_evals.append({
            "id": to_valid_uuid(ev["id"]),
            "project_id": to_valid_uuid(ev["project_id"]),
            "user_id": clean_uid(ev.get("user_id")),
            "overall_score": float(ev.get("overall_score") or 0.0),
            "status_label": ev.get("status_label") or "Evaluated",
            "problem_score": float(ev.get("problem_score") or 0.0),
            "innovation_score": float(ev.get("innovation_score") or 0.0),
            "technical_score": float(ev.get("technical_score") or 0.0),
            "user_value_score": float(ev.get("user_value_score") or 0.0),
            "requirements_score": float(ev.get("requirements_score") or 0.0),
            "scalability_score": float(ev.get("scalability_score") or 0.0),
            "security_score": float(ev.get("security_score") or 0.0),
            "rag_quality_score": float(ev.get("rag_quality_score") or 0.0),
            "feasibility_score": float(ev.get("feasibility_score") or 0.0),
            "summary": ev.get("summary") or "",
            "strengths": strengths,
            "weaknesses": weaknesses,
            "risks": risks,
            "improvements": improvements,
            "judge_feedback": judge_feedback,
            "created_at": ev.get("created_at")
        })

    if supabase_evals:
        for i in range(0, len(supabase_evals), 20):
            batch = supabase_evals[i:i+20]
            client.table("evaluations").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_evals)} evaluations.")

    # 6. Migrate AI Board Items
    print("\n6. Migrating AI Board Items (Kanban) to Supabase...")
    c.execute("SELECT * FROM ai_board_items")
    board_items = [dict(r) for r in c.fetchall()]
    supabase_board = []
    for b in board_items:
        supabase_board.append({
            "id": to_valid_uuid(b["id"]),
            "project_id": to_valid_uuid(b["project_id"]),
            "user_id": clean_uid(b.get("user_id")),
            "column_name": b.get("column_name") or "PROBLEM",
            "title": b.get("title") or "",
            "description": b.get("description") or "",
            "priority": b.get("priority") or "MEDIUM",
            "source_type": b.get("source_type") or "manual",
            "source_id": b.get("source_id") or "",
            "completed": bool(b.get("completed", 0)),
            "is_pinned": bool(b.get("is_pinned", 0)),
            "position": int(b.get("position", 0)),
            "created_at": b.get("created_at"),
            "updated_at": b.get("updated_at")
        })

    if supabase_board:
        for i in range(0, len(supabase_board), 50):
            batch = supabase_board[i:i+50]
            client.table("ai_board_items").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_board)} AI Board items.")

    # 7. Migrate Chat Sessions
    print("\n7. Migrating Chat Sessions to Supabase...")
    # First handle any orphaned sessions referenced in chat_messages
    c.execute("SELECT DISTINCT session_id FROM chat_messages WHERE session_id NOT IN (SELECT id FROM chat_sessions)")
    orphaned_sessions = c.fetchall()
    if orphaned_sessions:
        c.execute("SELECT id FROM projects LIMIT 1")
        first_p = c.fetchone()
        default_proj_id = first_p[0] if first_p else None
        if default_proj_id:
            for (orph_id,) in orphaned_sessions:
                c.execute("""
                    INSERT OR IGNORE INTO chat_sessions (id, project_id, user_id, title, created_at, updated_at)
                    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                """, (orph_id, default_proj_id, "demo-user", "Previous Conversation"))
            conn.commit()

    c.execute("SELECT * FROM chat_sessions")
    sessions = [dict(r) for r in c.fetchall()]
    supabase_sessions = []
    for s in sessions:
        supabase_sessions.append({
            "id": to_valid_uuid(s["id"]),
            "project_id": to_valid_uuid(s["project_id"]),
            "user_id": clean_uid(s.get("user_id")),
            "title": s.get("title") or "Conversation",
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at")
        })

    if supabase_sessions:
        for i in range(0, len(supabase_sessions), 30):
            batch = supabase_sessions[i:i+30]
            client.table("chat_sessions").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_sessions)} chat sessions.")

    # 8. Migrate Chat Messages
    print("\n8. Migrating Chat Messages to Supabase...")
    c.execute("SELECT * FROM chat_messages")
    messages = [dict(r) for r in c.fetchall()]
    supabase_msgs = []
    for m in messages:
        citations = []
        if m.get("citations"):
            try:
                citations = json.loads(m["citations"])
            except Exception:
                citations = []
        supabase_msgs.append({
            "id": to_valid_uuid(m["id"]),
            "session_id": to_valid_uuid(m["session_id"]),
            "user_id": clean_uid(m.get("user_id")),
            "role": m.get("role") or "user",
            "content": m.get("content") or "",
            "citations": citations,
            "created_at": m.get("created_at")
        })

    if supabase_msgs:
        for i in range(0, len(supabase_msgs), 50):
            batch = supabase_msgs[i:i+50]
            client.table("chat_messages").upsert(batch).execute()
        print(f"  -> Successfully migrated {len(supabase_msgs)} chat messages.")

    print("\n" + "=" * 60)
    print("ALL DATA SUCCESSFULLY MIGRATED TO SUPABASE CLOUD!")
    print("=" * 60)

if __name__ == "__main__":
    migrate()
