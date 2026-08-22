import React, { useState } from 'react';
import { Plus, MoreHorizontal, Sparkles } from 'lucide-react';
import BoardCard from './BoardCard';

export default function BoardColumn({
  column,
  cards,
  columns,
  onAddCard,
  onMoveColumn,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onEdit
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCard(column.id, {
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      source_type: 'manual',
    });
    setNewTitle('');
    setNewDesc('');
    setNewPriority('MEDIUM');
    setIsAdding(false);
  };

  const getColumnAccent = (colId) => {
    switch (colId) {
      case 'PROBLEM':
        return 'border-t-rose-500 text-rose-400';
      case 'IDEA':
        return 'border-t-indigo-500 text-indigo-400';
      case 'REQUIREMENTS':
        return 'border-t-blue-500 text-blue-400';
      case 'AI INSIGHTS':
        return 'border-t-violet-500 text-violet-400';
      case 'RISKS':
        return 'border-t-amber-500 text-amber-400';
      case 'IMPROVEMENTS':
        return 'border-t-teal-500 text-teal-400';
      case 'NEXT STEPS':
        return 'border-t-emerald-500 text-emerald-400';
      default:
        return 'border-t-slate-500 text-slate-400';
    }
  };

  return (
    <div className={`flex flex-col w-80 flex-shrink-0 rounded-2xl bg-slate-900/60 border border-slate-800 border-t-2 ${getColumnAccent(column.id)} p-3.5 max-h-[calc(100vh-210px)] overflow-hidden shadow-lg`}>
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {column.name}
          </h4>
          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-slate-400 flex items-center justify-center">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/70 transition-colors"
          title="Add card"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="mb-3 p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2.5">
          <input
            type="text"
            placeholder="Card title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)..."
            rows={2}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex items-center justify-between pt-1">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Cards Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-1">
        {cards.length === 0 && !isAdding ? (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/60 rounded-xl">
            <p className="text-xs text-slate-500">No cards in this column</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-1.5 text-[11px] text-indigo-400 hover:underline font-medium"
            >
              + Add a card
            </button>
          </div>
        ) : (
          cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              columns={columns}
              onMoveColumn={onMoveColumn}
              onToggleComplete={onToggleComplete}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
