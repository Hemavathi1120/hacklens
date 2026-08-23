import math
import re
import json
import sqlite3
from typing import List, Dict, Any, Optional, Set
from collections import defaultdict
from pathlib import Path
from backend.config import settings
from backend.services.transformer_service import transformer_service
from backend.services.supabase_service import supabase_service

class BM25Index:
    """
    High-performance in-memory BM25 Inverted Index with stopword filtering,
    IDF calculation, and document length normalization.
    """
    STOPWORDS: Set[str] = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any",
        "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
        "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't",
        "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from",
        "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd",
        "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his",
        "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
        "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
        "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
        "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll",
        "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
        "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they",
        "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
        "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
        "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
        "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
        "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
    }

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_len: Dict[str, int] = {}
        self.inverted_index: Dict[str, Dict[str, int]] = defaultdict(dict)  # term -> {chunk_id: tf}
        self.doc_map: Dict[str, Dict[str, Any]] = {}
        self.project_chunks: Dict[str, Set[str]] = defaultdict(set)  # project_id -> set of chunk_ids
        self.total_docs: int = 0
        self.avgdl: float = 0.0

    def tokenize(self, text: str) -> List[str]:
        tokens = re.findall(r'\b[a-zA-Z0-9_\-\.]+\b', text.lower())
        return [t for t in tokens if len(t) > 1 and t not in self.STOPWORDS]

    def add_chunk(self, chunk: Dict[str, Any]):
        chunk_id = chunk["id"]
        project_id = chunk.get("project_id", "")
        content = chunk.get("content", "") + " " + chunk.get("section_title", "")
        
        tokens = self.tokenize(content)
        d_len = len(tokens)
        
        self.doc_len[chunk_id] = d_len
        self.doc_map[chunk_id] = chunk
        self.project_chunks[project_id].add(chunk_id)

        tf_map = defaultdict(int)
        for t in tokens:
            tf_map[t] += 1

        for t, tf in tf_map.items():
            self.inverted_index[t][chunk_id] = tf

        self.total_docs = len(self.doc_len)
        if self.total_docs > 0:
            self.avgdl = sum(self.doc_len.values()) / self.total_docs

    def remove_chunk(self, chunk_id: str, project_id: Optional[str] = None):
        if chunk_id in self.doc_len:
            del self.doc_len[chunk_id]
        if chunk_id in self.doc_map:
            del self.doc_map[chunk_id]
        if project_id and project_id in self.project_chunks:
            self.project_chunks[project_id].discard(chunk_id)
        
        # Remove from inverted index
        for term, postings in list(self.inverted_index.items()):
            if chunk_id in postings:
                del postings[chunk_id]
                if not postings:
                    del self.inverted_index[term]

        self.total_docs = len(self.doc_len)
        self.avgdl = (sum(self.doc_len.values()) / self.total_docs) if self.total_docs > 0 else 0.0

    def search(self, query: str, project_id: str, top_k: int = 10) -> List[Dict[str, Any]]:
        query_tokens = self.tokenize(query)
        if not query_tokens or self.total_docs == 0:
            return []

        project_chunk_ids = self.project_chunks.get(project_id, set())
        if not project_chunk_ids:
            return []

        scores = defaultdict(float)
        N = len(project_chunk_ids)

        for term in query_tokens:
            if term not in self.inverted_index:
                continue
            postings = self.inverted_index[term]
            
            # Match postings belonging to this project
            matched_in_project = {cid: tf for cid, tf in postings.items() if cid in project_chunk_ids}
            df = len(matched_in_project)
            if df == 0:
                continue

            # Robertson-Spärck Jones IDF
            idf = math.log(1.0 + (N - df + 0.5) / (df + 0.5))

            for cid, tf in matched_in_project.items():
                d_len = self.doc_len.get(cid, self.avgdl)
                tf_component = (tf * (self.k1 + 1.0)) / (tf + self.k1 * (1.0 - self.b + self.b * (d_len / (self.avgdl or 1.0))))
                scores[cid] += idf * tf_component

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        results = []
        for cid, score in ranked[:top_k]:
            item = dict(self.doc_map[cid])
            item["bm25_score"] = round(score, 4)
            results.append(item)
        return results


