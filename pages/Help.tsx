import React, { useState } from 'react';
import {
    HelpCircle,
    LayoutDashboard,
    Users,
    DollarSign,
    Layout as LayoutIcon,
    Calendar,
    Lightbulb,
    CheckSquare,
    Package,
    ShoppingCart,
    ChevronRight,
    Info,
    FileText,
    TrendingUp,
    Clock,
    Palette,
    Link as LinkIcon,
    Smartphone,
    RefreshCcw,
    Zap,
    PlusCircle,
    ArrowRight,
    MessageCircle,
    Settings,
    ShieldCheck,
    BarChart3,
    Eye,
    Lock
} from 'lucide-react';

const Help: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('geral');

    const sections = [
        { id: 'geral', label: 'Conceitos e PWA', icon: Info },
        { id: 'clientes', label: 'CRM e Portal Cliente', icon: Users },
        { id: 'financeiro', label: 'Gestão Financeira Pro', icon: DollarSign },
        { id: 'bio', label: 'Marketing e Link Bio', icon: LayoutIcon },
        { id: 'tarefas', label: 'Gestão de Tarefas', icon: CheckSquare },
        { id: 'vendas', label: 'Estoque e PDV', icon: ShoppingCart },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'geral':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <header className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
                                    <Zap size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Arquitetura do Startin Clients</h2>
                                    <p className="text-slate-500 text-sm">Entenda como cada engrenagem se move no sistema.</p>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 gap-6">
                            <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="text-emerald-400" /> Funcionamento em Nuvem
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Toda ação que você realiza no app é imediatamente sincronizada com o banco de dados **Supabase**. Isso significa que se você cadastrar um cliente no computador, ele aparecerá instantaneamente no seu celular. Os comprovantes financeiros e PDFs de contratos são armazenados em um *Storage* seguro de alta performance.
                                </p>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                                    <RefreshCcw className="text-cyan-500 animate-spin-slow" size={24} />
                                    <div>
                                        <h4 className="text-white text-xs font-bold uppercase">Sincronização 24/7</h4>
                                        <p className="text-slate-500 text-[10px]">Trabalhe offline e o sistema sincronizará assim que houver conexão.</p>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/20 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                            <Smartphone size={24} />
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-500 font-bold">RECOMENDADO</span>
                                    </div>
                                    <h3 className="text-white font-bold mb-2">Instalação Mobile (PWA)</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                                        O Startin Clients é uma *Progressive Web App*. Não precisa baixar da App Store.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="text-[11px] text-slate-400 flex gap-2">
                                            <ArrowRight size={12} className="text-cyan-500 shrink-0 mt-0.5" />
                                            <span>**No iPhone:** Safari &rarr; Compartilhar &rarr; Tela de Início.</span>
                                        </li>
                                        <li className="text-[11px] text-slate-400 flex gap-2">
                                            <ArrowRight size={12} className="text-cyan-500 shrink-0 mt-0.5" />
                                            <span>**No Android:** Chrome &rarr; Três Pontos &rarr; Instalar.</span>
                                        </li>
                                    </ul>
                                </section>

                                <section className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/20 transition-all group">
                                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 mb-4 w-fit group-hover:bg-purple-500/20 transition-colors">
                                        <Settings size={24} />
                                    </div>
                                    <h3 className="text-white font-bold mb-2">Modos de Interface</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                                        Alterne entre os focos do seu negócio no topo do menu lateral.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-cyan-400">USUÁRIO</span>
                                            <span className="text-slate-600">Serviços e Conteúdo</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="w-1/2 h-full bg-cyan-500"></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-orange-400">LOJA</span>
                                            <span className="text-slate-600">Vendas e Estoque</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                );
            case 'clientes':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <section className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-cyan-950/10 to-transparent">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Users className="text-cyan-400" /> CRM e Fidelização
                            </h2>
                            <p className="text-slate-500 text-sm mb-8 italic text-center">"O cliente não é apenas um CPF, é um relacionamento que precisa de transparência."</p>

                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                    <div className="md:col-span-1 flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">01</div>
                                        <div className="w-0.5 h-20 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                                    </div>
                                    <div className="md:col-span-11 pt-1">
                                        <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-wide">Cadastro Primário</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                            Ao clicar em "Novo Cliente", você dá início à inteligência do sistema. O campo **WhatsApp** é crucial: insira o número com o formato (DDD) 9XXXX-XXXX. Isso habilitará botões automáticos para você iniciar conversas direto pelo app, sem precisar salvar o contato na agenda do celular.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                    <div className="md:col-span-1 flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center text-purple-400 font-bold">02</div>
                                        <div className="w-0.5 h-20 bg-gradient-to-b from-purple-500 to-transparent"></div>
                                    </div>
                                    <div className="md:col-span-11 pt-1">
                                        <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-wide">Repositório de Contratos</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                            Na aba "Contratos", nunca deixe um serviço sem formalização. Suba o PDF assinado. O diferencial aqui é que o sistema gera um **Preview** rápido. Você pode consultar cláusulas ou prazos em segundos em uma reunião, direto pelo seu smartphone.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                    <div className="md:col-span-1 flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">03</div>
                                    </div>
                                    <div className="md:col-span-11 pt-1">
                                        <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-wide">O portal "UAU" do Cliente</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            Vá no perfil do cliente e clique em **"Ativar Portal"**. O sistema gerará um link único criptografado.
                                            **O que o cliente vê?** Ao abrir o link, ele entra em uma página personalizada com as boas-vindas dele, os contratos para baixar e o status financeiro dele com você. É profissionalismo máximo que gera confiança para novas vendas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'financeiro':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <section className="glass-panel p-8 rounded-3xl border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <DollarSign className="text-emerald-400" /> Engenharia de Fluxo de Caixa
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h4 className="text-emerald-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                        <PlusCircle size={16} /> Entradas e Recebimentos
                                    </h4>
                                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                                        <div>
                                            <p className="text-white text-xs font-bold mb-1">Status: Pagamento Parcial</p>
                                            <p className="text-slate-500 text-[11px] leading-relaxed">
                                                Ideal para fechamento de projetos com sinal. O sistema calcula automaticamente o saldo restante.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white text-xs font-bold mb-1">Recorrências de Recebimento</p>
                                            <p className="text-slate-500 text-[11px] leading-relaxed">
                                                Cadastre recebimentos fixos (Mensais ou Semanais). O Dashboard projeta quanto você vai receber no mês, considerando quantas vezes aquele dia da semana ocorre.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-rose-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={16} /> Organizadores (Contas a Pagar)
                                    </h4>
                                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                                        <p className="text-slate-400 text-xs leading-relaxed">
                                            Cadastre aluguel, luz, internet e outras despesas fixas na aba "Recorrências". Você pode definir se é uma conta **Mensal** (Dia X) ou **Semanal** (Toda Sexta-feira, por exemplo).
                                        </p>
                                        <ul className="space-y-2">
                                            <li className="text-[10px] text-slate-500 flex gap-2">
                                                <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 grow-0 shrink-0"></div>
                                                O Dashboard alerta contas vencendo nos próximos 3 dias.
                                            </li>
                                            <li className="text-[10px] text-slate-500 flex gap-2">
                                                <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 grow-0 shrink-0"></div>
                                                Contas ativas aparecem na previsão de gastos do mês automaticamente.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-900 space-y-4">
                                <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                    <BarChart3 className="text-cyan-500" size={18} /> Entendendo a Matemática
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-mono">SALDO REAL PAGO</p>
                                        <p className="text-slate-300 text-[10px] leading-tight font-medium">O que realmente entrou menos o que saiu.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-amber-600 font-mono">A RECEBER PENDENTE</p>
                                        <p className="text-slate-300 text-[10px] leading-tight font-medium">Contratos ativos não pagos + Vendas pendentes.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-rose-600 font-mono">PREVISÃO DE GASTOS</p>
                                        <p className="text-slate-300 text-[10px] leading-tight font-medium">Soma inteligente de todas as suas contas fixas (mensais e semanais).</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-purple-600 font-mono">SALDO PROJETADO</p>
                                        <p className="text-slate-300 text-[10px] leading-tight font-medium">Estimativa final do seu caixa se tudo for pago e recebido.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'bio':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <section className="glass-panel p-8 rounded-3xl border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Palette className="text-purple-400" /> Marketing de Conversão (Bio)
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                                <div className="space-y-6">
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                        <h4 className="text-white font-bold text-sm mb-2">Botões Visuais</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">
                                            Não use apenas cores sólidas. No gerenciador da Bio, você pode subir fotos de fundo para cada botão.
                                            **Dica:** Use fotos que representem o serviço (ex: Uma foto de câmera para o link "Orçamento Foto"). Isso aumenta a taxa de clique (CTR) em até 40%.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                                        <h4 className="text-white font-bold text-sm mb-2">Imagens de Fundo</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">
                                            O sistema aplica um *blur* elegante na sua imagem de fundo para garantir que seus botões e links fiquem legíveis. Escolha imagens com cores que combinem com a sua marca.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative aspect-[9/16] max-w-[280px] mx-auto hidden lg:block">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-950 rounded-b-xl"></div>
                                    <div className="space-y-4 pt-10">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto border-2 border-cyan-500"></div>
                                        <div className="h-3 w-32 bg-slate-800 rounded-full mx-auto"></div>
                                        <div className="h-2 w-24 bg-slate-800/50 rounded-full mx-auto mb-10"></div>
                                        <div className="h-10 w-full bg-cyan-500/20 border border-cyan-500/30 rounded-xl"></div>
                                        <div className="h-10 w-full bg-cyan-500/20 border border-cyan-500/30 rounded-xl"></div>
                                        <div className="h-10 w-full bg-cyan-500/20 border border-cyan-500/30 rounded-xl"></div>
                                    </div>
                                    <p className="text-center text-[8px] text-slate-600 mt-8 font-mono">SIMULADOR INTEGRADO</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'tarefas':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <section className="glass-panel p-8 rounded-3xl border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <CheckSquare className="text-amber-400" /> Gestão de Tarefas
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-900/30 rounded-3xl border border-slate-800 space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <CheckSquare className="text-amber-500" /> Kanban ou Lista
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Organize seu fluxo de trabalho visualmente. Crie tarefas para tudo: desde "Comprar material de escritório" até "Finalizar edição do vídeo do cliente X".
                                        Use a visualização de Kanban para arrastar tarefas entre "A Fazer", "Em Progresso" e "Concluído".
                                    </p>
                                </div>

                                <div className="p-8 bg-slate-900/30 rounded-3xl border border-slate-800 space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <Lightbulb className="text-cyan-500" /> Tags e Prioridades
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Use tags para categorizar suas tarefas (ex: #Urgente, #Financeiro, #Pessoal). Isso ajuda a filtrar visualmente o que é mais importante no seu dia a dia.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'vendas':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <section className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-orange-950/10 to-transparent">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <ShoppingCart className="text-orange-400" /> Gestão de Estoque e Vendas (Modo Loja)
                            </h2>
                            <p className="text-slate-400 text-sm mb-10 leading-relaxed">
                                Se você vende produtos físicos, o sistema automatiza 3 processos em 1 clique.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">1</div>
                                    <h4 className="text-white font-bold text-xs uppercase">Cadastro Estoque</h4>
                                    <p className="text-slate-500 text-[11px]">Insira seus produtos com preço de venda e quantidade atual. O sistema te avisará se o estoque estiver baixo.</p>
                                </div>
                                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">2</div>
                                    <h4 className="text-white font-bold text-xs uppercase">Terminal de Vendas</h4>
                                    <p className="text-slate-500 text-[11px]">No PDV, selecione o cliente e os produtos. O sistema calcula o total instantaneamente.</p>
                                </div>
                                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">3</div>
                                    <h4 className="text-white font-bold text-xs uppercase">Baixa e Receita</h4>
                                    <p className="text-slate-500 text-[11px]">Ao finalizar, o estoque é subtraído e o valor entra automaticamente no seu gráfico financeiro como receita.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 pb-24 max-w-7xl mx-auto">
            {/* Header Moderno */}
            <div className="relative overflow-hidden bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 md:p-12">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                    <HelpCircle size={300} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">Suporte & Documentação</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                            Manual de Operação <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Startin 1.0</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl leading-snug">
                            Guia operacional detalhado para dominar cada ferramenta do seu ecossistema de gestão.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navegação Lateral Estilizada */}
                <div className="lg:col-span-4 space-y-3 md:sticky md:top-8">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full group relative flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500 ${activeSection === section.id
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.1)] ring-1 ring-cyan-500/10'
                                : 'bg-slate-900/30 border-slate-800/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                                }`}
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-500 ${activeSection === section.id ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-600 group-hover:text-slate-400'}`}>
                                <section.icon size={22} />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="font-bold text-sm tracking-tight">{section.label}</span>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5">Módulo de {section.id}</p>
                            </div>
                            <ChevronRight size={18} className={`transition-all duration-500 ${activeSection === section.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} />
                        </button>
                    ))}

                    <div className="mt-8 p-6 glass-panel rounded-3xl border border-slate-800/50 hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm mb-3">
                            <MessageCircle size={20} /> Canal de Suporte
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
                            Não encontrou o que precisava? Nossa equipe técnica está pronta para ajudar via WhatsApp.
                        </p>
                        <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
                            Falar com Suporte Startin
                        </button>
                    </div>
                </div>

                {/* Área de Conteúdo */}
                <div className="lg:col-span-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Help;
