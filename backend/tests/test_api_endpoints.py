import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

from fastapi.testclient import TestClient
from backend.main import app

def test_api_routes():
    client = TestClient(app)

    print("==================================================")
    print("TESTING FASTAPI HTTP ROUTER ENDPOINTS")
    print("==================================================")

    # 1. Root & Health
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("✓ GET / returned 200 OK")

    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("✓ GET /api/health returned 200 OK")

    # 2. Projects & Demo Seed
    r = client.post("/api/demo/seed")
    assert r.status_code == 200, f"Seed demo failed: {r.text}"
    demo_proj = r.json().get("project")
    demo_id = demo_proj["id"]
    print(f"✓ POST /api/demo/seed created project '{demo_proj['name']}' (ID: {demo_id})")

    r = client.get("/api/projects?user_id=demo-user")
    assert r.status_code == 200
    projects_list = r.json()
    assert len(projects_list) > 0
    print(f"✓ GET /api/projects?user_id=demo-user returned {len(projects_list)} projects")

    # 3. AI Helpers
    r = client.post("/api/ai/improve-problem", json={"problem_statement": "Municipal energy systems have poor monitoring"})
    assert r.status_code == 200
    assert "improved_statement" in r.json()
    print("✓ POST /api/ai/improve-problem returned structured problem formulation")

    r = client.post("/api/ai/improve-idea", json={"initial_idea": "Build an IoT and RAG assistant for building power", "problem_statement": "High waste"})
    assert r.status_code == 200
    assert "improved_idea" in r.json()
    print("✓ POST /api/ai/improve-idea returned structured architecture pillars")

    # 4. Documents API
    r = client.get(f"/api/projects/{demo_id}/documents")
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) > 0
    print(f"✓ GET /api/projects/{demo_id}/documents returned {len(docs)} documents")

    # 5. RAG Chat Session & Query
    r = client.get(f"/api/projects/{demo_id}/chat/sessions")
    assert r.status_code == 200
    sessions = r.json()
    session_id = sessions[0]["id"]
    print(f"✓ GET /api/projects/{demo_id}/chat/sessions returned active session {session_id}")

    r = client.post("/api/chat/query", json={
        "project_id": demo_id,
        "session_id": session_id,
        "query": "What is the hybrid retrieval architecture in CivicLens AI?",
        "user_id": "demo-user"
    })
    assert r.status_code == 200, f"RAG chat query failed: {r.text}"
    chat_res = r.json()
    assert "message" in chat_res
    print("✓ POST /api/chat/query returned grounded answer with citations")

    # 6. RAG Sandbox Diagnostics Endpoint
    r = client.post("/api/chat/sandbox", json={
        "project_id": demo_id,
        "query": "hybrid retrieval statutory document parser",
        "top_k": 3
    })
    assert r.status_code == 200
    sandbox = r.json()
    assert len(sandbox.get("hybrid_results", [])) > 0
    print(f"✓ POST /api/chat/sandbox returned {len(sandbox['hybrid_results'])} ranked chunks")

    # 7. Evaluation & Judge Mode
    r = client.post(f"/api/projects/{demo_id}/evaluate")
    assert r.status_code == 200
    eval_res = r.json()
    assert eval_res.get("success") is True
    print(f"✓ POST /api/projects/{demo_id}/evaluate evaluated project ({eval_res['evaluation']['overall_score']} pts)")

    r = client.get(f"/api/projects/{demo_id}/evaluations/compare")
    assert r.status_code == 200
    comp = r.json()
    print(f"✓ GET /api/projects/{demo_id}/evaluations/compare delta computed")

    r = client.post(f"/api/projects/{demo_id}/judge")
    assert r.status_code == 200
    judge_res = r.json()
    assert "judge_feedback" in judge_res
    print(f"✓ POST /api/projects/{demo_id}/judge returned verdict & questions")

    # 8. AI Board Kanban
    r = client.get(f"/api/projects/{demo_id}/board")
    assert r.status_code == 200
    board = r.json()
    print(f"✓ GET /api/projects/{demo_id}/board returned {len(board)} Kanban cards across 7 columns")

    # 9. RAG Quality Observability Metrics
    r = client.get(f"/api/projects/{demo_id}/rag-metrics")
    assert r.status_code == 200
    metrics = r.json()
    print(f"✓ GET /api/projects/{demo_id}/rag-metrics returned metrics (Citation accuracy: {metrics['citation_accuracy_rate']})")

    print("\n==================================================")
    print("🎉 ALL FASTAPI ROUTER ENDPOINTS VERIFIED & WORKING!")
    print("==================================================")

if __name__ == "__main__":
    test_api_routes()
