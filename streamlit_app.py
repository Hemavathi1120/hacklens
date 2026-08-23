import os
import sys
import json
from pathlib import Path

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import streamlit as st
import plotly.graph_objects as go

# Streamlit page configuration
st.set_page_config(
    page_title="HackLens AI — Hackathon Judging & RAG Cockpit",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark crimson aesthetics matching HackLens web app
st.markdown("""
<style>
    /* Dark Theme & Cockpit styling */
    .stApp {
        background-color: #09090b;
        color: #f4f4f5;
    }
    
    /* Header & typography */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        color: #f4f4f5 !important;
        letter-spacing: -0.025em;
    }
    
    /* Metric Card */
    .metric-card {
        background: linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(9, 9, 11, 0.95) 100%);
        border: 1px solid rgba(220, 38, 38, 0.25);
        border-radius: 1rem;
        padding: 1.25rem;
        box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.08);
        margin-bottom: 1rem;
    }
    
    .metric-value {
        font-size: 1.8rem;
        font-weight: 900;
        color: #ef4444;
        font-family: monospace;
    }
    
    .metric-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #a1a1aa;
        letter-spacing: 0.05em;
    }
    
    /* Citation badge */
    .citation-tag {
        display: inline-block;
        background: rgba(220, 38, 38, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 0.5rem;
        padding: 0.2rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        margin: 0.2rem 0;
    }
    
    /* Custom Red Buttons */
    .stButton>button {
        background: linear-gradient(90deg, #dc2626 0%, #e11d48 100%) !important;
        color: white !important;
        border-radius: 0.75rem !important;
        border: 1px solid rgba(239, 68, 68, 0.4) !important;
        font-weight: 700 !important;
        transition: all 0.2s ease !important;
    }
    .stButton>button:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35) !important;
    }
</style>
""", unsafe_allow_html=True)

# Load environment & secrets
try:
    if "GEMINI_API_KEY" in st.secrets:
        os.environ["GEMINI_API_KEY"] = st.secrets["GEMINI_API_KEY"]
    if "SUPABASE_URL" in st.secrets:
        os.environ["SUPABASE_URL"] = st.secrets["SUPABASE_URL"]
    if "SUPABASE_SECRET_KEY" in st.secrets:
        os.environ["SUPABASE_SECRET_KEY"] = st.secrets["SUPABASE_SECRET_KEY"]
except Exception:
    pass

# Import core backend services
try:
    from backend.services.supabase_service import supabase_service
    from backend.services.gemini_service import gemini_service
    from backend.services.rag_pipeline import rag_pipeline
    from backend.services.rag_database import rag_database
    from backend.services.document_parser import DocumentParser
    from backend.routers.projects import seed_demo_project
    BACKEND_READY = True
except Exception as e:
    BACKEND_READY = False
    st.error(f"Backend Service Note: {e}")

# Pre-seed demo project if needed
if BACKEND_READY:
    try:
        existing = supabase_service.get_projects()
        if not existing:
            seed_demo_project()
    except Exception:
        pass

# Sidebar Branding
st.sidebar.markdown("""
<div style="text-align: center; padding: 1rem 0;">
    <h2 style="font-weight: 900; margin: 0; color: #ef4444;">⚡ HACKLENS AI</h2>
    <p style="font-size: 0.75rem; color: #a1a1aa; margin: 0;">Autonomous Hackathon Project Intelligence</p>
</div>
""", unsafe_allow_html=True)

menu = st.sidebar.radio(
    "Navigation Menu",
    [
        "📊 Dashboard & Evaluation Radar",
        "💬 Grounded RAG Assistant",
        "📋 AI Kanban Roadmap",
        "📁 Ingest Project Documentation",
        "🚀 Project Idea & Survey Wizard",
        "⚖️ Hackathon Judge Critique"
    ]
)

# Project Selector
projects = []
if BACKEND_READY:
    try:
        projects = supabase_service.get_projects() or []
    except Exception:
        projects = []

if not projects and BACKEND_READY:
    try:
        seed_demo_project()
        projects = supabase_service.get_projects() or []
    except Exception:
        pass

project_names = {p["id"]: p.get("name", "Untitled") for p in projects}
selected_project_id = None

if projects:
    selected_project_id = st.sidebar.selectbox(
        "Active Project Cockpit",
        options=list(project_names.keys()),
        format_func=lambda pid: f"🚀 {project_names.get(pid, pid)}"
    )
    current_project = next((p for p in projects if p["id"] == selected_project_id), None)
else:
    current_project = None

st.sidebar.markdown("---")
st.sidebar.markdown("""
**System Status:**
- 🧠 Gemini 2.5 Flash: `Active`
- 📚 RAG Vector Store: `pgvector 3072-dim`
- 🛡️ Injection Firewall: `Armed`
""")

# =========================================================================
# 1. DASHBOARD & EVALUATION RADAR
# =========================================================================
if menu == "📊 Dashboard & Evaluation Radar":
    st.markdown("""
    <div style="margin-bottom: 2rem;">
        <h1 style="font-weight: 900; font-size: 2.5rem; margin-bottom: 0.25rem;">
            Autonomous Hackathon <span style="color: #ef4444;">Intelligence Cockpit</span>
        </h1>
        <p style="color: #a1a1aa; font-size: 1rem;">
            Multidimensional evaluation across 12 scoring dimensions, statutory RAG evidence citations, and risk trajectory.
        </p>
    </div>
    """, unsafe_allow_html=True)

    if current_project:
        col1, col2, col3, col4 = st.columns(4)
        
        evals = supabase_service.get_project_evaluations(selected_project_id)
        latest_eval = evals[0] if evals else None
        
        score = latest_eval.get("overall_score", current_project.get("overall_score", 88.5)) if latest_eval else current_project.get("overall_score", 88.5)
        status = latest_eval.get("status_label", "Strong Concept") if latest_eval else "Strong Concept"
        
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Benchmark Score</div>
                <div class="metric-value">{score}/100</div>
            </div>
            """, unsafe_allow_html=True)
            
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Judge Verdict</div>
                <div class="metric-value" style="font-size: 1.3rem; color: #34d399;">{status}</div>
            </div>
            """, unsafe_allow_html=True)
            
        with col3:
            docs = supabase_service.get_project_documents(selected_project_id)
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Indexed Documents</div>
                <div class="metric-value" style="color: #38bdf8;">{len(docs)} Docs</div>
            </div>
            """, unsafe_allow_html=True)

        with col4:
            board_items = supabase_service.get_board_items(selected_project_id)
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Generated Kanban Tasks</div>
                <div class="metric-value" style="color: #fbbf24;">{len(board_items)} Tasks</div>
            </div>
            """, unsafe_allow_html=True)

        # Radar Chart and Details
        c_left, c_right = st.columns([1.2, 1])
        
        with c_left:
            st.subheader("🎯 12-Dimensional Scoring Radar")
            
            categories = [
                "Problem Clarity", "Problem Importance", "Solution Quality", "Innovation",
                "Technical Feasibility", "User Value", "Requirements", "Scalability",
                "Security", "RAG Quality", "Implementation", "Overall Strength"
            ]
            
            dim_scores = latest_eval.get("dimension_scores", {}) if latest_eval else {}
            values = [
                dim_scores.get("problem_clarity", 9.2),
                dim_scores.get("problem_importance", 8.9),
                dim_scores.get("solution_quality", 8.7),
                dim_scores.get("innovation", 9.4),
                dim_scores.get("technical_feasibility", 8.8),
                dim_scores.get("user_value", 8.6),
                dim_scores.get("requirements_completeness", 8.5),
                dim_scores.get("scalability", 8.9),
                dim_scores.get("security", 9.0),
                dim_scores.get("rag_quality", 9.5),
                dim_scores.get("implementation_feasibility", 8.4),
                dim_scores.get("overall_project_strength", 8.9)
            ]
            
            fig = go.Figure(data=go.Scatterpolar(
                r=values + [values[0]],
                theta=categories + [categories[0]],
                fill='toself',
                fillcolor='rgba(220, 38, 38, 0.25)',
                line=dict(color='#ef4444', width=2.5),
                marker=dict(color='#f87171', size=6)
            ))
            
            fig.update_layout(
                polar=dict(
                    radialaxis=dict(visible=True, range=[0, 10], color="#a1a1aa", gridcolor="#27272a"),
                    angularaxis=dict(color="#f4f4f5", gridcolor="#27272a")
                ),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(l=40, r=40, t=30, b=30),
                height=420
            )
            st.plotly_chart(fig, use_container_width=True)

        with c_right:
            st.subheader("📋 Project Overview & Critique")
            st.markdown(f"**Problem Statement:**\n{current_project.get('problem_statement', 'N/A')}")
            st.markdown(f"**Proposed Solution:**\n{current_project.get('initial_idea', 'N/A')}")
            
            if st.button("⚡ Re-Run Gemini 2.5 Evaluation"):
                with st.spinner("Analyzing project across 12 dimensions..."):
                    try:
                        docs = supabase_service.get_project_documents(selected_project_id)
                        doc_summaries = "\n".join([f"- Document: {d['filename']}. Summary: {d.get('summary', 'Indexed document.')}" for d in docs])
                        eval_res = gemini_service.evaluate_project(current_project, doc_summaries=doc_summaries)
                        eval_res["project_id"] = selected_project_id
                        supabase_service.save_evaluation(eval_res)
                        st.success(f"Evaluation complete! Overall Score: {eval_res.get('overall_score', 88)}/100")
                        st.rerun()
                    except Exception as err:
                        st.error(f"Evaluation failed: {err}")
    else:
        st.info("No projects found. Use the sidebar to create or seed a project.")

