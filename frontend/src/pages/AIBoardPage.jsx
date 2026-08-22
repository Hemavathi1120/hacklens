import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Kanban, 
  Plus, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  Filter, 
  Loader2,
  HelpCircle
} from 'lucide-react';
import BoardColumn from '../components/BoardColumn';
import { api } from '../lib/api';

export default function AIBoardPage() {
  const { project } = useOutletContext();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const columns = [
    { id: 'PROBLEM', name: 'Problem' },
    { id: 'IDEA', name: 'Idea' },
    { id: 'REQUIREMENTS', name: 'Requirements' },
    { id: 'AI INSIGHTS', name: 'AI Insights' },
    { id: 'RISKS', name: 'Risks' },
    { id: 'IMPROVEMENTS', name: 'Improvements' },
    { id: 'NEXT STEPS', name: 'Next Steps' },
  ];

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const items = await api.getBoardItems(project.id);
      setCards(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [project.id]);

  const handleAddCard = async (columnId, cardData) => {
    try {
      const res = await api.createBoardItem(project.id, {
        column_name: columnId,
        ...cardData,
      });
      setCards((prev) => [...prev, res]);
    } catch (err) {
      alert('Failed to create card');
    }
  };

  const handleMoveColumn = async (cardId, targetColumnId) => {
    // Optimistic UI
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column_name: targetColumnId } : c))
    );
    try {
      await api.updateBoardItem(cardId, { column_name: targetColumnId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (cardId, completed) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, completed } : c))
    );
    try {
      await api.updateBoardItem(cardId, { completed });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (cardId, is_pinned) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, is_pinned } : c))
    );
    try {
      await api.updateBoardItem(cardId, { is_pinned });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    try {
      await api.deleteBoardItem(cardId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCard = async (cardId, updatedFields) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, ...updatedFields } : c))
    );
    try {
      await api.updateBoardItem(cardId, updatedFields);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncEvaluation = async () => {
    setSyncing(true);
    try {
      const res = await api.syncBoardFromEvaluation(project.id);
      await fetchBoard();
    } catch (err) {
      alert(err.message || 'Failed to sync from evaluation. Please run an evaluation first.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredCards = cards.filter((c) => {
    if (priorityFilter === 'ALL') return true;
    return (c.priority || 'MEDIUM').toUpperCase() === priorityFilter;
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
            <Kanban className="w-5 h-5 text-indigo-400" />
            AI Board
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive 7-column Kanban board synchronized with Gemini AI evaluation insights and action plan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority Only</option>
            <option value="MEDIUM">Medium Priority Only</option>
            <option value="LOW">Low Priority Only</option>
          </select>

          {/* Sync Button */}
          <button
            onClick={handleSyncEvaluation}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Evaluation'}
          </button>
        </div>
      </div>

      {/* 7-Column Kanban Grid Container */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-start gap-4 min-w-max">
            {columns.map((col) => {
              const colCards = filteredCards.filter((c) => c.column_name === col.id);
              // Pinned cards on top
              const sorted = [...colCards].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

              return (
                <BoardColumn
                  key={col.id}
                  column={col}
                  cards={sorted}
                  columns={columns}
                  onAddCard={handleAddCard}
                  onMoveColumn={handleMoveColumn}
                  onToggleComplete={handleToggleComplete}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDeleteCard}
                  onEdit={handleEditCard}
                />
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
