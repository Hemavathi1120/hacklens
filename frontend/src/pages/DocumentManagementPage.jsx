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
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-white">
          Project Documentation
        </h3>
        <p className="text-xs text-slate-400 mt-1">
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
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Indexed Documents ({documents.length})
            </h4>
          </div>
          <button
            onClick={fetchDocs}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh documents"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">No documents uploaded yet for this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Document</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Chunks</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {documents.map((doc) => {
                  const isIndexed = doc.processing_status === 'indexed';
                  const isFailed = doc.processing_status === 'failed';
                  const isReprocessing = reprocessingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 font-medium text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 truncate max-w-xs block">
                              {doc.filename}
                            </span>
                            <span className="text-[10px] text-slate-500">v{doc.document_version || 1}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-slate-400 uppercase font-mono text-[10px]">
                        {doc.file_type ? doc.file_type.split('/').pop() : 'FILE'}
                      </td>

                      <td className="py-3.5 text-slate-400">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </td>

                      <td className="py-3.5 text-slate-300 font-semibold">
                        {doc.chunk_count || 0} chunks
                      </td>

                      <td className="py-3.5">
                        {isIndexed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Indexed ✓
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold">
                            <AlertCircle className="w-3 h-3" /> Extraction Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDoc(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Extracted Chunks"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAskAI(doc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Ask AI About Document"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReprocess(doc.id)}
                            disabled={isReprocessing}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                            title="Reprocess Document"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDoc.filename}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedDoc.chunks?.length || 0} Semantic Chunks • 3072-dim Vector Embeddings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] font-bold uppercase text-slate-500">Summary / Overview:</span>
              <p className="mt-1 leading-relaxed italic">{selectedDoc.summary || 'No summary available.'}</p>
            </div>

            {/* Chunks List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Vector Indexed Chunks ({selectedDoc.chunks?.length || 0})
              </span>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {selectedDoc.chunks?.map((chunk, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Chunk #{chunk.chunk_index + 1} • Page {chunk.page_number}</span>
                      <span className="text-indigo-400">{chunk.section_title || 'General'}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
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
