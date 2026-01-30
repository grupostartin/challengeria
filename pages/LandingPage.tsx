import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Lightbulb,
    Layout,
    Wallet,
    Users,
    FileText,
    Package,
    ShoppingCart,
    Calendar,
    Link2,
    Zap,
    TrendingUp,
    Shield,
    Sparkles,
    ArrowRight,
    CheckCircle,
    Activity
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        {
            icon: Lightbulb,
            title: 'Ideias de Vídeo',
            description: 'Gerencie suas ideias criativas com sistema de prioridades, categorias e status. Compartilhe ideias com clientes via link.',
            color: 'from-yellow-500 to-amber-600',
            glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]'
        },
        {
            icon: Layout,
            title: 'Quadro Kanban',
            description: 'Organize tarefas visualmente com drag & drop. Acompanhe o progresso de pendente até concluído em tempo real.',
            color: 'from-purple-500 to-pink-600',
            glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
        },
        {
            icon: Wallet,
            title: 'Controle Financeiro',
            description: 'Fluxo de caixa profissional com gráficos, organizadores financeiros, anexos de comprovantes e relatórios completos.',
            color: 'from-emerald-500 to-green-600',
            glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'
        },
        {
            icon: Users,
            title: 'Gestão de Clientes',
            description: 'CRM completo com portal exclusivo do cliente, acompanhamento de projetos, saldo e histórico de interações.',
            color: 'from-cyan-500 to-blue-600',
            glow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]'
        },
        {
            icon: FileText,
            title: 'Contratos Digitais',
            description: 'Upload e gestão de PDFs de contratos com anexos de comprovantes de pagamento vinculados a clientes.',
            color: 'from-indigo-500 to-purple-600',
            glow: 'shadow-[0_0_30px_rgba(99,102,241,0.3)]'
        },
        {
            icon: Package,
            title: 'Gestão de Inventário',
            description: 'Controle completo de estoque com categorias, quantidades, preços e rastreamento de produtos.',
            color: 'from-orange-500 to-red-600',
            glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]'
        },
        {
            icon: ShoppingCart,
            title: 'Sistema de Vendas',
            description: 'PDV integrado com gestão de produtos, métodos de pagamento e relatórios de vendas automáticos.',
            color: 'from-rose-500 to-pink-600',
            glow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]'
        },
        {
            icon: Calendar,
            title: 'Agenda Inteligente',
            description: 'Agendamento de compromissos, serviços e eventos com notificações e visualização por data.',
            color: 'from-blue-500 to-cyan-600',
            glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
        },
        {
            icon: Link2,
            title: 'Bio Page Personalizável',
            description: 'Crie sua página de links estilo Linktree com personalização total de cores, avatar e captura de leads.',
            color: 'from-fuchsia-500 to-purple-600',
            glow: 'shadow-[0_0_30px_rgba(217,70,239,0.3)]'
        }
    ];

    const stats = [
        { value: '9+', label: 'Funcionalidades' },
        { value: '100%', label: 'Responsivo' },
        { value: 'Ilimitado', label: 'Clientes' },
        { value: '24/7', label: 'Disponível' }
    ];

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
            {/* Splash Screen */}
            <AnimatePresence>
                {showSplash && (
                    <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="relative"
                        >
                            <motion.div
                                className="w-32 h-32 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(168,85,247,0.6)]"
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            >
                                <Activity size={64} className="text-white" />
                            </motion.div>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animated Background Grid */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'linear'
                    }}
                />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
                <motion.div
                    style={{ opacity }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[100px]" />
                </motion.div>

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-sm font-mono text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Sparkles size={16} className="animate-pulse" />
                            Plataforma Completa de Gestão
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                            Startin Clients
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        O CRM ultra moderno que une gestão de clientes, projetos, finanças e muito mais em uma única plataforma premium.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            className="group px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all flex items-center gap-2"
                        >
                            Começar Agora
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                            Fazer Login
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.1 }}
                        className="mt-16 flex items-center justify-center gap-8 flex-wrap"
                    >
                        {[
                            { icon: Shield, text: 'Seguro' },
                            { icon: Zap, text: 'Rápido' },
                            { icon: TrendingUp, text: 'Escalável' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-400">
                                <item.icon size={20} className="text-cyan-400" />
                                <span className="text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Tudo que você precisa
                            </span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Uma plataforma completa com todas as ferramentas para gerenciar seu negócio
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300 blur-xl`} />
                                <div className="relative glass-panel p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all h-full flex flex-col">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:${feature.glow} transition-all`}>
                                        <feature.icon size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed flex-1">
                                        {feature.description}
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm font-medium">Saiba mais</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel p-12 rounded-3xl border border-slate-700"
                    >
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                                    Por que escolher o{' '}
                                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                        Startin Clients
                                    </span>
                                    ?
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        'Interface moderna e intuitiva',
                                        'Gestão completa em um só lugar',
                                        'Atualizações constantes',
                                        'Suporte dedicado',
                                        'Dados seguros e privados',
                                        'Acesso de qualquer dispositivo'
                                    ].map((benefit, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
                                            <span className="text-slate-300 text-lg">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                    <Activity size={120} className="text-cyan-400 opacity-50" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Pronto para{' '}
                            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                transformar
                            </span>{' '}
                            seu negócio?
                        </h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                            Junte-se a profissionais que já estão usando o Startin Clients para gerenciar seus projetos e clientes.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            className="px-12 py-5 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-2xl font-bold text-xl shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:shadow-[0_0_80px_rgba(168,85,247,0.7)] transition-all"
                        >
                            Começar Gratuitamente
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-slate-800 py-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Activity className="text-cyan-400" size={24} />
                        <span className="text-xl font-bold">Startin Clients</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © 2026 Startin Clients. Plataforma premium de gestão empresarial.
                    </p>
                </div>
            </footer>


        </div>
    );
};

export default LandingPage;
