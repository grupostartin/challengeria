import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserNote } from '../types';
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Search,
  AlertCircle,
  Clock,
  Edit3
} from 'lucide-react';

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<UserNote>>({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!user || !currentNote.content) return;
    setSaving(true);
    try {
      if (currentNote.id) {
        const { error } = await supabase
          .from('user_notes')
          .update({
            title: currentNote.title,
            content: currentNote.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_notes')
          .insert([{
            user_id: user.id,
            title: currentNote.title,
            content: currentNote.content
          }]);

        if (error) throw error;
      }
      setIsEditing(false);
      setCurrentNote({ title: '', content: '' });
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta anotação?')) return;
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <StickyNote className="text-cyan-500" /> Minhas Anotações
          </h1>
          <p className="text-sm text-slate-400">Espaço dedicado para suas notas e lembretes rápidos</p>
        </div>
        <button
          onClick={() => {
            setCurrentNote({ title: '', content: '' });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus size={20} /> NOVA ANOTAÇÃO
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Pesquisar em minhas notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div key={note.id} className="glass-panel border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate pr-8">
                    {note.title || 'Sem Título'}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setCurrentNote(note);
                        setIsEditing(true);
                      }}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 uppercase">
                    <Clock size={12} />
                    {new Date(note.updated_at || note.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass-panel border border-dashed border-slate-800 rounded-3xl">
              <StickyNote size={60} className="text-slate-800 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhuma anotação encontrada</h3>
              <p className="text-slate-600 max-w-xs mx-auto text-sm">Crie sua primeira anotação clicando no botão de adicionar acima.</p>
            </div>
          )}
        </div>
      )}

      {/* Manual Modal Backdrop */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Edit3 className="text-cyan-500" /> {currentNote.id ? 'Editar Anotação' : 'Nova Anotação'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-900 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Título da Nota (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Ideias para o projeto, Lembrete importante..."
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Conteúdo da Anotação</label>
                <textarea
                  placeholder="Digite sua anotação aqui..."
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  rows={8}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-5 text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
            
            <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrUpdate}
                disabled={saving || !currentNote.content}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                SALVAR ANOTAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
