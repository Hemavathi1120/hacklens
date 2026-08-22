import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

from backend.services.supabase_service import supabase_service
from backend.services.rag_pipeline import rag_pipeline
from backend.routers import projects

def test_tuned_rag_queries():
    print("==================================================")
    print("TESTING TUNED, DATA-CONSTRAINED RAG CHAT RESPONSES")
    print("==================================================")

    # Seed demo project if needed
    seed_res = projects.seed_demo_project()
    project_id = seed_res["project_id"]

    test_queries = [
        "What is the main problem we are solving?",
        "How does the platform prevent hallucinations and ensure grounding?",
        "What are the key technical requirements and architecture?",
        "What are the risks and how do we prepare for judge questions?",
        "What is the best way to bake a chocolate cake?" # Should be rejected by scope boundary
    ]

    for q in test_queries:
        print(f"\n💬 Query: \"{q}\"")
        res = rag_pipeline.query(
            project_id=project_id,
            user_query=q,
            user_id="demo-user"
        )
        msg = res.get("message", {})
        content = msg.get("content", "")
        cites = msg.get("citations", [])

        print("--- Response ---")
        for line in content.split("\n"):
            if line.strip():
                print(f"  {line}")
        print(f"--- Citations ({len(cites)}): {[c.get('filename') for c in cites]} ---")

if __name__ == "__main__":
    test_tuned_rag_queries()
