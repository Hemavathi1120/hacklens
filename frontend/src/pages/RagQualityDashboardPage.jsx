import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Activity, 
  Database, 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  RotateCw,
  Loader2,
  Cpu
} from 'lucide-react';
import { api } from '../lib/api';

export default function RagQualityDashboardPage() {
  const { project } = useOutletContext();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getRagMetrics(project.id);
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [project.id]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Documents Indexed',
      value: `${metrics?.documents_indexed || 0} / ${metrics?.total_documents || 0}`,
      desc: 'Active knowledge sources',
      icon: FileCheck,
      color: 'text-indigo-400',
    },
    {
      label: 'Total Vector Chunks',
      value: metrics?.total_chunks || 0,
      desc: '800-char semantic chunks',
      icon: Layers,
      color: 'text-purple-400',
    },
    {
      label: 'Embedding Status',
      value: metrics?.embedding_status || 'Healthy',
      desc: metrics?.embedding_model || 'Gemini 3072-dim',
      icon: Cpu,
      color: 'text-emerald-400',
    },
    {
      label: 'Citation Accuracy Rate',
      value: metrics?.citation_accuracy_rate || 'Not evaluated yet',
      desc: 'Queries with verified citations',
      icon: CheckCircle2,
      color: 'text-teal-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-400" />
            RAG Architecture & Quality Diagnostics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Developer observability for vector search, grounding pipeline health, and citation accuracy.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh metrics"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-extrabold font-display text-white">
                {stat.value}
              </div>
              <p className="text-[11px] text-slate-400">{stat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Advanced Quality & Faithfulness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Retrieval & Grounding Status */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Database className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Vector Retrieval Health
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Vector Search Engine</span>
              <span className="font-semibold text-slate-200">Supabase pgvector / Cosine</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Vector Dimensions</span>
              <span className="font-semibold text-slate-200">3072 Dimensions</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Retrieval Status</span>
              <span className="font-semibold text-emerald-400">{metrics?.retrieval_status}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Total RAG Queries Processed</span>
              <span className="font-semibold text-slate-200">{metrics?.total_queries_served || 0} Queries</span>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics & Faithfulness */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Grounding & Faithfulness
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Prompt Injection Defense</span>
              <span className="font-semibold text-emerald-400">Active (System Instruction Layer)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Faithfulness Rating</span>
              <span className="font-semibold text-slate-200">{metrics?.faithfulness}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Answer Relevance</span>
              <span className="font-semibold text-slate-200">{metrics?.answer_relevance}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Judge Evaluation Questions</span>
              <span className="font-semibold text-indigo-400">{metrics?.evaluation_questions_count}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
