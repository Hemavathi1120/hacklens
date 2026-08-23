import json
import math
import os
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from postgrest import CountMethod
from backend.config import settings

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SECRET_KEY
        self.publishable_key = settings.SUPABASE_PUBLISHABLE_KEY
        self.client: Optional[Client] = None
        self.storage_bucket = settings.STORAGE_BUCKET
        
        # Local SQLite database path for local cache & resilience
        if os.environ.get("VERCEL"):
            self.db_path = Path("/tmp") / "projectlens.db"
        else:
            self.db_path = Path(__file__).resolve().parent.parent / "data" / "projectlens.db"
            try:
                self.db_path.parent.mkdir(parents=True, exist_ok=True)
            except Exception:
                self.db_path = Path("/tmp") / "projectlens.db"
        
        # Init SQLite tables
        self._init_sqlite()

        # Connect to Supabase
        if self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                print(f"[SupabaseService] Connected to Supabase Cloud: {self.url}")
                # Auto-heal legacy project records
                self._auto_heal_project_ownership()
            except Exception as e:
                print(f"[SupabaseService] Supabase initialization warning: {e}")
        else:
            print("[SupabaseService] Supabase URL/Key not set - running in standalone SQLite persistent local mode.")

    def _is_uuid(self, val: Optional[str]) -> bool:
        if not val:
            return False
        return bool(re.match(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', str(val).strip()))

    def _clean_user_id(self, user_id: Optional[str]) -> Optional[str]:
        """
        Ensures user_id is a valid UUID for Supabase auth.users foreign key constraints.
        Resolves email addresses or legacy user prefixes (e.g. user-email-domain)
        to their canonical Supabase auth.users UUID.
        Returns None if user_id cannot be mapped to a valid auth.users UUID.
        """
        if not user_id:
            return None
        user_str = str(user_id).strip()
        if user_str in ("demo-user", "demo", "guest", "anonymous-user"):
            return None
        # Check standard UUID regex
        if re.match(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', user_str):
            return user_str

        # Try to resolve fallback string / email against Supabase auth.users
        if self.client:
            try:
                clean_search = user_str
                if clean_search.startswith("user-"):
                    clean_search = clean_search[5:]
                clean_search = clean_search.replace("-gmail-com", "@gmail.com").replace("-", ".")
                if "@" not in clean_search and "." in clean_search:
                    parts = clean_search.rsplit(".", 1)
                    clean_search = parts[0] + "@" + parts[1]

                users = self.client.auth.admin.list_users()
                for u in users:
                    if u.email and (clean_search.lower() in u.email.lower() or u.email.lower() in clean_search.lower()):
                        return u.id
                    if getattr(u, 'id', None) == user_str:
                        return u.id
            except Exception:
                pass

        return None

    def _auto_heal_project_ownership(self):
        """
        Synchronizes any unassigned/legacy projects in SQLite and Supabase Cloud
        with their corresponding auth.users UUIDs based on known user emails.
        """
        if not self.client:
            return
        try:
            users = self.client.auth.admin.list_users()
            user_map = {}
            for u in users:
                if u.email:
                    email_clean = u.email.lower().replace("@", "-").replace(".", "-")
                    user_map[f"user-{email_clean}"] = u.id
                    user_map[u.email.lower()] = u.id

            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                for legacy_id, valid_uuid in user_map.items():
                    c.execute("UPDATE projects SET user_id = ? WHERE user_id = ?", (valid_uuid, legacy_id))
                    c.execute("UPDATE documents SET user_id = ? WHERE user_id = ?", (valid_uuid, legacy_id))
                    c.execute("UPDATE evaluations SET user_id = ? WHERE user_id = ?", (valid_uuid, legacy_id))
                    c.execute("UPDATE ai_board_items SET user_id = ? WHERE user_id = ?", (valid_uuid, legacy_id))
                    c.execute("UPDATE chat_sessions SET user_id = ? WHERE user_id = ?", (valid_uuid, legacy_id))
                conn.commit()
        except Exception as e:
            print(f"[SupabaseService] Auto-heal warning: {e}")

    def _init_sqlite(self):
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    name TEXT NOT NULL,
                    description TEXT,
                    problem_statement TEXT,
                    initial_idea TEXT,
                    target_users TEXT,
                    technologies TEXT,
                    constraints TEXT,
                    status TEXT DEFAULT 'draft',
                    overall_score REAL DEFAULT 0,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS project_requirements (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    category TEXT,
                    requirement TEXT,
                    priority TEXT DEFAULT 'MEDIUM',
                    status TEXT DEFAULT 'pending',
                    created_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    filename TEXT,
                    file_type TEXT,
                    file_size INTEGER,
                    storage_path TEXT,
                    processing_status TEXT,
                    document_version INTEGER DEFAULT 1,
                    summary TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT,
                    project_id TEXT,
                    chunk_index INTEGER,
                    content TEXT,
                    page_number INTEGER,
                    section_title TEXT,
                    embedding TEXT,
                    metadata TEXT,
                    created_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS evaluations (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    overall_score REAL,
                    status_label TEXT,
                    problem_score REAL,
                    innovation_score REAL,
                    technical_score REAL,
                    user_value_score REAL,
                    requirements_score REAL,
                    scalability_score REAL,
                    security_score REAL,
                    rag_quality_score REAL,
                    feasibility_score REAL,
                    summary TEXT,
                    strengths TEXT,
                    weaknesses TEXT,
                    risks TEXT,
                    improvements TEXT,
                    judge_feedback TEXT,
                    created_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS ai_board_items (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    column_name TEXT,
                    title TEXT,
                    description TEXT,
                    priority TEXT,
                    source_type TEXT,
                    source_id TEXT,
                    completed INTEGER DEFAULT 0,
                    is_pinned INTEGER DEFAULT 0,
                    position INTEGER DEFAULT 0,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    title TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    user_id TEXT,
                    role TEXT,
                    content TEXT,
                    citations TEXT,
                    created_at TEXT
                )
            """)
            conn.commit()

    # =========================================================================
    # PROJECTS
    # =========================================================================
    def get_projects(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        clean_uid = self._clean_user_id(user_id) if user_id else None
        is_demo_query = (user_id == "demo-user")
        projects_dict: Dict[str, Dict[str, Any]] = {}

        # 1. Query Supabase Cloud
        if self.client:
            try:
                query = self.client.table("projects").select("*").order("updated_at", desc=True)
                if is_demo_query:
                    # Scope demo query strictly to demo projects
                    query = query.eq("name", "CivicLens AI")
                elif clean_uid:
                    query = query.eq("user_id", clean_uid)

                res = query.execute()
                if res and res.data:
                    for raw_p in res.data:
                        if not isinstance(raw_p, dict):
                            continue
                        p: Dict[str, Any] = dict(raw_p)
                        
                        # Ensure lists
                        for field in ("target_users", "technologies", "constraints"):
                            val = p.get(field)
                            if isinstance(val, str):
                                try:
                                    p[field] = json.loads(val)
                                except Exception:
                                    p[field] = []
                            elif not isinstance(val, list):
                                p[field] = []

                        # Count docs
                        try:
                            doc_res = self.client.table("documents").select("id", count=CountMethod.exact).eq("project_id", p["id"]).execute()
                            p["document_count"] = doc_res.count if doc_res and doc_res.count is not None else 0
                        except Exception:
                            p["document_count"] = 0

                        projects_dict[p["id"]] = p
            except Exception as e:
                print(f"[SupabaseService] Cloud get_projects warning: {e}")

        # 2. Query Local SQLite & Merge
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                if is_demo_query:
                    c.execute("SELECT * FROM projects WHERE user_id = 'demo-user' OR name = 'CivicLens AI' ORDER BY updated_at DESC")
                elif clean_uid or (user_id and user_id != "demo-user"):
                    uids = [u for u in (clean_uid, user_id) if u]
                    placeholders = ",".join("?" for _ in uids)
                    c.execute(f"SELECT * FROM projects WHERE user_id IN ({placeholders}) ORDER BY updated_at DESC", uids)
                else:
                    c.execute("SELECT * FROM projects ORDER BY updated_at DESC")

                rows = c.fetchall()
                for r in rows:
                    p = dict(r)
                    p_id = p["id"]

                    for field in ("target_users", "technologies", "constraints"):
                        val = p.get(field)
                        if isinstance(val, str):
                            try:
                                p[field] = json.loads(val)
                            except Exception:
                                p[field] = []
                        elif not isinstance(val, list):
                            p[field] = []

                    c_docs = conn.cursor()
                    c_docs.execute("SELECT COUNT(*) FROM documents WHERE project_id = ?", (p_id,))
                    doc_cnt = c_docs.fetchone()[0]
                    p["document_count"] = max(p.get("document_count", 0), doc_cnt)

                    if p_id not in projects_dict:
                        projects_dict[p_id] = p
                    else:
                        if projects_dict[p_id].get("document_count", 0) == 0 and doc_cnt > 0:
                            projects_dict[p_id]["document_count"] = doc_cnt
        except Exception as e:
            print(f"[SupabaseService] SQLite get_projects warning: {e}")

        results = list(projects_dict.values())
        results.sort(key=lambda x: str(x.get("updated_at") or x.get("created_at") or ""), reverse=True)
        return results

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        # 1. Try Supabase Cloud
        if self.client and self._is_uuid(project_id):
            try:
                res = self.client.table("projects").select("*").eq("id", project_id).execute()
                if res and res.data and len(res.data) > 0 and isinstance(res.data[0], dict):
                    p: Dict[str, Any] = dict(res.data[0])
                    
                    # Ensure lists
                    for field in ("target_users", "technologies", "constraints"):
                        val = p.get(field)
                        if isinstance(val, str):
                            try:
                                p[field] = json.loads(val)
                            except Exception:
                                p[field] = []
                        elif not isinstance(val, list):
                            p[field] = []

                    # Doc count
                    try:
                        doc_res = self.client.table("documents").select("id", count=CountMethod.exact).eq("project_id", project_id).execute()
                        p["document_count"] = doc_res.count if doc_res and doc_res.count is not None else 0
                    except Exception:
                        p["document_count"] = 0
                    
                    # Requirements
                    try:
                        req_res = self.client.table("project_requirements").select("*").eq("project_id", project_id).order("created_at").execute()
                        p["requirements"] = [dict(r) for r in req_res.data if isinstance(r, dict)] if req_res and req_res.data else []
                    except Exception:
                        p["requirements"] = []
                    return p
            except Exception as e:
                print(f"[SupabaseService] Cloud get_project warning: {e}")

        # 2. Fallback / Local Cache
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            row = c.fetchone()
            if not row:
                return None
            p = dict(row)
            p["target_users"] = json.loads(p.get("target_users") or "[]")
            p["technologies"] = json.loads(p.get("technologies") or "[]")
            p["constraints"] = json.loads(p.get("constraints") or "[]")
            
            c_docs = conn.cursor()
            c_docs.execute("SELECT COUNT(*) FROM documents WHERE project_id = ?", (p["id"],))
            p["document_count"] = c_docs.fetchone()[0]
            
            c_reqs = conn.cursor()
            c_reqs.execute("SELECT * FROM project_requirements WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
            p["requirements"] = [dict(r) for r in c_reqs.fetchall()]
            return p

    def save_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = project_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        raw_uid = project_data.get("user_id") or "demo-user"
        clean_uid = self._clean_user_id(raw_uid)

        target_users_list = project_data.get("target_users", [])
        technologies_list = project_data.get("technologies", [])
        constraints_list = project_data.get("constraints", [])

        # 1. Update SQLite Cache
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO projects (id, user_id, name, description, problem_statement, initial_idea, target_users, technologies, constraints, status, overall_score, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    user_id=COALESCE(excluded.user_id, projects.user_id),
                    description=excluded.description,
                    problem_statement=excluded.problem_statement,
                    initial_idea=excluded.initial_idea,
                    target_users=excluded.target_users,
                    technologies=excluded.technologies,
                    constraints=excluded.constraints,
                    status=excluded.status,
                    overall_score=excluded.overall_score,
                    updated_at=excluded.updated_at
            """, (
                p_id,
                clean_uid or raw_uid,
                project_data.get("name", "Untitled Project"),
                project_data.get("description", ""),
                project_data.get("problem_statement", ""),
                project_data.get("initial_idea", ""),
                json.dumps(target_users_list if isinstance(target_users_list, list) else []),
                json.dumps(technologies_list if isinstance(technologies_list, list) else []),
                json.dumps(constraints_list if isinstance(constraints_list, list) else []),
                project_data.get("status", "draft"),
                project_data.get("overall_score", 0),
                project_data.get("created_at", now),
                now
            ))
            
            reqs = project_data.get("requirements")
            if reqs is not None and len(reqs) > 0:
                c.execute("DELETE FROM project_requirements WHERE project_id = ?", (p_id,))
                for req in reqs:
                    r_id = req.get("id") or str(uuid.uuid4())
                    c.execute("""
                        INSERT INTO project_requirements (id, project_id, category, requirement, priority, status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        r_id,
                        p_id,
                        req.get("category", "functional"),
                        req.get("requirement", ""),
                        req.get("priority", "MEDIUM"),
                        req.get("status", "pending"),
                        req.get("created_at", now)
                    ))
            conn.commit()

        # 2. Persist to Supabase Cloud
        if self.client:
            try:
                self.client.table("projects").upsert({
                    "id": p_id,
                    "user_id": clean_uid,
                    "name": project_data.get("name", "Untitled Project"),
                    "description": project_data.get("description", ""),
                    "problem_statement": project_data.get("problem_statement", ""),
                    "initial_idea": project_data.get("initial_idea", ""),
                    "target_users": target_users_list if isinstance(target_users_list, list) else json.loads(target_users_list or "[]"),
                    "technologies": technologies_list if isinstance(technologies_list, list) else json.loads(technologies_list or "[]"),
                    "constraints": constraints_list if isinstance(constraints_list, list) else json.loads(constraints_list or "[]"),
                    "status": project_data.get("status", "draft"),
                    "overall_score": float(project_data.get("overall_score", 0)),
                    "updated_at": now
                }).execute()

                # Sync requirements in Supabase
                reqs = project_data.get("requirements")
                if reqs is not None and len(reqs) > 0:
                    supabase_reqs = []
                    for req in reqs:
                        supabase_reqs.append({
                            "id": req.get("id") or str(uuid.uuid4()),
                            "project_id": p_id,
                            "category": req.get("category", "functional"),
                            "requirement": req.get("requirement", ""),
                            "priority": req.get("priority", "MEDIUM"),
                            "status": req.get("status", "pending"),
                            "created_at": req.get("created_at", now)
                        })
                    self.client.table("project_requirements").upsert(supabase_reqs).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud save_project error: {e}")

        return self.get_project(p_id) or {}

    def delete_project(self, project_id: str) -> bool:
        # 1. Delete from SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            c.execute("DELETE FROM project_requirements WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM documents WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM document_chunks WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM evaluations WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM ai_board_items WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM chat_sessions WHERE project_id = ?", (project_id,))
            conn.commit()

        # 2. Delete from Supabase Cloud
        if self.client:
            try:
                self.client.table("projects").delete().eq("id", project_id).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud delete_project error: {e}")
        return True

    # =========================================================================
    # DOCUMENTS & CHUNKS (RAG PERSISTENCE)
    # =========================================================================
    def save_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        d_id = doc_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Save to SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO documents (id, project_id, user_id, filename, file_type, file_size, storage_path, processing_status, document_version, summary, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    processing_status=excluded.processing_status,
                    summary=excluded.summary,
                    updated_at=excluded.updated_at
            """, (
                d_id,
                doc_data.get("project_id"),
                doc_data.get("user_id", "demo-user"),
                doc_data.get("filename"),
                doc_data.get("file_type"),
                doc_data.get("file_size", 0),
                doc_data.get("storage_path", ""),
                doc_data.get("processing_status", "pending"),
                doc_data.get("document_version", 1),
                doc_data.get("summary", ""),
                doc_data.get("created_at", now),
                now
            ))
            conn.commit()

        # 2. Persist to Supabase Cloud
        if self.client:
            try:
                clean_uid = self._clean_user_id(doc_data.get("user_id"))
                self.client.table("documents").upsert({
                    "id": d_id,
                    "project_id": doc_data.get("project_id"),
                    "user_id": clean_uid,
                    "filename": doc_data.get("filename"),
                    "file_type": doc_data.get("file_type"),
                    "file_size": doc_data.get("file_size", 0),
                    "storage_path": doc_data.get("storage_path", ""),
                    "processing_status": doc_data.get("processing_status", "pending"),
                    "document_version": doc_data.get("document_version", 1),
                    "summary": doc_data.get("summary", ""),
                    "updated_at": now
                }).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud save_document error: {e}")

        return self.get_document(d_id) or {}

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("documents").select("*").eq("id", doc_id).execute()
                if res and res.data and len(res.data) > 0 and isinstance(res.data[0], dict):
                    doc: Dict[str, Any] = dict(res.data[0])
                    # Get chunk count
                    cnt_res = self.client.table("document_chunks").select("id", count=CountMethod.exact).eq("document_id", doc_id).execute()
                    doc["chunk_count"] = cnt_res.count if cnt_res and cnt_res.count is not None else 0
                    return doc
            except Exception:
                pass

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
            row = c.fetchone()
            if not row:
                return None
            doc = dict(row)
            c_cnt = conn.cursor()
            c_cnt.execute("SELECT COUNT(*) FROM document_chunks WHERE document_id = ?", (doc_id,))
            doc["chunk_count"] = c_cnt.fetchone()[0]
            return doc

    def get_project_documents(self, project_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("documents").select("*").eq("project_id", project_id).order("created_at", desc=True).execute()
                if res and res.data is not None and len(res.data) > 0:
                    docs: List[Dict[str, Any]] = []
                    for raw_d in res.data:
                        if not isinstance(raw_d, dict):
                            continue
                        d: Dict[str, Any] = dict(raw_d)
                        try:
                            cnt_res = self.client.table("document_chunks").select("id", count=CountMethod.exact).eq("document_id", d["id"]).execute()
                            d["chunk_count"] = cnt_res.count if cnt_res and cnt_res.count is not None else 0
                        except Exception:
                            d["chunk_count"] = 0
                        docs.append(d)
                    return docs
            except Exception:
                pass

        docs = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM documents WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
            for r in c.fetchall():
                d = dict(r)
                c_cnt = conn.cursor()
                c_cnt.execute("SELECT COUNT(*) FROM document_chunks WHERE document_id = ?", (d["id"],))
                d["chunk_count"] = c_cnt.fetchone()[0]
                docs.append(d)
        return docs

    def delete_document(self, doc_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
            c.execute("DELETE FROM document_chunks WHERE document_id = ?", (doc_id,))
            conn.commit()

        if self.client:
            try:
                self.client.table("document_chunks").delete().eq("document_id", doc_id).execute()
                self.client.table("documents").delete().eq("id", doc_id).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud delete_document error: {e}")
        return True

    def save_chunks(self, chunks: List[Dict[str, Any]]):
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Save to SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            for chunk in chunks:
                c_id = chunk.get("id") or str(uuid.uuid4())
                embedding_str = json.dumps(chunk.get("embedding", []))
                metadata_str = json.dumps(chunk.get("metadata", {}))
                c.execute("""
                    INSERT INTO document_chunks (id, document_id, project_id, chunk_index, content, page_number, section_title, embedding, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        content=excluded.content,
                        page_number=excluded.page_number,
                        section_title=excluded.section_title,
                        embedding=excluded.embedding,
                        metadata=excluded.metadata
                """, (
                    c_id,
                    chunk.get("document_id"),
                    chunk.get("project_id"),
                    chunk.get("chunk_index", 0),
                    chunk.get("content", ""),
                    chunk.get("page_number", 1),
                    chunk.get("section_title", ""),
                    embedding_str,
                    metadata_str,
                    now
                ))
            conn.commit()

        # 2. Persist Vector Chunks into Supabase Cloud
        if self.client and chunks:
            try:
                # Prepare payload for Supabase pgvector column
                supabase_records = []
                for chunk in chunks:
                    supabase_records.append({
                        "id": chunk.get("id") or str(uuid.uuid4()),
                        "document_id": chunk.get("document_id"),
                        "project_id": chunk.get("project_id"),
                        "chunk_index": chunk.get("chunk_index", 0),
                        "content": chunk.get("content", ""),
                        "page_number": chunk.get("page_number", 1),
                        "section_title": chunk.get("section_title", "General"),
                        "embedding": chunk.get("embedding"),  # List[float] converts to pgvector
                        "metadata": chunk.get("metadata", {}),
                        "created_at": now
                    })
                
                # Batch upsert in chunks of 50 to avoid request size limits
                batch_size = 50
                for i in range(0, len(supabase_records), batch_size):
                    batch = supabase_records[i:i + batch_size]
                    self.client.table("document_chunks").upsert(batch).execute()
                print(f"[SupabaseService] Persisted {len(chunks)} chunks with 3072-dim embeddings to Supabase pgvector.")
            except Exception as e:
                print(f"[SupabaseService] Cloud save_chunks error: {e}")

    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("document_chunks").select("id, document_id, project_id, chunk_index, content, page_number, section_title, metadata, created_at").eq("document_id", document_id).order("chunk_index").execute()
                if res and res.data and len(res.data) > 0:
                    return [dict(ch) for ch in res.data if isinstance(ch, dict)]
            except Exception:
                pass

        chunks = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT id, document_id, project_id, chunk_index, content, page_number, section_title, metadata, created_at FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC", (document_id,))
            for r in c.fetchall():
                ch = dict(r)
                ch["metadata"] = json.loads(ch.get("metadata") or "{}")
                chunks.append(ch)
        return chunks

    # =========================================================================
    # EVALUATIONS
    # =========================================================================
    def save_evaluation(self, eval_data: Dict[str, Any]) -> Dict[str, Any]:
        e_id = eval_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        strengths = eval_data.get("strengths", [])
        weaknesses = eval_data.get("weaknesses", [])
        risks = eval_data.get("risks", [])
        improvements = eval_data.get("improvements", [])
        judge_feedback = eval_data.get("judge_feedback", {})

        # 1. Save to SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO evaluations (
                    id, project_id, user_id, overall_score, status_label,
                    problem_score, innovation_score, technical_score, user_value_score,
                    requirements_score, scalability_score, security_score, rag_quality_score, feasibility_score,
                    summary, strengths, weaknesses, risks, improvements, judge_feedback, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    overall_score=excluded.overall_score,
                    status_label=excluded.status_label,
                    problem_score=excluded.problem_score,
                    innovation_score=excluded.innovation_score,
                    technical_score=excluded.technical_score,
                    user_value_score=excluded.user_value_score,
                    requirements_score=excluded.requirements_score,
                    scalability_score=excluded.scalability_score,
                    security_score=excluded.security_score,
                    rag_quality_score=excluded.rag_quality_score,
                    feasibility_score=excluded.feasibility_score,
                    summary=excluded.summary,
                    strengths=excluded.strengths,
                    weaknesses=excluded.weaknesses,
                    risks=excluded.risks,
                    improvements=excluded.improvements,
                    judge_feedback=excluded.judge_feedback
            """, (
                e_id,
                eval_data.get("project_id"),
                eval_data.get("user_id", "demo-user"),
                eval_data.get("overall_score", 0),
                eval_data.get("status_label", "Analyzed"),
                eval_data.get("problem_score", 0),
                eval_data.get("innovation_score", 0),
                eval_data.get("technical_score", 0),
                eval_data.get("user_value_score", 0),
                eval_data.get("requirements_score", 0),
                eval_data.get("scalability_score", 0),
                eval_data.get("security_score", 0),
                eval_data.get("rag_quality_score", 0),
                eval_data.get("feasibility_score", 0),
                eval_data.get("summary", ""),
                json.dumps(strengths),
                json.dumps(weaknesses),
                json.dumps(risks),
                json.dumps(improvements),
                json.dumps(judge_feedback),
                now
            ))
            c.execute("""
                UPDATE projects 
                SET overall_score = ?, status = 'evaluated', updated_at = ? 
                WHERE id = ?
            """, (eval_data.get("overall_score", 0), now, eval_data.get("project_id")))
            conn.commit()

        # 2. Persist to Supabase Cloud
        if self.client:
            try:
                clean_uid = self._clean_user_id(eval_data.get("user_id"))
                self.client.table("evaluations").upsert({
                    "id": e_id,
                    "project_id": eval_data.get("project_id"),
                    "user_id": clean_uid,
                    "overall_score": float(eval_data.get("overall_score", 0)),
                    "status_label": eval_data.get("status_label", "Evaluated"),
                    "problem_score": float(eval_data.get("problem_score", 0)),
                    "innovation_score": float(eval_data.get("innovation_score", 0)),
                    "technical_score": float(eval_data.get("technical_score", 0)),
                    "user_value_score": float(eval_data.get("user_value_score", 0)),
                    "requirements_score": float(eval_data.get("requirements_score", 0)),
                    "scalability_score": float(eval_data.get("scalability_score", 0)),
                    "security_score": float(eval_data.get("security_score", 0)),
                    "rag_quality_score": float(eval_data.get("rag_quality_score", 0)),
                    "feasibility_score": float(eval_data.get("feasibility_score", 0)),
                    "summary": eval_data.get("summary", ""),
                    "strengths": strengths if isinstance(strengths, list) else json.loads(strengths),
                    "weaknesses": weaknesses if isinstance(weaknesses, list) else json.loads(weaknesses),
                    "risks": risks if isinstance(risks, list) else json.loads(risks),
                    "improvements": improvements if isinstance(improvements, list) else json.loads(improvements),
                    "judge_feedback": judge_feedback if isinstance(judge_feedback, dict) else json.loads(judge_feedback)
                }).execute()

                # Update project score in Supabase
                self.client.table("projects").update({
                    "overall_score": float(eval_data.get("overall_score", 0)),
                    "status": "evaluated",
                    "updated_at": now
                }).eq("id", eval_data.get("project_id")).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud save_evaluation error: {e}")

        return self.get_evaluation(e_id) or {}

    def get_evaluation(self, eval_id: str) -> Optional[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("evaluations").select("*").eq("id", eval_id).execute()
                if res and res.data and len(res.data) > 0 and isinstance(res.data[0], dict):
                    return dict(res.data[0])
            except Exception:
                pass

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM evaluations WHERE id = ?", (eval_id,))
            row = c.fetchone()
            if not row:
                return None
            res = dict(row)
            res["strengths"] = json.loads(res.get("strengths") or "[]")
            res["weaknesses"] = json.loads(res.get("weaknesses") or "[]")
            res["risks"] = json.loads(res.get("risks") or "[]")
            res["improvements"] = json.loads(res.get("improvements") or "[]")
            res["judge_feedback"] = json.loads(res.get("judge_feedback") or "{}")
            return res

    def get_project_evaluations(self, project_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("evaluations").select("*").eq("project_id", project_id).order("created_at", desc=True).execute()
                if res and res.data is not None and len(res.data) > 0:
                    return [dict(ev) for ev in res.data if isinstance(ev, dict)]
            except Exception:
                pass

        evals = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM evaluations WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
            for r in c.fetchall():
                res = dict(r)
                res["strengths"] = json.loads(res.get("strengths") or "[]")
                res["weaknesses"] = json.loads(res.get("weaknesses") or "[]")
                res["risks"] = json.loads(res.get("risks") or "[]")
                res["improvements"] = json.loads(res.get("improvements") or "[]")
                res["judge_feedback"] = json.loads(res.get("judge_feedback") or "{}")
                evals.append(res)
        return evals

    # =========================================================================
    # AI BOARD ITEMS (7 Columns Kanban)
    # =========================================================================
    def get_board_items(self, project_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("ai_board_items").select("*").eq("project_id", project_id).order("position").order("created_at").execute()
                if res and res.data is not None and len(res.data) > 0:
                    return [dict(it) for it in res.data if isinstance(it, dict)]
            except Exception:
                pass

        items = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM ai_board_items WHERE project_id = ? ORDER BY position ASC, created_at ASC", (project_id,))
            for r in c.fetchall():
                item = dict(r)
                item["completed"] = bool(item.get("completed", 0))
                item["is_pinned"] = bool(item.get("is_pinned", 0))
                items.append(item)
        return items

    def save_board_item(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
        i_id = item_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Save to SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO ai_board_items (id, project_id, user_id, column_name, title, description, priority, source_type, source_id, completed, is_pinned, position, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    column_name=excluded.column_name,
                    title=excluded.title,
                    description=excluded.description,
                    priority=excluded.priority,
                    completed=excluded.completed,
                    is_pinned=excluded.is_pinned,
                    position=excluded.position,
                    updated_at=excluded.updated_at
            """, (
                i_id,
                item_data.get("project_id"),
                item_data.get("user_id", "demo-user"),
                item_data.get("column_name", "PROBLEM"),
                item_data.get("title", ""),
                item_data.get("description", ""),
                item_data.get("priority", "MEDIUM"),
                item_data.get("source_type", "manual"),
                item_data.get("source_id", ""),
                1 if item_data.get("completed") else 0,
                1 if item_data.get("is_pinned") else 0,
                item_data.get("position", 0),
                item_data.get("created_at", now),
                now
            ))
            conn.commit()

        # 2. Persist to Supabase Cloud
        if self.client:
            try:
                clean_uid = self._clean_user_id(item_data.get("user_id"))
                self.client.table("ai_board_items").upsert({
                    "id": i_id,
                    "project_id": item_data.get("project_id"),
                    "user_id": clean_uid,
                    "column_name": item_data.get("column_name", "PROBLEM"),
                    "title": item_data.get("title", ""),
                    "description": item_data.get("description", ""),
                    "priority": item_data.get("priority", "MEDIUM"),
                    "source_type": item_data.get("source_type", "manual"),
                    "source_id": item_data.get("source_id", ""),
                    "completed": bool(item_data.get("completed", False)),
                    "is_pinned": bool(item_data.get("is_pinned", False)),
                    "position": int(item_data.get("position", 0)),
                    "updated_at": now
                }).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud save_board_item error: {e}")

        # Return item
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM ai_board_items WHERE id = ?", (i_id,))
            res = dict(c.fetchone())
            res["completed"] = bool(res.get("completed", 0))
            res["is_pinned"] = bool(res.get("is_pinned", 0))
            return res

    def delete_board_item(self, item_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM ai_board_items WHERE id = ?", (item_id,))
            conn.commit()

        if self.client:
            try:
                self.client.table("ai_board_items").delete().eq("id", item_id).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud delete_board_item error: {e}")
        return True

    # =========================================================================
    # CHAT SESSIONS & MESSAGES
    # =========================================================================
    def get_chat_sessions(self, project_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("chat_sessions").select("*").eq("project_id", project_id).order("updated_at", desc=True).execute()
                if res and res.data is not None and len(res.data) > 0:
                    return [dict(cs) for cs in res.data if isinstance(cs, dict)]
            except Exception:
                pass

        sessions = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM chat_sessions WHERE project_id = ? ORDER BY updated_at DESC", (project_id,))
            for r in c.fetchall():
                sessions.append(dict(r))
        return sessions

    def create_chat_session(self, project_id: str, user_id: Optional[str] = "demo-user", title: Optional[str] = "New Conversation") -> Dict[str, Any]:
        s_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        uid = user_id or "demo-user"
        t = title or "New Conversation"
        
        # 1. SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO chat_sessions (id, project_id, user_id, title, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (s_id, project_id, uid, t, now, now))
            conn.commit()

        # 2. Supabase Cloud
        if self.client:
            try:
                clean_uid = self._clean_user_id(user_id)
                self.client.table("chat_sessions").insert({
                    "id": s_id,
                    "project_id": project_id,
                    "user_id": clean_uid,
                    "title": t,
                    "created_at": now,
                    "updated_at": now
                }).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud create_chat_session error: {e}")

        return {"id": s_id, "project_id": project_id, "user_id": uid, "title": t, "created_at": now, "updated_at": now}

    def get_chat_messages(self, session_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table("chat_messages").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
                if res and res.data is not None and len(res.data) > 0:
                    return [dict(m) for m in res.data if isinstance(m, dict)]
            except Exception:
                pass

        messages = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
            for r in c.fetchall():
                m = dict(r)
                m["citations"] = json.loads(m.get("citations") or "[]")
                messages.append(m)
        return messages

    def save_chat_message(self, session_id: str, role: str, content: str, citations: Optional[List[Dict[str, Any]]] = None, user_id: Optional[str] = "demo-user") -> Dict[str, Any]:
        m_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        uid = user_id or "demo-user"
        citations_list = citations or []
        
        # 1. SQLite
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO chat_messages (id, session_id, user_id, role, content, citations, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (m_id, session_id, uid, role, content, json.dumps(citations_list), now))
            c.execute("UPDATE chat_sessions SET updated_at = ? WHERE id = ?", (now, session_id))
            conn.commit()

        # 2. Supabase Cloud
        if self.client:
            try:
                clean_uid = self._clean_user_id(user_id)
                self.client.table("chat_messages").insert({
                    "id": m_id,
                    "session_id": session_id,
                    "user_id": clean_uid,
                    "role": role,
                    "content": content,
                    "citations": citations_list,
                    "created_at": now
                }).execute()
                self.client.table("chat_sessions").update({"updated_at": now}).eq("id", session_id).execute()
            except Exception as e:
                print(f"[SupabaseService] Cloud save_chat_message error: {e}")

        return {
            "id": m_id,
            "session_id": session_id,
            "user_id": uid,
            "role": role,
            "content": content,
            "citations": citations_list,
            "created_at": now
        }

supabase_service = SupabaseService()
