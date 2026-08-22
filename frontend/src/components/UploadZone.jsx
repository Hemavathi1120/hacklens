import React, { useState, useRef } from 'react';
import { UploadCloud, File, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function UploadZone({ projectId, onUploadSuccess }) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const acceptedFormats = ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md";

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (filesList) => {
    const filesArray = Array.from(filesList);
    if (filesArray.length === 0) return;

    setErrorMsg('');
    const initialTrackers = filesArray.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      status: 'uploading', // uploading, processing, indexed, failed
    }));
    setUploadingFiles(initialTrackers);

    try {
      // Simulate rapid transition to 'processing'
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.map((item) => ({ ...item, status: 'processing' }))
        );
      }, 600);

      const res = await api.uploadDocuments(projectId, filesArray, user?.id || 'anonymous-user');

      // Transition to 'indexed'
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.map((item) => ({ ...item, status: 'indexed' }))
        );
        if (onUploadSuccess) {
          onUploadSuccess(res.documents);
        }
      }, 1200);

    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Failed to upload and index documents.');
      setUploadingFiles((prev) =>
        prev.map((item) => ({ ...item, status: 'failed' }))
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h4 className="text-base font-semibold text-slate-100">
          Drop your project documents here
        </h4>
        <p className="text-sm text-slate-400 mt-1">
          or <span className="text-indigo-400 font-medium hover:underline">browse files</span> from your computer
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {['PDF', 'PPT / PPTX', 'DOC / DOCX', 'TXT', 'MARKDOWN'].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium text-slate-400"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploading File Status Cards */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Uploading & Indexing Files
          </h5>
          {uploadingFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{file.size}</p>
                </div>
              </div>

              <div>
                {file.status === 'uploading' && (
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </div>
                )}
                {file.status === 'processing' && (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing Chunks...
                  </div>
                )}
                {file.status === 'indexed' && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Indexed ✓
                  </div>
                )}
                {file.status === 'failed' && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Failed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
