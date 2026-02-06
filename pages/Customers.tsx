import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Customer } from '../types';
import Modal from '../components/Modal';
import { Plus, Users, Mail, Phone, Clock, AlertCircle, ShoppingBag, Lightbulb, CheckSquare, DollarSign, Trash2, Edit2, Share2, CheckCircle, ShieldCheck } from 'lucide-react';

const Customers: React.FC = () => {
    const {
        customers,
        tasks,
        transactions,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        togglePortalShare
    } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        status: 'ativo' as Customer['status']
    });

    const getCustomerStats = (customerId: string) => {
        const customerTasks = tasks.filter(t => t.customer_id === customerId);
        const customerTransactions = transactions.filter(tx => tx.customer_id === customerId);
        const balance = customerTransactions.reduce((acc, tx) => acc + (tx.tipo === 'receita' ? tx.valor : -tx.valor), 0);

        return {
            tasksCount: customerTasks.length,
            balance,
            hasDebt: customerTransactions.some(tx => tx.tipo === 'despesa' && tx.categoria === 'pendente') // Exemplo simplificado
        };
    };

    const copyToClipboard = (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for mobile/non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const handlePortalShare = async (id: string) => {
        const url = await togglePortalShare(id);
        if (url) {
            copyToClipboard(url);
            setCopyingId(id);
            setTimeout(() => setCopyingId(null), 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await updateCustomer(editingId, formData);
        } else {
            await addCustomer(formData);
        }
        resetForm();
        setIsModalOpen(false);
    };

    const handleEdit = (customer: Customer) => {
        setFormData({
            nome: customer.nome,
            email: customer.email,
            telefone: customer.telefone,
            status: customer.status
        });
        setEditingId(customer.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ nome: '', email: '', telefone: '', status: 'ativo' });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Users className="text-cyan-400" /> Gestão de Clientes
                    </h1>
                    <p className="text-slate-400 text-sm">Relacionamento e Projetos</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] border border-cyan-400/30"
                >
                    <Plus size={18} />
                    <span className="font-medium">Novo Cliente</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map(customer => {
                    const stats = getCustomerStats(customer.id);
                    return (
                        <div key={customer.id} className="glass-panel rounded-xl neon-border transition-all duration-300 flex flex-col group">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest border ${customer.status === 'ativo' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' :
                                        customer.status === 'atraso' ? 'border-rose-500 text-rose-400 bg-rose-950/30 animate-pulse' :
                                            'border-slate-500 text-slate-400 bg-slate-900/30'
                                        }`}>
                                        {customer.status}
                                    </div>
                                    <div className="flex gap-2">
                                        {customer.portal_token && (
                                            <button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/#/portal/${customer.portal_token}`;
                                                    copyToClipboard(url);
                                                    setCopyingId(customer.id);
                                                    setTimeout(() => setCopyingId(null), 2000);
                                                }}
                                                className="p-1.5 rounded-lg text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 hover:bg-emerald-400/20 transition-all"
                                                title="Copiar Link do Portal"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handlePortalShare(customer.id)}
                                            className={`p-1.5 rounded-lg transition-all ${customer.portal_token ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10'}`}
                                            title={customer.portal_token ? "Desativar Portal" : "Ativar Portal do Cliente"}
                                        >
                                            <ShieldCheck size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(customer)} className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Edit2 size={16} /></button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Tem certeza que deseja excluir este cliente? Isso removerá todos os dados vinculados.')) {
                                                    deleteCustomer(customer.id);
                                                }
                                            }}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{customer.nome}</h3>

                                {copyingId === customer.id && (
                                    <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1">
                                            <CheckCircle size={10} /> Link do Portal Copiado!
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Mail size={14} className="text-cyan-500" /> {customer.email || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Phone size={14} className="text-cyan-500" /> {customer.telefone || 'N/A'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">

                                    <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center">
                                        <CheckSquare size={18} className="text-purple-400 mb-1" />
                                        <span className="text-white font-bold">{stats.tasksCount}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">Projetos</span>
                                    </div>
                                </div>

                                <div className={`p-3 rounded-lg flex items-center justify-between ${stats.balance >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} className={stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
                                        <span className="text-xs font-mono text-slate-300">SALDO GERAL</span>
                                    </div>
                                    <span className={`font-mono font-bold ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Nome do Cliente</label>
                        <input
                            type="text" required value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
                            placeholder="Ex: Empresa X"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Email</label>
                            <input
                                type="email" value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
                                placeholder="contato@ex.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Telefone</label>
                            <input
                                type="text" value={formData.telefone}
                                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
                                placeholder="(31) 98278-1618"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Status Financeiro</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
                        >
                            <option value="ativo">Ativo</option>
                            <option value="atraso">Atraso no Pagamento</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg">Salvar Cliente</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;
