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
        return 'border-t-red-500 text-red-400 bg-red-950/20';
      case 'IDEA':
        return 'border-t-rose-500 text-rose-400 bg-rose-950/20';
      case 'REQUIREMENTS':
        return 'border-t-red-400 text-red-300 bg-red-950/20';
      case 'AI INSIGHTS':
        return 'border-t-rose-600 text-rose-300 bg-rose-950/20';
      case 'RISKS':
        return 'border-t-amber-500 text-amber-400 bg-amber-950/20';
      case 'IMPROVEMENTS':
        return 'border-t-red-500 text-red-400 bg-red-950/20';
      case 'NEXT STEPS':
        return 'border-t-rose-400 text-rose-400 bg-rose-950/20';
      default:
        return 'border-t-zinc-600 text-zinc-400 bg-zinc-900/40';
    }
  };

  return (
    <div className={`flex flex-col w-80 flex-shrink-0 rounded-2xl bg-zinc-900/90 border border-zinc-800 border-t-4 ${getColumnAccent(column.id)} p-3.5 max-h-[calc(100vh-210px)] overflow-hidden shadow-sm`}>
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
            {column.name}
          </h4>
          <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 flex items-center justify-center shadow-xs">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          title="Add card"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="mb-3 p-3 rounded-xl bg-zinc-950 border border-red-500/40 shadow-md space-y-2.5">
          <input
            type="text"
            placeholder="Card title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)..."
            rows={2}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black resize-none"
          />
          <div className="flex items-center justify-between pt-1">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-bold shadow-xs border border-red-500/30"
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
          <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
            <p className="text-xs text-zinc-500">No cards in this column</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-1.5 text-[11px] text-red-400 hover:underline font-bold"
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