class RAGDatabase:
    """
    Dual Vector Database Interface managing:
    1. Supabase pgvector (Cloud PostgreSQL Vector Index)
    2. Local Persistent SQLite Vector Store (High-speed zero-latency Vector DB)
    3. BM25 Lexical Inverted Index with Reciprocal Rank Fusion (RRF)
    
    Guarantees that all RAG data is persisted in the database engine and never in codebase.
    """

    def __init__(self):
        self.db_path = Path(__file__).resolve().parent.parent / "data" / "projectlens.db"
        self.bm25_index = BM25Index()
        self._sync_bm25_index()

    def _sync_bm25_index(self):
        """Indexes all existing chunks from the database table into BM25 on startup."""
        if not self.db_path.exists():
            return
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("""
                SELECT dc.*, d.filename 
                FROM document_chunks dc
                LEFT JOIN documents d ON dc.document_id = d.id
            """)
            rows = c.fetchall()
            for r in rows:
                ch = dict(r)
                if ch.get("metadata"):
                    try:
                        ch["metadata"] = json.loads(ch["metadata"])
                    except Exception:
                        ch["metadata"] = {}
                self.bm25_index.add_chunk(ch)
        print(f"[RAGDatabase] Synchronized {self.bm25_index.total_docs} chunks from Vector Database into BM25 Lexical Index.")

    def dense_vector_search(
        self,
        project_id: str,
        query_embedding: List[float],
        top_k: int = 10,
        similarity_threshold: float = 0.15
    ) -> List[Dict[str, Any]]:
        """
        Executes dense semantic vector search.
        First tries Supabase pgvector if connected; seamlessly utilizes Local Persistent Vector Store.
        """
        # 1. Try Supabase pgvector RPC or direct table query if connected
        if supabase_service.client:
            try:
                rpc_res = supabase_service.client.rpc("match_documents", {
                    "query_embedding": query_embedding,
                    "match_threshold": similarity_threshold,
                    "match_count": top_k,
                    "p_project_id": project_id
                }).execute()
                if rpc_res and isinstance(rpc_res.data, list) and len(rpc_res.data) > 0:
                    search_hits = []
                    for r in rpc_res.data:
                        if isinstance(r, dict):
                            meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
                            raw_sim = r.get("similarity")
                            sim_val = float(raw_sim) if isinstance(raw_sim, (int, float, str)) else 0.0
                            search_hits.append({
                                "id": r.get("id"),
                                "document_id": r.get("document_id"),
                                "project_id": r.get("project_id"),
                                "chunk_index": r.get("chunk_index", 0),
                                "content": r.get("content", ""),
                                "page_number": r.get("page_number", 1),
                                "section_title": r.get("section_title", "Section"),
                                "similarity": round(sim_val, 4),
                                "metadata": meta,
                                "filename": meta.get("filename", "Project Document")
                            })
                    return search_hits
            except Exception:
                pass

            # Direct Supabase table query if RPC is not deployed
            try:
                sb_res = supabase_service.client.table("document_chunks").select("id, document_id, project_id, chunk_index, content, page_number, section_title, embedding, metadata").eq("project_id", project_id).execute()
                if sb_res and sb_res.data and len(sb_res.data) > 0:
                    hits = []
                    for r in sb_res.data:
                        emb = r.get("embedding")
                        if emb:
                            if isinstance(emb, str):
                                try:
                                    emb = json.loads(emb)
                                except Exception:
                                    continue
                            sim = transformer_service.cosine_similarity(query_embedding, emb)
                            if sim >= similarity_threshold:
                                item = dict(r)
                                item.pop("embedding", None)
                                meta = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
                                item["similarity"] = round(sim, 4)
                                item["filename"] = meta.get("filename", "Project Document")
                                hits.append(item)
                    hits.sort(key=lambda x: x["similarity"], reverse=True)
                    if hits:
                        return hits[:top_k]
            except Exception:
                pass

        # 2. Local Persistent SQLite Vector Table Search
        results = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("""
                SELECT dc.*, d.filename 
                FROM document_chunks dc
                LEFT JOIN documents d ON dc.document_id = d.id
                WHERE dc.project_id = ?
            """, (project_id,))
            rows = c.fetchall()

            for row in rows:
                emb_str = row["embedding"]
                if not emb_str:
                    continue
                try:
                    emb = json.loads(emb_str)
                    sim = transformer_service.cosine_similarity(query_embedding, emb)
                    if sim >= similarity_threshold:
                        item = dict(row)
                        item.pop("embedding", None)
                        if item.get("metadata"):
                            try:
                                item["metadata"] = json.loads(item["metadata"])
                            except Exception:
                                item["metadata"] = {}
                        item["similarity"] = round(sim, 4)
                        results.append(item)
                except Exception:
                    continue

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    def sparse_bm25_search(
        self,
        project_id: str,
        query: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Sparse lexical BM25 search for exact identifiers, acronyms, and statutory keywords."""
        return self.bm25_index.search(query=query, project_id=project_id, top_k=top_k)

    def hybrid_search(
        self,
        project_id: str,
        query: str,
        query_embedding: Optional[List[float]] = None,
        top_k: int = 6,
        similarity_threshold: float = 0.15,
        dense_weight: float = 0.65,
        sparse_weight: float = 0.35,
        rrf_k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Hybrid Search combining Dense Vector Search + BM25 Lexical Matching
        via Reciprocal Rank Fusion (RRF).
        """
        if query_embedding is None:
            query_embedding = transformer_service.generate_embedding(query)

        # 1. Retrieve candidates from Dense and Sparse streams
        dense_results = self.dense_vector_search(
            project_id=project_id,
            query_embedding=query_embedding,
            top_k=20,
            similarity_threshold=similarity_threshold
        )
        sparse_results = self.sparse_bm25_search(
            project_id=project_id,
            query=query,
            top_k=20
        )

        # 2. Compute Reciprocal Rank Fusion (RRF) Scores
        rrf_scores: Dict[str, float] = defaultdict(float)
        chunk_lookup: Dict[str, Dict[str, Any]] = {}

        # Dense rank fusion
        for rank, item in enumerate(dense_results):
            cid = item["id"]
            chunk_lookup[cid] = item
            rrf_scores[cid] += dense_weight * (1.0 / (rrf_k + rank + 1))

        # Sparse rank fusion
        for rank, item in enumerate(sparse_results):
            cid = item["id"]
            if cid not in chunk_lookup:
                chunk_lookup[cid] = item
            else:
                chunk_lookup[cid]["bm25_score"] = item.get("bm25_score", 0.0)
            rrf_scores[cid] += sparse_weight * (1.0 / (rrf_k + rank + 1))

        # 3. Sort by fused RRF score
        fused_items = []
        for cid, score in rrf_scores.items():
            item = chunk_lookup[cid]
            item["rrf_score"] = round(score, 6)
            if "similarity" not in item:
                item["similarity"] = 0.0
            if "bm25_score" not in item:
                item["bm25_score"] = 0.0
            fused_items.append(item)

        fused_items.sort(key=lambda x: x["rrf_score"], reverse=True)
        return fused_items[:top_k]

    def register_chunk(self, chunk: Dict[str, Any]):
        """Registers a new chunk into the BM25 index."""
        self.bm25_index.add_chunk(chunk)

    def delete_document_chunks(self, document_id: str, project_id: str):
        """Removes all chunks of a document from BM25 index."""
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("SELECT id FROM document_chunks WHERE document_id = ?", (document_id,))
            c_ids = [r[0] for r in c.fetchall()]
            for cid in c_ids:
                self.bm25_index.remove_chunk(cid, project_id)

rag_database = RAGDatabase()
