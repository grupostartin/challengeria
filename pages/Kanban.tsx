import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Task, TaskStatus } from '../types';
import Modal from '../components/Modal';
import { Plus, GripVertical, Trash2, Calendar, Layout, Hash, Lightbulb } from 'lucide-react';
import { getBrasiliaDate, formatDisplayDate } from '../lib/dateUtils';

const Kanban: React.FC = () => {
  const { tasks, customers, addTask, moveTask, deleteTask } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    coluna: TaskStatus;
    tags: string;
    prazo: string;
    customer_id: string;
  }>({
    titulo: '',
    descricao: '',
    coluna: 'todo',
    tags: '',
    prazo: getBrasiliaDate(),
    customer_id: ''
  });

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById(`task-${id}`);
      if (el) el.classList.add('opacity-30', 'grayscale');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTaskId) {
      const el = document.getElementById(`task-${draggedTaskId}`);
      if (el) el.classList.remove('opacity-30', 'grayscale');
    }
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, status);
    }
    setDraggedTaskId(null);
  };

  // --- Form Handlers ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setFormData({ titulo: '', descricao: '', coluna: 'todo', tags: '', prazo: getBrasiliaDate(), customer_id: '' });
    setIsModalOpen(false);
  };

  const columns: { id: TaskStatus; title: string; color: string; border: string }[] = [
    { id: 'todo', title: 'PENDENTE', color: 'bg-slate-900/50', border: 'border-slate-700' },
    { id: 'inprogress', title: 'PROCESSANDO', color: 'bg-blue-950/20', border: 'border-blue-900/50' },
    { id: 'done', title: 'CONCLUÍDO', color: 'bg-emerald-950/20', border: 'border-emerald-900/50' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layout className="text-purple-500" /> Quadro de Tarefas
          </h1>
          <p className="text-slate-400 text-sm">Organização de fluxo de trabalho</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/30"
        >
          <Plus size={18} />
          <span className="font-medium">Nova Tarefa</span>
        </button>
      </div>

      <div className="flex-1 md:overflow-x-auto md:overflow-y-hidden overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-6 h-full md:min-w-[1000px] w-full pb-20 md:pb-0">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`flex-1 flex flex-col rounded-xl border ${column.border} ${column.color} backdrop-blur-sm md:min-w-[300px] w-full md:h-full min-h-[500px] transition-colors`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center rounded-t-xl bg-white/5">
                <h3 className="font-bold text-slate-200 tracking-widest text-xs uppercase">{column.title}</h3>
                <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs font-mono font-bold text-cyan-400 shadow-inner">
                  {tasks.filter(t => t.coluna === column.id).length.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {tasks
                  .filter(task => task.coluna === column.id)
                  .map(task => (
                    <div
                      key={task.id}
                      id={`task-${task.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-slate-800/80 p-4 rounded-lg shadow-lg border border-slate-700 cursor-grab active:cursor-grabbing hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-slate-600 group-hover:text-cyan-500 transition-colors" />
                          <h4 className="font-semibold text-slate-200 text-sm">{task.titulo}</h4>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
                              deleteTask(task.id);
                            }
                          }}
                          className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {task.descricao && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 pl-5 font-light">{task.descricao}</p>
                      )}

                      <div className="flex items-center justify-between pl-5 mt-2">
                        <div className="flex gap-1 flex-wrap">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[9px] uppercase bg-slate-900 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Hash size={8} /> {tag}
                            </span>
                          ))}
                        </div>
                        {task.idea_id && (
                          <div className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/30 border border-cyan-900/50 px-1.5 py-0.5 rounded font-mono">
                            <Lightbulb size={10} /> IDEA_ORIGIN
                          </div>
                        )}
                        {task.prazo && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/30 border border-amber-900/50 px-1.5 py-0.5 rounded">
                            <Calendar size={10} />
                            {formatDisplayDate(task.prazo)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Tarefa"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-purple-400 mb-1 uppercase tracking-wider">Título</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-slate-600"
              placeholder="Ex: Editar vídeo"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-purple-400 mb-1 uppercase tracking-wider">Descrição</label>
            <textarea
              rows={2}
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-purple-400 mb-1 uppercase tracking-wider">Cliente (Opcional)</label>
            <select
              value={formData.customer_id}
              onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-mono"
            >
              <option value="">Nenhum Cliente</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-purple-400 mb-1 uppercase tracking-wider">Coluna Inicial</label>
              <select
                value={formData.coluna}
                onChange={e => setFormData({ ...formData, coluna: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              >
                <option value="todo">Pendente</option>
                <option value="inprogress">Processando</option>
                <option value="done">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-purple-400 mb-1 uppercase tracking-wider">Prazo</label>
              <input
                type="date"
                value={formData.prazo}
                onChange={e => setFormData({ ...formData, prazo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-purple-400 mb-1 uppercase tracking-wider">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-slate-600"
              placeholder="youtube, edição, urgente"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Kanban;