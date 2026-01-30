import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Layout,
    BarChart3,
    Users,
    ShieldCheck,
    Globe,
    Zap,
    ArrowRight,
    Play,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    Smartphone,
    Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = React.useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Layout className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Startin</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
                    <a href="#mobile" className="hover:text-white transition-colors">Mobile</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">
                        Entrar
                    </button>
                    <button onClick={() => navigate('/signup')} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        Começar Agora
                    </button>
                </div>
            </div>
        </nav>
    );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all group"
    >
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

const PricingCard = ({ title, price, features, recommended = false, delay, onSelect }: { title: string, price: string, features: string[], recommended?: boolean, delay: number, onSelect?: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className={`relative p-8 rounded-3xl border ${recommended ? 'border-cyan-500 bg-cyan-950/20' : 'border-white/10 bg-[#0f172a]/50'} flex flex-col`}
    >
        {recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Mais Popular
            </div>
        )}
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <div className="mb-6">
            <span className="text-4xl font-bold text-white">{price}</span>
            {price !== 'Custom' && <span className="text-slate-400">/mês</span>}
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                    {feature}
                </li>
            ))}
        </ul>
        <button
            onClick={onSelect}
            className={`w-full py-3 rounded-xl font-bold transition-all ${recommended ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/25' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
            {price === 'Custom' ? 'Falar com Vendas' : (price === 'R$ 0' ? 'Começar Grátis' : 'Assinar Agora')}
        </button>
    </motion.div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="border-b border-white/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-cyan-400 transition-colors"
            >
                <span className="text-lg font-medium text-white">{question}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <p className="pb-6 text-slate-400 leading-relaxed">
                    {answer}
                </p>
            </motion.div>
        </div>
    );
};

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const navigate = useNavigate();
    // We can't use useAuth here easily if LandingPage is outside AuthProvider in the Router structure...
    // Checking App.tsx: LandingPage is at "/lp" and NOT wrapped in AuthProvider/AppProvider in the layout, but let's check line 52 of App.tsx
    // Line 52: <Route path="/lp" element={<LandingPage />} />
    // It is NOT wrapped in AuthProvider. So `useAuth` will fail if used here.
    // We need to handle this.
    // If not logged in -> Redirect to Signup (with intent to upgrade? maybe query param)
    // If logged in (we can check session via supabase direct), trigger checkout.

    // Actually, simpler: just redirect to signup/login for now if not authenticated.
    // Or we can wrap LandingPage in AuthProvider in App.tsx to enable "already logged in" detection.

    const handleUpgrade = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            navigate('/signup?plan=premium');
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('checkout', {
                body: {
                    priceId: 'price_1Sv8sKL51QoDK0cOzyK3MetS', // we need the real price ID from Stripe
                    userId: session.user.id
                }
            });

            if (data?.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', error);
                alert('Erro ao iniciar checkout. Tente novamente.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Erro ao iniciar checkout. Tente novamente.');
        }
    };

    // Fix for the scroll bug mentioned by user
    useEffect(() => {
        const bodyClasses = document.body.className;

        document.body.classList.remove('md:overflow-hidden');
        document.body.classList.remove('h-screen');
        document.body.classList.remove('md:h-screen');
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';

        document.documentElement.style.position = 'static';
        document.body.style.position = 'static';

        return () => {
            document.body.className = bodyClasses;
            document.body.style.overflowX = '';
            document.documentElement.style.overflowX = '';
            document.documentElement.style.position = '';
            document.body.style.position = '';
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            <Navbar />

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/20 to-purple-500/5 blur-[100px] rounded-full pointer-events-none opacity-50" />

                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            Versão 2.0 Disponível
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1]"
                        >
                            Sua agência em uma <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                única aba
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                        >
                            Gerencie clientes, projetos e financeiro sem trocar de contexto.
                            O sistema operacional completo para criadores que buscam escala.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
                            >
                                Hackeie sua Produtividade <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-2">
                                <Play className="w-5 h-5 fill-current" /> Ver Demo
                            </button>
                        </motion.div>

                        {/* Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="mt-20 relative px-4"
                        >
                            <div className="relative mx-auto max-w-5xl group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                <div className="relative bg-[#0f172a] rounded-xl border border-white/10 shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[21/9]">
                                    <div className="absolute inset-x-0 top-0 h-8 bg-[#1e293b] border-b border-white/5 flex items-center px-4 gap-2 z-20">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <div className="ml-4 px-3 py-1 bg-[#020617] rounded-md text-[10px] text-slate-500 font-mono w-64 text-center">startin.app/dashboard</div>
                                    </div>
                                    <img
                                        src="/assets/dashboard-preview.png"
                                        alt="Dashboard Interface"
                                        className="w-full h-full object-cover relative z-10"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* PROBLEM / SOLUTION SECTION */}
                <section className="py-24 bg-[#020617] relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Do <span className="line-through text-slate-500 decoration-red-500 decoration-4">caos</span> à <span className="text-cyan-400">clareza</span>
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">
                                Pare de pagar por 5 ferramentas diferentes. O Startin centraliza tudo o que sua agência precisa para operar no piloto automático.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                <div className="flex items-center gap-3 mb-4 text-red-400">
                                    <ShieldCheck className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">O Caos Atual</h3>
                                </div>
                                <p className="text-slate-400 mb-6">Dados espalhados, assinaturas caras e abas infinitas. Você perde mais tempo organizando do que criando.</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/10 opacity-70">
                                        <div className="w-8 h-8 rounded bg-red-500/20" />
                                        <div className="h-2 w-24 bg-red-500/20 rounded" />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/10 opacity-50">
                                        <div className="w-8 h-8 rounded bg-red-500/20" />
                                        <div className="h-2 w-24 bg-red-500/20 rounded" />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/10 opacity-30">
                                        <div className="w-8 h-8 rounded bg-red-500/20" />
                                        <div className="h-2 w-24 bg-red-500/20 rounded" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-cyan-900/10 border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all" />
                                <div className="flex items-center gap-3 mb-4 text-cyan-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">O Método Startin</h3>
                                </div>
                                <p className="text-slate-400 mb-6">Interface unificada, fluxo de trabalho linear. Tudo conectado em um ecossistema inteligente.</p>
                                <div className="relative rounded-lg overflow-hidden border border-cyan-500/20 h-48 w-full">
                                    <img
                                        src="/assets/kanban-preview.png"
                                        alt="Startin Kanban"
                                        className="w-full h-full object-cover object-top opacity-80 hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section id="features" className="py-24 bg-[#0f172a]/30">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                Tudo o que você precisa. <br /><span className="text-cyan-400">Uma Plataforma.</span>
                            </h2>
                            <p className="text-slate-400">Gerencie seu backend enquanto oferece aos clientes uma experiêncio frontend premium.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureCard
                                icon={CreditCard}
                                delay={0.1}
                                title="Financeiro"
                                description="Emissão de faturas, controle de fluxo de caixa e gestão de despesas recorrentes."
                            />
                            <FeatureCard
                                icon={Layout}
                                delay={0.2}
                                title="Conteúdo"
                                description="Agende e automatize posts em todas as plataformas com nosso calendário visual."
                            />
                            <FeatureCard
                                icon={Users}
                                delay={0.3}
                                title="CRM"
                                description="Gerencie leads e acompanhe o relacionamento com clientes sem esforço."
                            />
                            <FeatureCard
                                icon={Globe}
                                delay={0.4}
                                title="Link-in-Bio"
                                description="Sua página de vendas pessoal, customizável e otimizada para conversão."
                            />
                        </div>
                    </div>
                </section>

                {/* MOBILE APP SECTION */}
                <section id="mobile" className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="flex-1">
                                <div className="inline-block px-4 py-1.5 bg-cyan-900/30 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold tracking-wider uppercase mb-6">
                                    • Em Breve no iOS & Android
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                                    Controle total na <br />
                                    <span className="text-cyan-400">palma da sua mão.</span>
                                </h2>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                    Não espere chegar no escritório para fechar um negócio.
                                    Com o app mobile do Startin, você envia propostas, checa o fluxo de caixa
                                    e responde clientes de qualquer lugar.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Notificações em tempo real",
                                        "Dashboard financeiro rápido",
                                        "Chat com clientes integrado"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300">
                                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-3">
                                    <Smartphone className="w-5 h-5" /> Entrar na Lista de Espera
                                </button>
                            </div>
                            <div className="flex-1 flex justify-center md:justify-end relative">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
                                <div className="relative z-10 w-[300px] border-8 border-[#1e293b] rounded-[3rem] shadow-2xl overflow-hidden bg-[#020617]">
                                    <img
                                        src="/assets/finance-mobile.png"
                                        alt="Startin Mobile App"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section id="pricing" className="py-24 bg-[#0f172a]/30 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Preços Simples e Transparentes</h2>
                            <p className="text-slate-400">Comece grátis, faça upgrade quando escalar. Sem taxas ocultas.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <PricingCard
                                delay={0.1}
                                title="Trial"
                                price="R$ 0"
                                features={[
                                    "7 Dias de Teste Grátis",
                                    "Acesso a todas as funções",
                                    "Suporte da Comunidade",
                                    "Link-in-Bio Integrado"
                                ]}
                                onSelect={() => navigate('/signup')}
                            />
                            <PricingCard
                                delay={0.2}
                                recommended={true}
                                title="Premium"
                                price="R$ 47"
                                features={[
                                    "Projetos Ilimitados",
                                    "Portal do Cliente",
                                    "Financeiro Completo",
                                    "Domínio Personalizado",
                                    "Suporte Prioritário"
                                ]}
                                onSelect={handleUpgrade}
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section className="py-24 bg-[#020617]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes</h2>
                            <p className="text-slate-400">Tudo o que você precisa saber sobre a plataforma.</p>
                        </div>

                        <div className="max-w-3xl mx-auto">
                            <FaqItem
                                question="Posso cancelar a qualquer momento?"
                                answer="Sim, você pode cancelar sua assinatura a qualquer momento através do painel de configurações. Não há contratos de longo prazo ou taxas de cancelamento."
                            />
                            <FaqItem
                                question="Existe um trial do plano Premium?"
                                answer="Sim! Oferecemos 7 dias de teste gratuito no plano Premium para você explorar todas as funcionalidades sem compromisso."
                            />
                            <FaqItem
                                question="Vocês processam pagamentos e faturas?"
                                answer="O Startin se integra com gateways de pagamento como Stripe e Mercado Pago para facilitar suas cobranças automáticas e emissão de notas."
                            />
                            <FaqItem
                                question="Posso adicionar membros ao meu projeto?"
                                answer="Com certeza. A partir do plano Premium (Pro), você começa a adicionar colaboradores com permissões específicas para gerenciar diferentes áreas."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA FOOTER */}
                <section className="py-32 bg-[#020617] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none" />
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="inline-block px-4 py-1.5 bg-cyan-900/30 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold tracking-wider uppercase mb-8">
                                • Vagas limitadas disponíveis
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                                Pronto para escalar seu negócio?
                            </h2>
                            <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
                                Junte-se a 10,000+ criadores que gerenciam seus clientes melhor com o Startin.
                                Economize tempo, receba mais rápido e foque na sua arte.
                            </p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-10 py-5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                            >
                                Começar Gratuitamente <ArrowRight className="inline-block ml-2 w-5 h-5" />
                            </button>
                            <p className="mt-6 text-slate-500 text-sm">Sem cartão de crédito. Cancele a qualquer momento.</p>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="py-12 bg-[#020617] border-t border-white/5 text-sm">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Layout className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-white text-lg">Startin</span>
                            </div>
                            <p className="text-slate-500">
                                © 2026 Startin. Todos os direitos reservados.
                            </p>
                        </div>

                        <div className="flex gap-8 text-slate-400 font-bold tracking-widest text-xs uppercase">
                            <a href="#" className="hover:text-cyan-400 transition-colors">DESIGN</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">CRIATIVO</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">AGÊNCIA</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">ESTÚDIO</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">MARCA</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
