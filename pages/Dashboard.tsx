import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lightbulb, CheckCircle2, Wallet, TrendingUp, Activity } from 'lucide-react';
import { formatDisplayDate } from '../lib/dateUtils';

const Dashboard: React.FC = () => {
  const { ideas, tasks, transactions } = useApp();

  // Stats Calculation
  const totalIdeas = ideas.length;
  const ideasInProgress = ideas.filter(i => i.status === 'producao').length;

  const tasksTodo = tasks.filter(t => t.coluna === 'todo').length;
  const tasksDone = tasks.filter(t => t.coluna === 'done').length;

  const income = transactions
    .filter(t => t.tipo === 'receita' && (t.statusPagamento === 'pago' || !t.statusPagamento))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const pendingIncome = transactions
    .filter(t => t.tipo === 'receita' && (t.statusPagamento === 'pendente' || t.statusPagamento === 'atrasado'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const expense = transactions
    .filter(t => t.tipo === 'despesa' && (t.statusPagamento === 'pago' || !t.statusPagamento))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const pendingExpense = transactions
    .filter(t => t.tipo === 'despesa' && (t.statusPagamento === 'pendente' || t.statusPagamento === 'atrasado'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const balance = income - expense;

  const chartData = [
    { name: 'Recebido', value: income, color: '#10b981' },
    { name: 'Pago', value: expense, color: '#f43f5e' },
    { name: 'Saldo Real', value: balance, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-cyan-500" /> Visão Geral
          </h1>
          <p className="text-sm text-slate-400">Status do sistema e métricas principais</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-xl hover:border-cyan-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total de Ideias</p>
              <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{totalIdeas}</h3>
              <span className="text-xs text-cyan-300 bg-cyan-950/50 border border-cyan-900 px-2 py-1 rounded-full mt-2 inline-block">
                {ideasInProgress} em produção
              </span>
            </div>
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-cyan-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all">
              <Lightbulb size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl hover:border-warning/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Tarefas Pendentes</p>
              <h3 className="text-2xl font-bold text-white group-hover:text-warning transition-colors">{tasksTodo}</h3>
              <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-900 px-2 py-1 rounded-full mt-2 inline-block">
                {tasksDone} concluídas
              </span>
            </div>
            <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-lg text-amber-400 group-hover:shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl hover:border-emerald-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Saldo Real (Pago)</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-rose-500'}`}>
                R$ {balance.toFixed(2)}
              </h3>
              <span className={`text-[10px] uppercase font-mono mt-2 inline-block px-1.5 py-0.5 rounded border ${pendingIncome - pendingExpense >= 0 ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' : 'text-rose-400 border-rose-500/30 bg-rose-950/20'}`}>
                PENDENTE: R$ {(pendingIncome - pendingExpense).toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-emerald-400 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl hover:border-purple-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Receita Real</p>
              <h3 className="text-2xl font-bold text-emerald-400">R$ {income.toFixed(2)}</h3>
              <span className="text-[10px] uppercase font-mono mt-2 inline-block text-amber-500 bg-amber-950/20 border border-amber-900 px-2 py-1 rounded">
                A Receber: R$ {pendingIncome.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-lg text-purple-400 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <div className="w-1 h-5 bg-cyan-500 rounded-full"></div> Resumo Financeiro
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    boxShadow: '0 0 15px rgba(0,0,0,0.5)'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full"></div> Atividade Recente
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${(t.statusPagamento === 'pendente' || t.statusPagamento === 'atrasado') ? 'bg-amber-500 shadow-amber-500/50' : t.tipo === 'receita' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200">{t.descricao}</p>
                      {t.statusPagamento === 'pendente' && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded uppercase font-bold">Pendente</span>
                      )}
                      {t.statusPagamento === 'atrasado' && (
                        <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1 rounded uppercase font-bold animate-pulse">Atrasado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{t.categoria}</span>
                      <span>•</span>
                      <span>{formatDisplayDate(t.data)}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold font-mono ${(t.statusPagamento === 'pendente' || t.statusPagamento === 'atrasado') ? 'text-amber-500' : t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                </span>
              </div>
            ))}
            {tasks.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px] shadow-cyan-500/50" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{t.titulo}</p>
                    <p className="text-xs text-slate-500">Tarefa em {t.coluna} • {formatDisplayDate(t.prazo)}</p>
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && tasks.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;