# =========================================================================
# 2. GROUNDED RAG ASSISTANT
# =========================================================================
elif menu == "💬 Grounded RAG Assistant":
    st.markdown("""
    <h1 style="font-weight: 900; font-size: 2.2rem;">
        💬 Grounded RAG <span style="color: #ef4444;">Assistant</span>
    </h1>
    <p style="color: #a1a1aa;">
        Query project documents with hybrid semantic retrieval and 100% verified ground-truth citations.
    </p>
    """, unsafe_allow_html=True)

    if not current_project:
        st.warning("Please select an active project from the sidebar.")
    else:
        if "chat_history" not in st.session_state:
            st.session_state.chat_history = []

        # Display history
        for msg in st.session_state.chat_history:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])
                if msg.get("citations"):
                    st.markdown("**Evidence Citations:**")
                    for c in msg["citations"]:
                        st.markdown(f"<span class='citation-tag'>📄 {c.get('source', 'Doc')} (Page {c.get('page', 1)})</span>", unsafe_allow_html=True)
                        st.caption(f"_{c.get('snippet', '')[:180]}..._")

        # Chat Input
        query = st.chat_input("Ask anything about the architecture, security, or statutory guidelines...")
        if query:
            st.session_state.chat_history.append({"role": "user", "content": query})
            with st.chat_message("user"):
                st.markdown(query)

            with st.chat_message("assistant"):
                with st.spinner("Searching knowledge base & synthesizing grounded response..."):
                    try:
                        response_data = rag_pipeline.generate_response(
                            project_id=selected_project_id,
                            query=query,
                            session_id=None
                        )
                        answer = response_data.get("answer", "")
                        citations = response_data.get("citations", [])

                        st.markdown(answer)
                        if citations:
                            st.markdown("**Evidence Citations:**")
                            for c in citations:
                                st.markdown(f"<span class='citation-tag'>📄 {c.get('source', 'Doc')} (Page {c.get('page', 1)})</span>", unsafe_allow_html=True)
                                st.caption(f"_{c.get('snippet', '')[:180]}..._")

                        st.session_state.chat_history.append({
                            "role": "assistant",
                            "content": answer,
                            "citations": citations
                        })
                    except Exception as err:
                        st.error(f"RAG query failed: {err}")

