import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Customer, Contract, Transaction } from '../types';
import {
    User,
    FileText,
    DollarSign,
    Download,
    ExternalLink,
    AlertCircle,
    CheckCircle,
    Clock,
    ShieldCheck,
    Calendar,
    Receipt
} from 'lucide-react';
import { formatDisplayDate } from '../lib/dateUtils';

const ClientPortal: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'docs' | 'finance'>('docs');

    useEffect(() => {
        if (customer) {
            document.title = `${customer.nome} | Portal do Cliente | UPStartin`;
        } else {
            document.title = `Portal do Cliente | UPStartin`;
        }
    }, [customer]);

    useEffect(() => {
        const fetchPortalData = async () => {
            if (!token) {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                // Use RPC to securely fetch data bypassing RLS
                const { data, error: rpcError } = await supabase.rpc('get_portal_data', { p_token: token });

                if (rpcError) {
                    throw rpcError;
                }

                if (!data || data.error) {
                    console.error('Portal Error:', data?.error || 'No data returned');
                    setError(true);
                    setLoading(false);
                    return;
                }

                const { customer, contracts, transactions } = data;

                setCustomer({
                    ...customer,
                    criadoEm: new Date(customer.criado_em).getTime()
                });

                setContracts(contracts.map((c: any) => ({
                    ...c,
                    created_at: new Date(c.created_at).getTime()
                })));

                setTransactions(transactions.map((tx: any) => ({
                    ...tx,
                    dataVencimento: tx.data_vencimento,
                    statusPagamento: tx.status_pagamento,
                    criadaEm: new Date(tx.criada_em).getTime()
                })));

            } catch (err) {
                console.error('Portal Error:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPortalData();
    }, [token]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendente': return <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono"><Clock size={10} /> PENDENTE</span>;
            case 'atrasado': return <span className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 font-mono animate-pulse"><AlertCircle size={10} /> ATRASADO</span>;
            case 'parcial': return <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-mono"><CheckCircle size={10} /> PARCIAL</span>;
            default: return <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono"><CheckCircle size={10} /> PAGO</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                <div className="text-cyan-500/50 font-mono text-xs uppercase tracking-widest animate-pulse">Autenticando Acesso Seguro...</div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent)]">
                <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center border border-slate-800 shadow-2xl">
                    <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} className="text-rose-500 opacity-50" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Este portal não está mais ativo ou o link de acesso expirou.
                        Por favor, solicite um novo link ao seu consultor.
                    </p>
                    <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                        Ref code: {token?.substring(0, 8)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-white pb-24">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 glass-panel border-b border-slate-800/50 py-6 md:py-8 px-4 md:px-6 mb-4 md:mb-8 mt-4 mx-4 md:mx-auto max-w-5xl rounded-2xl md:rounded-3xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            <User size={24} className="text-white md:hidden" />
                            <User size={32} className="text-white hidden md:block" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">{customer.nome}</h1>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                                <span className="text-[10px] md:text-xs text-slate-400 font-mono truncate max-w-[150px] md:max-w-none">{customer.email}</span>
                                <span className="hidden md:block w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span className="text-[9px] md:text-xs text-cyan-400 font-mono px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded">PORTAL ATIVO</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-slate-500 text-[10px] font-mono uppercase bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Ambiente Seguro & Criptografado
                    </div>
                </div>
            </header>

            {/* Mobile Tab Switcher */}
            <div className="relative z-10 lg:hidden px-4 mb-6">
                <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'docs' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <FileText size={14} /> DOCUMENTOS
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'finance' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <DollarSign size={14} /> FINANCEIRO
                    </button>
                </div>
            </div>

            <main className="relative z-10 max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Contracts Section */}
                <div className={`lg:col-span-2 space-y-6 ${activeTab !== 'docs' ? 'hidden lg:block' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-cyan-400" />
                            Contratos & Documentos
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {contracts.length} ITENS
                        </span>
                    </div>

                    <div className="grid gap-3 md:gap-4">
                        {contracts.length > 0 ? (
                            contracts.map(contract => (
                                <div key={contract.id} className="glass-panel border border-slate-800 p-4 md:p-5 rounded-xl md:rounded-2xl hover:border-cyan-500/30 transition-all group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/5 transition-colors">
                                                <FileText size={20} className="md:hidden" />
                                                <FileText size={24} className="hidden md:block" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors uppercase tracking-tight text-sm md:text-base truncate">{contract.title}</h3>
                                                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {contract.payment_proof_url && (
                                                <a
                                                    href={contract.payment_proof_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0 p-2.5 md:p-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg md:rounded-xl transition-all border border-emerald-500/20 shadow-lg flex items-center gap-2 text-xs md:text-sm font-bold"
                                                    title="Ver Comprovante"
                                                >
                                                    <Receipt size={16} />
                                                    <span className="hidden sm:inline">COMPROVANTE</span>
                                                </a>
                                            )}
                                            <a
                                                href={contract.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 p-2.5 md:p-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg md:rounded-xl transition-all border border-cyan-500/20 shadow-lg flex items-center gap-2 text-xs md:text-sm font-bold"
                                            >
                                                <Download size={16} />
                                                <span className="hidden sm:inline">PDF</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 md:py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
                                <FileText size={40} className="text-slate-700 mx-auto mb-4 opacity-50" />
                                <p className="text-slate-500 text-xs md:text-sm px-6">Nenhum contrato disponível para visualização.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoices Section */}
                <div className={`space-y-6 ${activeTab !== 'finance' ? 'hidden lg:block' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-400" />
                            Financeiro
                        </h2>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} className={`glass-panel border ${tx.statusPagamento === 'atrasado' ? 'border-rose-500/20 bg-rose-500/5' : 'border-slate-800'} p-4 md:p-5 rounded-xl md:rounded-2xl`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{tx.categoria}</span>
                                            <h4 className="font-bold text-slate-200 uppercase tracking-tight text-sm md:text-base leading-tight pr-2">{tx.descricao}</h4>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-base md:text-lg font-bold text-emerald-400 font-mono">
                                                R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                            {tx.statusPagamento === 'parcial' && tx.valor_pago && (
                                                <div className="text-[9px] text-blue-400 uppercase font-mono">
                                                    PAGO: R$ {tx.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-mono">
                                                <Calendar size={9} /> {formatDisplayDate(tx.data)}
                                            </div>
                                            {tx.dataVencimento && (
                                                <div className={`flex items-center gap-1.5 text-[9px] font-mono ${tx.statusPagamento === 'atrasado' ? 'text-rose-400' : 'text-slate-500'}`}>
                                                    <Clock size={9} /> VENC: {formatDisplayDate(tx.dataVencimento)}
                                                </div>
                                            )}
                                        </div>
                                        {getStatusBadge(tx.statusPagamento)}
                                    </div>

                                    {tx.contract_id && (
                                        <div className="mt-3 w-full py-1.5 bg-purple-500/5 rounded-lg text-[9px] font-bold text-purple-400 flex items-center justify-center gap-2 border border-purple-500/10 transition-all">
                                            <FileText size={10} /> CONTRATO VINCULADO
                                        </div>
                                    )}

                                    {tx.attachment_url && (
                                        <a
                                            href={tx.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-[9px] font-bold text-cyan-500 flex items-center justify-center gap-2 border border-slate-800 transition-all"
                                        >
                                            <ExternalLink size={10} /> COMPROVANTE
                                        </a>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
                                <DollarSign size={32} className="text-slate-700 mx-auto mb-4 opacity-50" />
                                <p className="text-slate-500 text-xs px-6">Nenhuma fatura encontrada.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 w-full z-20 glass-panel border-t border-slate-800/50 py-3.5 px-6 flex items-center justify-center bg-slate-950/90">
                <p className="text-[9px] md:text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] text-center">
                    SISTEMA POR <span className="text-white font-bold">PEDRO AUGUSTO | Grupo Startin</span> <img src="/logo.png" alt="UPStartin" className="h-3 w-auto inline-block ml-2 opacity-50 grayscale hover:grayscale-0 transition-all" />
                </p>
            </footer>

            {/* Flashing Popup */}
            <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50">
                <a
                    href="https://wa.me/5531982781618"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold text-[10px] md:text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/30 animate-pulse-fast transition-all hover:scale-105"
                >
                    <span className="relative flex h-2 w-2 md:h-3 md:w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-emerald-500"></span>
                    </span>
                    CONTRATAR SISTEMA
                    <DollarSign size={14} className="md:size-4" />
                </a>
            </div>
        </div>
    );
};

export default ClientPortal;
