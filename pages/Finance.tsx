import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TransactionType, Transaction } from '../types';
import Modal from '../components/Modal';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, Filter, DollarSign, Calendar, AlertCircle, CheckCircle, FileUp, Paperclip, ExternalLink, Loader2 } from 'lucide-react';
import { getBrasiliaDate, formatDisplayDate } from '../lib/dateUtils';
import { supabase } from '../lib/supabase';

const Finance: React.FC = () => {
  const { transactions, customers, contracts, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

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
          valor: parseFloat(formData.valor),
          dataVencimento: formData.dataVencimento || undefined,
          attachment_url: publicUrl,
          valor_pago: parseFloat(formData.valor_pago) || 0,
          contract_id: formData.contract_id || undefined
        });
      } else {
        await addTransaction({
          ...formData,
          valor: parseFloat(formData.valor),
          dataVencimento: formData.dataVencimento || undefined,
          attachment_url: publicUrl,
          valor_pago: parseFloat(formData.valor_pago) || 0,
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
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/30"
        >
          <Plus size={18} />
          <span className="font-medium">Nova Transação</span>
        </button>
      </div>

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
                    {t.statusPagamento === 'parcial' && t.valor_pago && (
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
                  {t.statusPagamento === 'parcial' && t.valor_pago && (
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
              <input type="number" step="0.01" required value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-emerald-500 outline-none font-mono" placeholder="0.00" />
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
                type="number"
                step="0.01"
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
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-3 bg-slate-950 border border-dashed border-slate-700 rounded-lg text-slate-400 group-hover:border-cyan-500/50 transition-all flex items-center gap-3">
                <FileUp size={18} className="text-cyan-500" />
                <span className="text-sm truncate">
                  {formData.file ? formData.file.name : (formData.attachment_url ? "Substituir comprovante existente" : "Selecionar arquivo...")}
                </span>
                <p className="text-[10px] text-slate-500">Dica: No Android, escolha a opção "Arquivos" para PDFs.</p>
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
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  required
                  onChange={e => setProofFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-4 py-10 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 group-hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-3">
                  <FileUp size={32} className="text-cyan-500" />
                  <span className="text-sm font-medium">
                    {proofFile ? proofFile.name : "Clique para selecionar o arquivo"}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">PDF, JPG, PNG, WEBP</span>
                  <p className="text-[10px] text-slate-400 mt-2">Dica: No Android, escolha a opção "Arquivos" para PDFs.</p>
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