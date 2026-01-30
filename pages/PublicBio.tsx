import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BioConfig } from '../types';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicBio: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [config, setConfig] = useState<BioConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const fetchBio = async () => {
            if (!username) return;
            const { data, error } = await supabase
                .from('bio_configs')
                .select(`
                    *,
                    owner:profiles!user_id (
                        subscription_status,
                        trial_ends_at,
                        current_period_end
                    )
                `)
                .eq('username', username)
                .single();

            if (data && !error) {
                // Check owner subscription
                const owner = data.owner as any;
                const now = new Date();
                const trialEnds = owner.trial_ends_at ? new Date(owner.trial_ends_at) : null;
                const periodEnd = owner.current_period_end ? new Date(owner.current_period_end) : null;

                const isPremiumActive = owner.plan_type === 'premium' && owner.subscription_status === 'active';
                const isTrialActive = (owner.plan_type === 'trial' || owner.subscription_status === 'trialing') && trialEnds && trialEnds > now;

                if (!isPremiumActive && !isTrialActive) {
                    setConfig(null);
                    setLoading(false);
                    return;
                }

                setConfig(data);
                // Inicia countdown para tirar o splash
                setTimeout(() => setShowSplash(false), 2500);
            }
            setLoading(false);
        };

        fetchBio();
    }, [username]);

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
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
                    style={{ backgroundColor: config.background_color }}
                >
                    {config.background_image_url && (
                        <>
                            <div
                                className="absolute inset-0 bg-cover bg-center z-0"
                                style={{ backgroundImage: `url(${config.background_image_url})` }}
                            />
                            <div
                                className="absolute inset-0 z-[1] backdrop-blur-[2px]"
                                style={{ backgroundColor: `${config.background_color}cc` }}
                            />
                        </>
                    )}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center gap-6 relative z-10"
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
                    className="min-h-screen p-6 font-sans flex flex-col items-center overflow-x-hidden relative"
                    style={{ backgroundColor: config.background_color, color: config.text_color }}
                >
                    {/* Background Image Logic */}
                    {config.background_image_url && (
                        <>
                            <div
                                className="fixed inset-0 bg-cover bg-center z-0"
                                style={{ backgroundImage: `url(${config.background_image_url})` }}
                            />
                            <div
                                className="fixed inset-0 z-[1] backdrop-blur-[2px]"
                                style={{ backgroundColor: `${config.background_color}cc` }} // Add some transparency to the color overlay
                            />
                        </>
                    )}

                    <div className="max-w-md w-full flex flex-col items-center gap-6 mt-12 mb-12 relative z-10">
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

                        {/* Watermark CTA */}
                        <motion.a
                            href="https://wa.me/5531982781618?text=Quero%20uma%20página%20de%20bio%20como%20esta%21"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 2, duration: 0.8 }}
                            className="mt-12 group flex flex-col items-center gap-2 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
                        >
                            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Crie a sua também</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-emerald-400">POR APENAS R$ 3,99</span>
                                <ExternalLink size={12} className="text-white opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.a>

                        {/* Footer */}
                        <motion.footer
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.2 }}
                            transition={{ delay: 2.5 }}
                            className="mt-8 mb-12 text-[10px] uppercase tracking-[3px] font-bold"
                        >
                            Startin Clients © 2026
                        </motion.footer>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PublicBio;
