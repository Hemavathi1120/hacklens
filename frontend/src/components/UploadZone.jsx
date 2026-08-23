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
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.map((item) => ({ ...item, status: 'processing' }))
        );
      }, 600);

      const res = await api.uploadDocuments(projectId, filesArray, user?.id || 'anonymous-user');

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
        className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-red-500 bg-red-950/20 scale-[1.01]'
            : 'border-zinc-800 bg-zinc-900/60 hover:border-red-500/50 hover:bg-zinc-900/90'
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

        <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h4 className="text-base font-semibold text-zinc-100">
          Drop your hackathon project documents here
        </h4>
        <p className="text-sm text-zinc-400 mt-1 font-normal">
          or <span className="text-red-400 font-medium hover:underline">browse files</span> from your device
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {['PDF', 'PPT / PPTX', 'DOC / DOCX', 'TXT', 'MARKDOWN'].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] font-medium text-zinc-400 font-mono"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploading File Status Cards */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Uploading & Indexing Files
          </h5>
          {uploadingFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-200 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">{file.size}</p>
                </div>
              </div>

              <div>
                {file.status === 'uploading' && (
                  <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-950/40 px-2.5 py-1 rounded-full border border-red-500/30 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </div>
                )}
                {file.status === 'processing' && (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing Chunks...
                  </div>
                )}
                {file.status === 'indexed' && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-950/40 px-2.5 py-1 rounded-full border border-red-500/30 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Indexed ✓
                  </div>
                )}
                {file.status === 'failed' && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/30 font-mono">
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
