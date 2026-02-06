import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { TransactionType, Transaction, FinancialOrganizer, OrganizerType } from '../types';
import Modal from '../components/Modal';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, Filter, DollarSign, Calendar, AlertCircle, CheckCircle, FileUp, Paperclip, ExternalLink, Loader2, Repeat, CreditCard, Receipt } from 'lucide-react';
import { getBrasiliaDate, formatDisplayDate } from '../lib/dateUtils';
import { supabase } from '../lib/supabase';

const Finance: React.FC = () => {
  const { transactions, customers, contracts, financialOrganizers, addTransaction, updateTransaction, deleteTransaction, addFinancialOrganizer, updateFinancialOrganizer, deleteFinancialOrganizer } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = (searchParams.get('view') as 'transactions' | 'recurrences') || 'transactions';
  const [view, setView] = useState<'transactions' | 'recurrences'>(initialView);

  useEffect(() => {
    const paramView = searchParams.get('view');
    if (paramView === 'recurrences' || paramView === 'transactions') {
      setView(paramView);
    }
  }, [searchParams]);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  const [editingOrganizerId, setEditingOrganizerId] = useState<string | null>(null);
  const [organizerFormData, setOrganizerFormData] = useState<{
    title: string;
    amount: string;
    category: string;
    type: OrganizerType;
    due_day: string;
    active: boolean;
    total_installments: string;
    current_installment: string;
    frequency: 'monthly' | 'weekly';
  }>({
    title: '',
    amount: '',
    category: '',
    type: 'conta_mensal',
    due_day: '1',
    active: true,
    total_installments: '',
    current_installment: '',
    frequency: 'monthly'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const quickProofInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    tipo: TransactionType;
    valor: string;
    categoria: string;
    descricao: string;
    data: string;
    dataVencimento: string;
    statusPagamento: 'pendente' | 'pago' | 'atrasado' | 'parcial';
    customer_id: string;
    valor_pago: string;
    contract_id: string;
  }>({
    tipo: 'despesa',
    valor: '',
    categoria: '',
    descricao: '',
    data: getBrasiliaDate(),
    dataVencimento: '',
    statusPagamento: 'pago',
    customer_id: '',
    valor_pago: '',
    contract_id: '',
    attachment_url: '',
    file: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let publicUrl = formData.attachment_url;

      if (formData.file) {
        const file = formData.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('finance')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: newUrl } } = supabase.storage
          .from('finance')
          .getPublicUrl(filePath);

        publicUrl = newUrl;
      }

      if (editingId) {
        await updateTransaction(editingId, {
          ...formData,
          valor: parseFloat(formData.valor.replace(',', '.')) || 0,
          dataVencimento: formData.dataVencimento || undefined,
          attachment_url: publicUrl,
          valor_pago: parseFloat(formData.valor_pago.replace(',', '.')) || 0,
          contract_id: formData.contract_id || undefined
        });
      } else {
        await addTransaction({
          ...formData,
          valor: parseFloat(formData.valor.replace(',', '.')) || 0,
          dataVencimento: formData.dataVencimento || undefined,
          attachment_url: publicUrl,
          valor_pago: parseFloat(formData.valor_pago.replace(',', '.')) || 0,
          contract_id: formData.contract_id || undefined
        });
      }
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar transação.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickProofUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile || !selectedTxId) return;

    setIsUploading(true);
    try {
      const file = proofFile;
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('finance')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('finance')
        .getPublicUrl(filePath);

      await updateTransaction(selectedTxId, {
        attachment_url: publicUrl
      });

      setIsProofModalOpen(false);
      setProofFile(null);
      setSelectedTxId(null);
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Erro ao fazer upload do comprovante.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (t: Transaction) => {
    setFormData({
      tipo: t.tipo,
      valor: t.valor.toString(),
      categoria: t.categoria,
      descricao: t.descricao,
      data: t.data ? t.data.split('T')[0] : '',
      dataVencimento: t.dataVencimento ? t.dataVencimento.split('T')[0] : '',
      statusPagamento: t.statusPagamento,
      customer_id: t.customer_id || '',
      valor_pago: t.valor_pago?.toString() || '',
      contract_id: t.contract_id || '',
      attachment_url: t.attachment_url || '',
      file: null
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tipo: 'despesa',
      valor: '',
      categoria: '',
      descricao: '',
      data: getBrasiliaDate(),
      dataVencimento: '',
      statusPagamento: 'pago',
      customer_id: '',
      valor_pago: '',
      contract_id: '',
      attachment_url: '',
      file: null
    });
    setEditingId(null);
  };

  const handleOrganizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...organizerFormData,
        amount: parseFloat(organizerFormData.amount.replace(',', '.')) || 0,
        due_day: parseInt(organizerFormData.due_day) || 1,
        total_installments: organizerFormData.total_installments ? parseInt(organizerFormData.total_installments) : undefined,
        current_installment: organizerFormData.current_installment ? parseInt(organizerFormData.current_installment) : undefined
      };

      if (editingOrganizerId) {
        await updateFinancialOrganizer(editingOrganizerId, data);
      } else {
        await addFinancialOrganizer(data);
      }
      setIsOrganizerModalOpen(false);
      resetOrganizerForm();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar organizador.');
    }
  };

  const handleEditOrganizer = (item: FinancialOrganizer) => {
    setOrganizerFormData({
      title: item.title,
      amount: item.amount.toString(),
      category: item.category,
      type: item.type,
      due_day: item.due_day.toString(),
      active: item.active,
      total_installments: item.total_installments?.toString() || '',
      current_installment: item.current_installment?.toString() || '',
      frequency: item.frequency || 'monthly'
    });
    setEditingOrganizerId(item.id);
    setIsOrganizerModalOpen(true);
  };

  const resetOrganizerForm = () => {
    setOrganizerFormData({
      title: '',
      amount: '',
      category: '',
      type: 'conta_mensal',
      due_day: '1',
      active: true,
      total_installments: '',
      current_installment: '',
      frequency: 'monthly'
    });
    setEditingOrganizerId(null);
  };

  const filteredTransactions = transactions
    .filter(t => filterType === 'all' || t.tipo === filterType)
    .sort((a, b) => {
      const dateA = a.data.includes('T') ? a.data : `${a.data}T12:00:00`;
      const dateB = b.data.includes('T') ? b.data : `${b.data}T12:00:00`;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono"><AlertCircle size={10} /> PENDENTE</span>;
      case 'atrasado': return <span className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 font-mono animate-pulse"><AlertCircle size={10} /> ATRASADO</span>;
      case 'parcial': return <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-mono"><AlertCircle size={10} /> PARCIAL</span>;
      default: return <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono"><CheckCircle size={10} /> PAGO</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-400" /> Controle Financeiro
          </h1>
          <p className="text-slate-400 text-sm">Matriz de Fluxo de Caixa</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setSearchParams({ view: 'transactions' })}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'transactions' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Transações
          </button>
          <button
            onClick={() => setSearchParams({ view: 'recurrences' })}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'recurrences' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Recorrências
          </button>
        </div>

        <button
          onClick={() => {
            if (view === 'transactions') {
              resetForm();
              setIsModalOpen(true);
            } else {
              resetOrganizerForm();
              setIsOrganizerModalOpen(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] border ${view === 'transactions' ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30' : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)] border-cyan-400/30'} text-white`}
        >
          <Plus size={18} />
          <span className="font-medium">{view === 'transactions' ? 'Nova Transação' : 'Nova Recorrência'}</span>
        </button>
      </div>

      {view === 'transactions' ? (
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
          <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/50 gap-4 sm:gap-0">
            <h3 className="font-semibold text-slate-200">Log de Transações Profissional</h3>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 w-full sm:w-auto">
              <Filter size={14} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs bg-transparent border-none text-slate-300 focus:ring-0 cursor-pointer outline-none w-full sm:w-auto"
              >
                <option value="all">TODOS OS DADOS</option>
                <option value="receita">ENTRADAS</option>
                <option value="despesa">SAÍDAS</option>
              </select>
            </div>
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase font-mono tracking-widest">
                <tr>
                  <th className="px-6 py-4">Status / Descrição</th>
                  <th className="px-6 py-4">Data / Vencimento</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Anexo</th>
                  <th className="px-6 py-4 text-right">Valor Líquido</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {t.statusPagamento && getStatusBadge(t.statusPagamento)}
                          <span className="font-bold text-slate-200 text-sm uppercase tracking-tight">
                            {t.descricao.startsWith('VENDA_ID:')
                              ? `Venda #${t.descricao.split(':')[1].substring(0, 8)}`
                              : t.descricao}
                          </span>
                        </div>
                        {t.customer_id && (
                          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/30 self-start px-1.5 rounded border border-cyan-800/30">
                            {customers.find(c => c.id === t.customer_id)?.nome || 'Cliente Indisponível'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                          <CheckCircle size={10} className="text-emerald-500" /> {formatDisplayDate(t.data)}
                        </div>
                        {t.dataVencimento && (
                          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono">
                            <Calendar size={10} /> {formatDisplayDate(t.dataVencimento)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400">{t.categoria}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {t.attachment_url ? (
                          <a
                            href={t.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center justify-center w-fit border border-emerald-500/20"
                            title="Ver Comprovante"
                          >
                            <Paperclip size={16} />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTxId(t.id);
                              setIsProofModalOpen(true);
                            }}
                            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all flex items-center justify-center w-fit border border-cyan-500/20"
                            title="Anexar Comprovante"
                          >
                            <FileUp size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono tracking-wide`}>
                      <div className={`font-bold ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {t.statusPagamento === 'parcial' && t.valor_pago != null && (
                        <div className="text-[10px] text-blue-400 mt-1 uppercase">
                          Pago: R$ {t.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-slate-600 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View (Cards) */}
          <div className="md:hidden flex flex-col divide-y divide-slate-800">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="p-4 flex flex-col gap-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-200 text-sm uppercase tracking-tight line-clamp-2">
                      {t.descricao.startsWith('VENDA_ID:')
                        ? `Venda #${t.descricao.split(':')[1].substring(0, 8)}`
                        : t.descricao}
                    </span>
                    {t.customer_id && (
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/30 self-start px-1.5 rounded border border-cyan-800/30">
                        {customers.find(c => c.id === t.customer_id)?.nome || 'Cliente'}
                      </span>
                    )}
                  </div>
                  <div className={`font-bold font-mono tracking-wide text-sm ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {t.statusPagamento === 'parcial' && t.valor_pago != null && (
                      <div className="text-[10px] text-blue-400 text-right uppercase font-normal">
                        Pago: R$ {t.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {t.statusPagamento && getStatusBadge(t.statusPagamento)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                        <CheckCircle size={10} className="text-emerald-500" /> {formatDisplayDate(t.data)}
                      </div>
                      {t.dataVencimento && (
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono">
                          <Calendar size={10} /> {formatDisplayDate(t.dataVencimento)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400">{t.categoria}</span>
                      {t.attachment_url ? (
                        <a
                          href={t.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 rounded-md transition-all"
                        >
                          <Paperclip size={14} />
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTxId(t.id);
                            setIsProofModalOpen(true);
                          }}
                          className="p-1.5 text-cyan-400 bg-cyan-950/30 border border-cyan-800/30 rounded-md transition-all"
                        >
                          <FileUp size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700/50">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 text-slate-600 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-md transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
                            deleteTransaction(t.id);
                          }
                        }}
                        className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhuma transação encontrada.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['recebimento', 'conta_mensal', 'assinatura', 'outro'].map((type) => {
              const typeItems = financialOrganizers.filter(f => f.type === type);
              const totalAmount = typeItems.filter(i => i.active).reduce((sum, item) => sum + item.amount, 0);

              const title = type === 'recebimento' ? 'Recebimentos' : type === 'conta_mensal' ? 'Contas Mensais' : type === 'assinatura' ? 'Assinaturas' : 'Outros';
              const icon = type === 'recebimento' ? <ArrowUpCircle size={18} className="text-emerald-400" /> : type === 'conta_mensal' ? <Receipt size={18} className="text-rose-400" /> : type === 'assinatura' ? <Repeat size={18} className="text-purple-400" /> : <DollarSign size={18} className="text-blue-400" />;
              const colorClass = type === 'recebimento' ? 'emerald' : type === 'conta_mensal' ? 'rose' : type === 'assinatura' ? 'purple' : 'blue';

              return (
                <div key={type} className="glass-panel p-5 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      {icon} {title}
                    </h3>
                    <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-400">Total: R$ {totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    {typeItems.map(item => (
                      <div key={item.id} className={`p-3 rounded-lg border transition-all ${item.active ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-950/30 border-slate-800 opacity-60'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-slate-200">{item.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">{item.category}</span>
                              <span className="text-[10px] text-slate-400">
                                {item.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                                {' • '}
                                {item.frequency === 'weekly'
                                  ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][item.due_day - 1]
                                  : `Dia ${item.due_day}`}
                              </span>
                              {item.total_installments && (
                                <span className="text-[10px] text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/30">
                                  Parcela {item.current_installment || '?'}/{item.total_installments}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-300">R$ {item.amount.toFixed(2)}</div>
                            <div className="flex gap-1 justify-end mt-2">
                              <button onClick={() => updateFinancialOrganizer(item.id, { active: !item.active })} title={item.active ? "Desativar" : "Ativar"} className={`p-1 rounded ${item.active ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-500'}`}>
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => handleEditOrganizer(item)} title="Editar" className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => { if (confirm('Excluir esta recorrência?')) deleteFinancialOrganizer(item.id); }} title="Excluir" className="p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {typeItems.length === 0 && (
                      <div className="text-center py-6 text-slate-600 text-sm italic">Nenhum item adicionado</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Organizer Modal */}
      <Modal isOpen={isOrganizerModalOpen} onClose={() => { setIsOrganizerModalOpen(false); resetOrganizerForm(); }} title={editingOrganizerId ? "Editar Recorrência" : "Nova Recorrência"}>
        <form onSubmit={handleOrganizerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'recebimento', label: 'Recebimento', color: 'emerald' },
                { id: 'conta_mensal', label: 'Conta Mensal', color: 'rose' },
                { id: 'assinatura', label: 'Assinatura', color: 'purple' },
                { id: 'outro', label: 'Outro', color: 'blue' }
              ].map(opt => (
                <label key={opt.id} className={`cursor-pointer text-center py-2 rounded-lg border transition-all text-[10px] font-bold ${organizerFormData.type === opt.id ? `bg-${opt.color}-500/20 border-${opt.color}-500 text-${opt.color}-400` : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}>
                  <input type="radio" value={opt.id} checked={organizerFormData.type === opt.id} onChange={() => setOrganizerFormData({ ...organizerFormData, type: opt.id as any })} className="sr-only" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Frequência</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'monthly', label: 'Mensal' },
                { id: 'weekly', label: 'Semanal' }
              ].map(opt => (
                <label key={opt.id} className={`cursor-pointer text-center py-2 rounded-lg border transition-all text-[10px] font-bold ${organizerFormData.frequency === opt.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}>
                  <input type="radio" value={opt.id} checked={organizerFormData.frequency === opt.id} onChange={() => setOrganizerFormData({ ...organizerFormData, frequency: opt.id as any })} className="sr-only" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Título / Nome</label>
            <input type="text" required value={organizerFormData.title} onChange={e => setOrganizerFormData({ ...organizerFormData, title: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Netflix, Cemig, Internet..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Valor Estimado (R$)</label>
              <input type="text" inputMode="decimal" required value={organizerFormData.amount} onChange={e => setOrganizerFormData({ ...organizerFormData, amount: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">
                {organizerFormData.frequency === 'weekly' ? 'Dia da Semana' : 'Dia de Vencimento'}
              </label>
              {organizerFormData.frequency === 'weekly' ? (
                <select
                  value={organizerFormData.due_day}
                  onChange={e => setOrganizerFormData({ ...organizerFormData, due_day: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono outline-none"
                >
                  <option value="1">Segunda-feira</option>
                  <option value="2">Terça-feira</option>
                  <option value="3">Quarta-feira</option>
                  <option value="4">Quinta-feira</option>
                  <option value="5">Sexta-feira</option>
                  <option value="6">Sábado</option>
                  <option value="7">Domingo</option>
                </select>
              ) : (
                <input type="number" min="1" max="31" required value={organizerFormData.due_day} onChange={e => setOrganizerFormData({ ...organizerFormData, due_day: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono outline-none" placeholder="1-31" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-purple-500 mb-1 uppercase tracking-wider">Parcela Atual</label>
              <input type="number" min="1" value={organizerFormData.current_installment} onChange={e => setOrganizerFormData({ ...organizerFormData, current_installment: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono outline-none" placeholder="Ex: 1" />
            </div>
            <div>
              <label className="block text-xs font-mono text-purple-500 mb-1 uppercase tracking-wider">Total Parcelas</label>
              <input type="number" min="1" value={organizerFormData.total_installments} onChange={e => setOrganizerFormData({ ...organizerFormData, total_installments: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono outline-none" placeholder="Ex: 12" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Categoria</label>
            <input type="text" required value={organizerFormData.category} onChange={e => setOrganizerFormData({ ...organizerFormData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Lazer, Moradia, Serviços..." />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
            <button type="button" onClick={() => { setIsOrganizerModalOpen(false); resetOrganizerForm(); }} className="px-4 py-2 text-slate-400 hover:text-white font-mono">CANCELAR</button>
            <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg font-bold">
              {editingOrganizerId ? "ATUALIZAR" : "SALVAR"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingId ? "Editar Transação Financeira" : "Nova Transação Financeira"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="despesa" checked={formData.tipo === 'despesa'} onChange={() => setFormData({ ...formData, tipo: 'despesa' })} className="peer sr-only" />
              <div className="text-center py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 peer-checked:bg-rose-950/30 peer-checked:border-rose-500 peer-checked:text-rose-400 transition-all font-mono text-xs">SAÍDA</div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="receita" checked={formData.tipo === 'receita'} onChange={() => setFormData({ ...formData, tipo: 'receita' })} className="peer sr-only" />
              <div className="text-center py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 peer-checked:bg-emerald-950/30 peer-checked:border-emerald-500 peer-checked:text-emerald-400 transition-all font-mono text-xs">ENTRADA</div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Valor Líquido</label>
              <input type="text" inputMode="decimal" required value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-emerald-500 outline-none font-mono" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Status Pagamento</label>
              <select value={formData.statusPagamento} onChange={e => setFormData({ ...formData, statusPagamento: e.target.value as any })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-emerald-500 outline-none">
                <option value="pago">PAGO</option>
                <option value="parcial">PAGOU UMA PARTE</option>
                <option value="pendente">PENDENTE</option>
                <option value="atrasado">ATRASADO</option>
              </select>
            </div>
          </div>

          {formData.statusPagamento === 'parcial' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-mono text-blue-500 mb-1 uppercase tracking-wider">Valor Já Pago</label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={formData.valor_pago}
                onChange={e => setFormData({ ...formData, valor_pago: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-blue-500/50 rounded-lg text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                placeholder="Quanto já foi pago?"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Data do Registro</label>
              <input type="date" required value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-rose-500 mb-1 uppercase tracking-wider">Data de Vencimento</label>
              <input type="date" value={formData.dataVencimento} onChange={e => setFormData({ ...formData, dataVencimento: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Cliente Vinculado</label>
            <select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white">
              <option value="">Sem cliente (Geral)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {formData.customer_id && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-mono text-purple-500 mb-1 uppercase tracking-wider">Contrato Vinculado</label>
              <select
                value={formData.contract_id}
                onChange={e => setFormData({ ...formData, contract_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none"
              >
                <option value="">Nenhum contrato</option>
                {contracts
                  .filter(c => c.customer_id === formData.customer_id)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Descrição / Título</label>
            <input type="text" required value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Pagamento Projeto Freelance" />
          </div>

          <div>
            <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Categoria</label>
            <input type="text" required value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Software, Hardware, Consulting..." />
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Comprovante (PDF ou Imagem)</label>
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
                onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-slate-950 border border-dashed border-slate-700 rounded-lg text-slate-400 group-hover:border-cyan-500/50 transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileUp size={18} className="text-cyan-500" />
                  <span className="text-sm truncate">
                    {formData.file ? formData.file.name : (formData.attachment_url ? "Substituir comprovante" : "Toque para selecionar arquivo...")}
                  </span>
                </div>
                <button type="button" className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 whitespace-nowrap">Procurar</button>
              </div>
            </div>
            {formData.attachment_url && !formData.file && (
              <div className="mt-2 flex items-center gap-2 text-[10px] text-cyan-500">
                <Paperclip size={10} />
                <a href={formData.attachment_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  Ver anexo atual <ExternalLink size={8} />
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} disabled={isUploading} className="px-4 py-2 text-slate-400 hover:text-white font-mono">CANCELAR</button>
            <button type="submit" disabled={isUploading} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-lg font-bold flex items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  PROCESSANDO...
                </>
              ) : (
                editingId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR REGISTRO"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {isProofModalOpen && (
        <Modal isOpen={isProofModalOpen} onClose={() => { setIsProofModalOpen(false); setProofFile(null); }} title="Anexar Comprovante de Pagamento">
          <form onSubmit={handleQuickProofUpload} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-wider">Arquivo (PDF ou Imagem)</label>
              <div className="relative group">
                <input
                  type="file"
                  ref={quickProofInputRef}
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
                  required
                  onChange={e => setProofFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div
                  onClick={() => quickProofInputRef.current?.click()}
                  className="w-full px-4 py-10 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 group-hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400">
                    <FileUp size={32} />
                  </div>
                  <span className="text-sm font-medium text-center px-4">
                    {proofFile ? proofFile.name : "Toque para selecionar o arquivo"}
                  </span>
                  <button type="button" className="text-xs bg-slate-800 text-slate-200 px-4 py-2 rounded-full border border-slate-700">Procurar Documento</button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Dica: No Android, escolha a opção "Arquivos" para PDFs.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
              <button type="button" onClick={() => { setIsProofModalOpen(false); setProofFile(null); }} disabled={isUploading} className="px-4 py-2 text-slate-400 hover:text-white font-mono uppercase text-xs">Cancelar</button>
              <button type="submit" disabled={isUploading} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg font-bold flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    ENVIANDO...
                  </>
                ) : (
                  "CONFIRMAR ANEXO"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Finance;