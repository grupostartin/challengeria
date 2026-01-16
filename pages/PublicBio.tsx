import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BioConfig } from '../types';
import { ExternalLink, Mail, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicBio: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [config, setConfig] = useState<BioConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        mensagem: ''
    });

    useEffect(() => {
        const fetchBio = async () => {
            if (!username) return;
            const { data, error } = await supabase
                .from('bio_configs')
                .select('*')
                .eq('username', username)
                .single();

            if (data && !error) {
                setConfig(data);
                // Inicia countdown para tirar o splash
                setTimeout(() => setShowSplash(false), 2500);
            }
            setLoading(false);
        };

        fetchBio();
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Logica similar ao submitLead do context, mas direta aqui por ser publico
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .insert([{
                    user_id: config?.user_id,
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    status: 'ativo'
                }])
                .select()
                .single();

            if (customerError) throw customerError;

            await supabase.from('tasks').insert([{
                user_id: config?.user_id,
                customer_id: customerData.id,
                titulo: `Novo Lead: ${formData.nome}`,
                descricao: `Mensagem: ${formData.mensagem || 'Sem mensagem'}\nTelefone: ${formData.telefone}\nOrigem: Bio Page`,
                coluna: 'todo',
                tags: ['Lead', 'Bio']
            }]);

            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar. Tente novamente.');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-[#0f172a]`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-6 text-center`}>
                <div>
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-slate-400">Página não encontrada ou desativada.</p>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {showSplash ? (
                <motion.div
                    key="splash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
                    style={{ backgroundColor: config.background_color }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center gap-6"
                    >
                        {config.avatar_url ? (
                            <motion.img
                                src={config.avatar_url}
                                alt={config.title}
                                className="w-28 h-28 rounded-full border-2 shadow-2xl object-cover"
                                style={{ borderColor: config.button_color }}
                            />
                        ) : (
                            <div
                                className="w-28 h-28 rounded-full border-2 shadow-2xl flex items-center justify-center bg-slate-800"
                                style={{ borderColor: config.button_color }}
                            >
                                <span className="text-2xl font-bold opacity-30">{config.username.substring(0, 2).toUpperCase()}</span>
                            </div>
                        )}
                        <motion.h1
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 0.5 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-xl font-medium tracking-tight"
                            style={{ color: config.text_color }}
                        >
                            {config.title}
                        </motion.h1>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-screen p-6 font-sans flex flex-col items-center overflow-x-hidden"
                    style={{ backgroundColor: config.background_color, color: config.text_color }}
                >
                    <div className="max-w-md w-full flex flex-col items-center gap-6 mt-12 mb-12">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-center text-center"
                        >
                            {config.avatar_url ? (
                                <motion.img
                                    src={config.avatar_url}
                                    alt={config.title}
                                    className="w-32 h-32 rounded-full border-4 shadow-2xl mb-6 object-cover mx-auto"
                                    style={{ borderColor: config.button_color }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                />
                            ) : (
                                <div
                                    className="w-32 h-32 rounded-full border-4 shadow-2xl mb-6 flex items-center justify-center bg-slate-800 mx-auto"
                                    style={{ borderColor: config.button_color }}
                                >
                                    <span className="text-4xl font-bold opacity-30">{config.username.substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                            <h1 className="text-2xl font-bold mb-2 tracking-tight">{config.title}</h1>
                            <p className="opacity-70 text-sm max-w-[300px] leading-relaxed font-medium">{config.description}</p>
                        </motion.div>

                        {/* Links */}
                        <div className="w-full flex flex-col gap-4">
                            {config.links && Array.isArray(config.links) && config.links.map((link, idx) => (
                                <motion.a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + (idx * 0.15), duration: 0.5 }}
                                    className="group relative w-full overflow-hidden rounded-2xl p-6 font-bold text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
                                    style={{
                                        color: config.button_text_color,
                                        height: link.image_url ? '120px' : 'auto'
                                    }}
                                >
                                    {/* Background Logic */}
                                    {link.image_url ? (
                                        <>
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${link.image_url})` }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-colors duration-300 group-hover:bg-black/20" />
                                        </>
                                    ) : (
                                        <div
                                            className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                                            style={{ backgroundColor: config.button_color }}
                                        />
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 flex items-center gap-3 drop-shadow-md">
                                        <ExternalLink size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-lg tracking-tight">{link.label}</span>
                                    </div>

                                    {/* Border Glow Effect */}
                                    <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-white/30 transition-colors" />
                                </motion.a>
                            ))}
                        </div>

                        {/* Lead Form */}
                        <AnimatePresence>
                            {config.show_lead_form && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 + ((config.links?.length || 0) * 0.15), duration: 0.5 }}
                                    className="w-full mt-4 bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl"
                                >
                                    {submitted ? (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-center py-6"
                                        >
                                            <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={48} />
                                            <h3 className="text-xl font-bold mb-2">Mensagem Enviada!</h3>
                                            <p className="opacity-70 text-sm">Entraremos em contato em breve.</p>
                                            <button
                                                onClick={() => setSubmitted(false)}
                                                className="mt-6 text-sm underline opacity-50 hover:opacity-100"
                                            >
                                                Enviar outra mensagem
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <h3 className="text-lg font-bold mb-4 text-center">{config.lead_form_title}</h3>

                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Seu Nome"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
                                                    value={formData.nome}
                                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Telefone"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
                                                    value={formData.telefone}
                                                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <textarea
                                                    placeholder="Em que posso ajudar?"
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all resize-none"
                                                    value={formData.mensagem}
                                                    onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={formLoading}
                                                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-xl disabled:opacity-50"
                                                style={{
                                                    backgroundColor: config.button_color,
                                                    color: config.button_text_color
                                                }}
                                            >
                                                {formLoading ? 'Enviando...' : (
                                                    <>
                                                        <Send size={18} />
                                                        Enviar Mensagem
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer */}
                        <motion.footer
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            transition={{ delay: 1.5 }}
                            className="mt-12 text-[10px] uppercase tracking-[3px] font-bold"
                        >
                            Made with Startin Clients
                        </motion.footer>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PublicBio;