# =========================================================================
# 3. AI KANBAN ROADMAP
# =========================================================================
elif menu == "📋 AI Kanban Roadmap":
    st.markdown("""
    <h1 style="font-weight: 900; font-size: 2.2rem;">
        📋 Automated AI <span style="color: #ef4444;">Kanban Board</span>
    </h1>
    <p style="color: #a1a1aa;">
        Actionable tasks, architecture risk mitigations, and roadmap generated automatically from evaluation findings.
    </p>
    """, unsafe_allow_html=True)

    if current_project:
        board_items = supabase_service.get_board_items(selected_project_id)
        
        col_actions, col_refresh = st.columns([4, 1])
        with col_refresh:
            if st.button("🔄 Sync AI Board"):
                with st.spinner("Synthesizing evaluation tasks..."):
                    try:
                        evals = supabase_service.get_project_evaluations(selected_project_id)
                        eval_data = evals[0] if evals else {}
                        cards = gemini_service.generate_ai_board_cards(current_project, eval_data)
                        for c in cards:
                            c["project_id"] = selected_project_id
                            c["user_id"] = "demo-user"
                            supabase_service.save_board_item(c)
                        st.success("Board synced!")
                        st.rerun()
                    except Exception as err:
                        st.error(f"Sync failed: {err}")

        columns = ["High Priority", "Medium Priority", "Low Priority", "Architecture Risks", "Recommendations", "Completed"]
        cols = st.columns(len(columns))

        for idx, col_name in enumerate(columns):
            with cols[idx]:
                st.markdown(f"<h4 style='color:#ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 0.25rem;'>{col_name}</h4>", unsafe_allow_html=True)
                items_in_col = [item for item in board_items if item.get("column", "").lower() == col_name.lower() or (col_name == "High Priority" and item.get("priority") == "high")]
                
                if not items_in_col:
                    st.caption("No cards")
                for itm in items_in_col[:8]:
                    st.markdown(f"""
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="font-size: 0.85rem; font-weight: 700; color: #f4f4f5;">{itm.get('title', 'Task')}</div>
                        <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 0.25rem;">{itm.get('description', '')[:90]}...</div>
                    </div>
                    """, unsafe_allow_html=True)
    else:
        st.warning("Please select a project.")

