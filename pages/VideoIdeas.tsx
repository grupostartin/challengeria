import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { VideoIdea, Priority, IdeaStatus } from '../types';
import Modal from '../components/Modal';
import { Plus, Tag, AlertCircle, Clock, Trash2, Edit2, Zap, Layout, Share2 } from 'lucide-react';
import { formatDisplayDate } from '../lib/dateUtils';

const VideoIdeas: React.FC = () => {
  const { ideas, customers, addIdea, updateIdea, deleteIdea, convertIdeaToTask, toggleIdeaShare } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | IdeaStatus>('all');

  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    categoria: string;
    prioridade: Priority;
    status: IdeaStatus;
    notas: string;
    customer_id: string;
  }>({
    titulo: '',
    descricao: '',
    categoria: '',
    prioridade: 'media',
    status: 'pendente',
    notas: '',
    customer_id: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateIdea(editingId, formData);
    } else {
      addIdea(formData);
    }
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (idea: VideoIdea) => {
    setFormData({
      titulo: idea.titulo,
      descricao: idea.descricao,
      categoria: idea.categoria,
      prioridade: idea.prioridade,
      status: idea.status,
      notas: idea.notas,
      customer_id: idea.customer_id || ''
    });
    setEditingId(idea.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria: '',
      prioridade: 'media',
      status: 'pendente',
      notas: '',
      customer_id: ''
    });
    setEditingId(null);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredIdeas = filter === 'all' ? ideas : ideas.filter(i => i.status === filter);

  const handleShare = async (idea: VideoIdea) => {
    const shareUrl = await toggleIdeaShare(idea.id);

    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ Link copiado! Compartilhe com quem quiser.');
    } else {
      alert('🔒 Compartilhamento desativado.');
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'alta': return 'border-rose-500 text-rose-400 bg-rose-950/30';
      case 'media': return 'border-amber-500 text-amber-400 bg-amber-950/30';
      case 'baixa': return 'border-blue-500 text-blue-400 bg-blue-950/30';
    }
  };

  const getStatusColor = (s: IdeaStatus) => {
    switch (s) {
      case 'pendente': return 'bg-slate-800 text-slate-300 border border-slate-600';
      case 'processando': return 'bg-amber-950/30 text-amber-400 border border-amber-500/50';
      case 'concluido': return 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'arquivado': return 'bg-slate-900 text-slate-500 border border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="text-yellow-400" /> Ideias de Vídeo
          </h1>
          <p className="text-slate-400 text-sm">Matriz de Criatividade</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] border border-cyan-400/30"
        >
          <Plus size={18} />
          <span className="font-medium">Nova Ideia</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {(['all', 'pendente', 'processando', 'concluido', 'arquivado'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border ${filter === s
              ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map(idea => (
          <div key={idea.id} className="glass-panel rounded-xl neon-border transition-all duration-300 flex flex-col h-full group">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] px-2 py-1 rounded border font-mono uppercase tracking-widest ${getPriorityColor(idea.prioridade)}`}>
                  {idea.prioridade}
                </span>
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${getStatusColor(idea.status)}`}>
                  {idea.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">{idea.titulo}</h3>
              <p className="text-slate-400 text-sm line-clamp-3 mb-4">{idea.descricao}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {idea.categoria && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 px-2 py-1 rounded">
                    <Tag size={12} className="text-cyan-500" /> {idea.categoria}
                  </span>
                )}
                {idea.task_id && (
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-400 bg-purple-950/30 px-2 py-1 rounded border border-purple-800/30 font-mono">
                    <Layout size={10} /> LINKED_TO_KANBAN
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 rounded-b-xl flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                Criado em: {new Date(idea.criadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => convertIdeaToTask(idea.id)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition-colors"
                  title={idea.task_id ? "Já possui tarefa" : "Mover para Kanban"}
                  disabled={!!idea.task_id}
                >
                  <Zap size={16} className={idea.task_id ? "opacity-30" : ""} />
                </button>
                <button
                  onClick={() => handleShare(idea)}
                  className={`p-1.5 rounded-md transition-colors ${idea.share_enabled
                    ? 'text-green-400 hover:text-green-300 bg-green-950/30 hover:bg-green-900/40'
                    : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                    }`}
                  title={idea.share_enabled ? "Desativar compartilhamento" : "Compartilhar ideia"}
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => handleEdit(idea)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir esta ideia?')) {
                      deleteIdea(idea.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded-md transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredIdeas.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <p className="font-mono">NO_DATA_FOUND</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Ideia' : 'Nova Ideia de Vídeo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Título</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
              placeholder="Ex: Tutorial React 2077"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Categoria</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
                placeholder="Ex: Tech"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Prioridade</label>
              <select
                value={formData.prioridade}
                onChange={e => setFormData({ ...formData, prioridade: e.target.value as Priority })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              >
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Cliente (Opcional)</label>
            <select
              value={formData.customer_id}
              onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            >
              <option value="">Nenhum Cliente</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as IdeaStatus })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            >
              <option value="pendente">Pendente</option>
              <option value="processando">Processando</option>
              <option value="concluido">Concluído</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Descrição</label>
            <textarea
              rows={3}
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
              placeholder="Descreva o conceito..."
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Notas Adicionais</label>
            <textarea
              rows={2}
              value={formData.notas}
              onChange={e => setFormData({ ...formData, notas: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
              placeholder="Dados adicionais..."
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
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all"
            >
              {editingId ? 'Atualizar Dados' : 'Inicializar Ideia'}
            </button>
          </div>
        </form>
      </Modal>
    </div >
  );
};

export default VideoIdeas;