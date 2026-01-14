import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { VideoIdea } from '../types';
import { Lightbulb, Tag, AlertCircle, Calendar } from 'lucide-react';

const SharedIdea: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [idea, setIdea] = useState<VideoIdea | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSharedIdea = async () => {
            if (!token) {
                setError(true);
                setLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('video_ideas')
                .select('*')
                .eq('share_token', token)
                .eq('share_enabled', true)
                .single();

            if (fetchError || !data) {
                setError(true);
            } else {
                setIdea({
                    ...data,
                    criadoEm: new Date(data.criado_em).getTime(),
                    atualizadoEm: new Date(data.atualizado_em).getTime()
                });
            }
            setLoading(false);
        };

        fetchSharedIdea();
    }, [token]);

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'alta': return 'border-rose-500 text-rose-400 bg-rose-950/30';
            case 'media': return 'border-amber-500 text-amber-400 bg-amber-950/30';
            case 'baixa': return 'border-blue-500 text-blue-400 bg-blue-950/30';
            default: return 'border-slate-500 text-slate-400 bg-slate-950/30';
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'pendente': return 'bg-slate-800 text-slate-300 border border-slate-600';
            case 'processando': return 'bg-amber-950/30 text-amber-400 border border-amber-500/50';
            case 'concluido': return 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
            case 'arquivado': return 'bg-slate-900 text-slate-500 border border-slate-800';
            default: return 'bg-slate-800 text-slate-300 border border-slate-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white text-lg">Carregando...</div>
            </div>
        );
    }

    if (error || !idea) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                <div className="glass-panel rounded-xl p-8 max-w-md text-center">
                    <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Ideia Não Encontrada</h1>
                    <p className="text-slate-400">
                        Este link pode ter expirado ou a ideia não está mais compartilhada.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="glass-panel rounded-xl p-8 neon-border">
                    <div className="flex items-center gap-3 mb-6">
                        <Lightbulb className="text-yellow-400" size={32} />
                        <h1 className="text-3xl font-bold text-white">Ideia de Vídeo Compartilhada</h1>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <span className={`text-xs px-3 py-1.5 rounded border font-mono uppercase tracking-widest ${getPriorityColor(idea.prioridade)}`}>
                            {idea.prioridade}
                        </span>
                        <span className={`text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wide ${getStatusColor(idea.status)}`}>
                            {idea.status}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-100 mb-4">{idea.titulo}</h2>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Descrição</h3>
                        <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">{idea.descricao}</p>
                    </div>

                    {idea.categoria && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-slate-300 bg-slate-800 border border-slate-700 px-3 py-2 rounded inline-flex">
                                <Tag size={16} className="text-cyan-500" />
                                <span className="font-medium">{idea.categoria}</span>
                            </div>
                        </div>
                    )}

                    {idea.notas && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Notas Adicionais</h3>
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                {idea.notas}
                            </p>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Calendar size={14} />
                        <span>Criado em: {new Date(idea.criadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        Compartilhado via <span className="text-cyan-400 font-semibold">ChallengerIA</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SharedIdea;