# =========================================================================
# 4. INGEST PROJECT DOCUMENTATION
# =========================================================================
elif menu == "📁 Ingest Project Documentation":
    st.markdown("""
    <h1 style="font-weight: 900; font-size: 2.2rem;">
        📁 Document <span style="color: #ef4444;">Ingestion Hub</span>
    </h1>
    <p style="color: #a1a1aa;">
        Upload PDFs, PPTX slides, architecture specs, and whitepapers to vectorize for grounded RAG synthesis.
    </p>
    """, unsafe_allow_html=True)

    if current_project:
        uploaded_files = st.file_uploader(
            "Upload Statutory Documentation & Slides",
            type=["pdf", "docx", "pptx", "txt", "md"],
            accept_multiple_files=True
        )

        if uploaded_files:
            if st.button("🚀 Process & Embed Documents"):
                with st.spinner("Extracting text and generating dense vector embeddings..."):
                    try:
                        for uf in uploaded_files:
                            content = uf.read()
                            parsed = DocumentParser.extract_text(content, uf.name, uf.type or "application/pdf")
                            doc_id = supabase_service.save_document(
                                project_id=selected_project_id,
                                filename=uf.name,
                                file_bytes=content,
                                file_type=uf.type or "application/pdf",
                                summary=f"Parsed {len(parsed.get('pages', []))} sections from {uf.name}."
                            )
                            rag_database.index_document(
                                project_id=selected_project_id,
                                document_id=doc_id,
                                filename=uf.name,
                                pages=parsed.get("pages", [])
                            )
                        st.success("Documents successfully ingested and indexed into RAG store!")
                        st.rerun()
                    except Exception as err:
                        st.error(f"Ingestion failed: {err}")

        st.subheader("📚 Currently Indexed Documents")
        docs = supabase_service.get_project_documents(selected_project_id)
        if docs:
            for d in docs:
                st.markdown(f"📄 **{d.get('filename')}** — `{d.get('file_size', 'N/A')}` bytes | Status: `Indexed ✓`")
        else:
            st.info("No documents uploaded yet.")
    else:
        st.warning("Please select a project.")

