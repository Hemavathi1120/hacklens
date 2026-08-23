import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  RotateCw, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  FileCode,
  Layers
} from 'lucide-react';
import UploadZone from '../components/UploadZone';
import { api } from '../lib/api';

export default function DocumentManagementPage() {
  const { project, fetchProject } = useOutletContext();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reprocessingId, setReprocessingId] = useState(null);
  
  // Document Viewer Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docDetailsLoading, setDocDetailsLoading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments(project.id);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [project.id]);

  const handleReprocess = async (docId) => {
    setReprocessingId(docId);
    try {
      await api.reprocessDocument(docId);
      await fetchDocs();
      await fetchProject();
    } catch (err) {
      alert(err.message || 'Failed to reprocess document');
    } finally {
      setReprocessingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document and its embeddings?')) {
      try {
        await api.deleteDocument(docId);
        setDocuments(prev => prev.filter(d => d.id !== docId));
        await fetchProject();
      } catch (err) {
        alert('Failed to delete document');
      }
    }
  };

  const handleViewDoc = async (docId) => {
    setDocDetailsLoading(true);
    try {
      const details = await api.getDocument(docId);
      setSelectedDoc(details);
    } catch (err) {
      alert('Failed to load document preview');
    } finally {
      setDocDetailsLoading(false);
    }
  };

  const handleAskAI = (doc) => {
    navigate(`/projects/${project.id}/chat?query=${encodeURIComponent(`Summarize the key findings from ${doc.filename}`)}`);
  };

  return (
    <div className="space-y-8 text-zinc-100">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm">
        <h3 className="text-xl font-bold font-display text-zinc-100">
          Project Documentation
        </h3>
        <p className="text-xs text-zinc-400 mt-1 font-normal">
          Upload and manage files (PDF, PPT, DOCX, TXT, MD) to power your grounded RAG assistant.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone
        projectId={project.id}
        onUploadSuccess={() => {
          fetchDocs();
          fetchProject();
        }}
      />

      {/* Document List Table / Cards */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
              Indexed Documents ({documents.length})
            </h4>
          </div>
          <button
            onClick={fetchDocs}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Refresh documents"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
            <p className="text-xs text-zinc-500">No documents uploaded yet for this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  <th className="pb-3">Document</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Chunks</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {documents.map((doc) => {
                  const isIndexed = doc.processing_status === 'indexed';
                  const isFailed = doc.processing_status === 'failed';
                  const isReprocessing = reprocessingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 font-medium text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-zinc-800 text-red-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-zinc-700">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-100 truncate max-w-xs block">
                              {doc.filename}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono font-medium">v{doc.document_version || 1}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-zinc-400 uppercase font-mono text-[10px] font-bold">
                        {doc.file_type ? doc.file_type.split('/').pop() : 'FILE'}
                      </td>

                      <td className="py-3.5 text-zinc-400 font-medium">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </td>

                      <td className="py-3.5 text-zinc-200 font-bold">
                        {doc.chunk_count || 0} chunks
                      </td>

                      <td className="py-3.5">
                        {isIndexed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Indexed ✓
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" /> Extraction Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDoc(doc.id)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="View Extracted Chunks"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAskAI(doc)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Ask AI About Document"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReprocess(doc.id)}
                            disabled={isReprocessing}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                            title="Reprocess Document"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-5 shadow-2xl text-zinc-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-zinc-100">{selectedDoc.filename}</h3>
                  <p className="text-xs text-zinc-500">
                    {selectedDoc.chunks?.length || 0} Semantic Chunks • 3072-dim Vector Embeddings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300">
              <span className="text-[10px] font-bold uppercase text-zinc-500 font-mono">Summary / Overview:</span>
              <p className="mt-1 leading-relaxed italic">{selectedDoc.summary || 'No summary available.'}</p>
            </div>

            {/* Chunks List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
                Vector Indexed Chunks ({selectedDoc.chunks?.length || 0})
              </span>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {selectedDoc.chunks?.map((chunk, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                      <span>Chunk #{chunk.chunk_index + 1} • Page {chunk.page_number}</span>
                      <span className="text-red-400 font-semibold">{chunk.section_title || 'General'}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
