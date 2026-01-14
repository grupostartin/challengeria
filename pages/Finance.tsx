import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TransactionType, Transaction } from '../types';
import Modal from '../components/Modal';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, Filter, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { getBrasiliaDate, formatDisplayDate } from '../lib/dateUtils';

const Finance: React.FC = () => {
  const { transactions, customers, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');

  const [formData, setFormData] = useState<{
    tipo: TransactionType;
    valor: string;
    categoria: string;
    descricao: string;
    data: string;
    dataVencimento: string;
    statusPagamento: 'pendente' | 'pago' | 'atrasado';
    customer_id: string;
  }>({
    tipo: 'despesa',
    valor: '',
    categoria: '',
    descricao: '',
    data: getBrasiliaDate(),
    dataVencimento: '',
    statusPagamento: 'pago',
    customer_id: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTransaction(editingId, {
        ...formData,
        valor: parseFloat(formData.valor),
        dataVencimento: formData.dataVencimento || undefined,
      });
    } else {
      addTransaction({
        ...formData,
        valor: parseFloat(formData.valor),
        dataVencimento: formData.dataVencimento || undefined,
      });
    }
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (t: Transaction) => {
    setFormData({
      tipo: t.tipo,
      valor: t.valor.toString(),
      categoria: t.categoria,
      descricao: t.descricao,
      data: t.data,
      dataVencimento: t.dataVencimento || '',
      statusPagamento: t.statusPagamento,
      customer_id: t.customer_id || ''
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
      customer_id: ''
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
                        <span className="font-bold text-slate-200 text-sm uppercase tracking-tight">{t.descricao}</span>
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
                  <td className={`px-6 py-4 text-right font-bold font-mono tracking-wide ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <span className="font-bold text-slate-200 text-sm uppercase tracking-tight line-clamp-2">{t.descricao}</span>
                  {t.customer_id && (
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/30 self-start px-1.5 rounded border border-cyan-800/30">
                      {customers.find(c => c.id === t.customer_id)?.nome || 'Cliente'}
                    </span>
                  )}
                </div>
                <div className={`font-bold font-mono tracking-wide text-sm ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400">{t.categoria}</span>
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
                <option value="pendente">PENDENTE</option>
                <option value="atrasado">ATRASADO</option>
              </select>
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Descrição / Título</label>
            <input type="text" required value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Pagamento Projeto Freelance" />
          </div>

          <div>
            <label className="block text-xs font-mono text-emerald-500 mb-1 uppercase tracking-wider">Categoria</label>
            <input type="text" required value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Software, Hardware, Consulting..." />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-slate-400 hover:text-white font-mono">CANCELAR</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-lg font-bold">{editingId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR REGISTRO"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;