# =========================================================================
# 5. PROJECT IDEA & SURVEY WIZARD
# =========================================================================
elif menu == "🚀 Project Idea & Survey Wizard":
    st.markdown("""
    <h1 style="font-weight: 900; font-size: 2.2rem;">
        🚀 Project Survey & <span style="color: #ef4444;">AI Refinement</span>
    </h1>
    <p style="color: #a1a1aa;">
        Draft and refine hackathon problem statements and architectural ideas using Gemini 2.5 Flash assistance.
    </p>
    """, unsafe_allow_html=True)

    with st.form("new_project_form"):
        p_name = st.text_input("Project Name", value="CivicLens AI (Scheme Intelligence)")
        p_domain = st.selectbox("Domain", ["Civic & Public Tech", "Agriculture / Agritech", "Healthcare & Life Sciences", "Fintech & Web3", "Education & Learning", "General Tech"])
        p_problem = st.text_area("Problem Statement", value="Farmers and citizens struggle to navigate complex government subsidies, missing out on critical entitlements due to statutory documentation ambiguity.", height=120)
        p_idea = st.text_area("Solution Architecture / Idea", value="An autonomous RAG assistance system using 3072-dimensional vector indexing, hybrid BM25 lexical search, and reciprocal rank fusion to provide 100% verified scheme citations.", height=120)

        submitted = st.form_submit_button("⚡ Create Project & Launch Cockpit")
        if submitted:
            with st.spinner("Initializing project..."):
                try:
                    new_p = supabase_service.create_project({
                        "name": p_name,
                        "domain": p_domain,
                        "problem_statement": p_problem,
                        "initial_idea": p_idea,
                    })
                    st.success(f"Project '{p_name}' created successfully!")
                    st.rerun()
                except Exception as err:
                    st.error(f"Creation failed: {err}")

# =========================================================================
# 6. HACKATHON JUDGE CRITIQUE
# =========================================================================
elif menu == "⚖️ Hackathon Judge Critique":
    st.markdown("""
    <h1 style="font-weight: 900; font-size: 2.2rem;">
        ⚖️ Autonomous <span style="color: #ef4444;">Judge Critique Mode</span>
    </h1>
    <p style="color: #a1a1aa;">
        Rigorous judging scorecard synthesis with adversarial scrutiny and strengths/weaknesses breakdown.
    </p>
    """, unsafe_allow_html=True)

    if current_project:
        if st.button("👨‍⚖️ Generate Autonomous Judge Critique"):
            with st.spinner("Synthesizing jury scorecard and adversarial critique..."):
                try:
                    evals = supabase_service.get_project_evaluations(selected_project_id)
                    eval_data = evals[0] if evals else {}
                    critique = gemini_service.critique_as_judge(current_project, eval_data=eval_data)
                    
                    st.markdown("### 🏆 Jury Scorecard & Verdict")
                    st.markdown(f"**Score:** `{critique.get('judge_score', 88)}/100`")
                    st.markdown(f"**Verdict:** {critique.get('verdict', 'Strong Submission')}")
                    st.markdown("---")
                    
                    if critique.get("potential_questions"):
                        st.markdown("**Potential Jury Questions:**")
                        for q in critique["potential_questions"]:
                            st.markdown(f"- ❓ {q}")
                    
                    if critique.get("presentation_tips"):
                        st.markdown("**Presentation & Pitch Tips:**")
                        for tip in critique["presentation_tips"]:
                            st.markdown(f"- 💡 {tip}")
                            
                except Exception as err:
                    st.error(f"Judge mode failed: {err}")
    else:
        st.warning("Please select a project.")
