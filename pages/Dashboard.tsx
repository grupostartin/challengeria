import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lightbulb, CheckCircle2, Wallet, TrendingUp, Activity, Package, Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { formatDisplayDate, getBrasiliaDate, getDayOfMonth, isWeekend, getCurrentMonthName } from '../lib/dateUtils';
import { AlertCircle, CreditCard, ExternalLink, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

import { FinancialOrganizer } from '../types';

const Dashboard: React.FC = () => {
  const { tasks, transactions, inventory, appointments, appMode, financialOrganizers } = useApp();
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);

  React.useEffect(() => {
    const hasSeenUpdate = localStorage.getItem('upstartin_update_v1');
    if (!hasSeenUpdate) {
      setShowUpdateModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    localStorage.setItem('upstartin_update_v1', 'true');
    setShowUpdateModal(false);
  };

  const today = getBrasiliaDate();
  const todayAppointments = appointments.filter(a => a.data === today);
  const pendingToday = todayAppointments.filter(a => a.status === 'pendente');

  // Stats Calculation


  const tasksTodo = tasks.filter(t => t.coluna === 'todo').length;
  const tasksDone = tasks.filter(t => t.coluna === 'done').length;

  const income = transactions
    .filter(t => t.tipo === 'receita')
    .reduce((acc, curr) => {
      if (curr.statusPagamento === 'pago' || !curr.statusPagamento) return acc + curr.valor;
      if (curr.statusPagamento === 'parcial') return acc + (curr.valor_pago || 0);
      return acc;
    }, 0);

  const pendingIncome = transactions
    .filter(t => t.tipo === 'receita')
    .reduce((acc, curr) => {
      if (curr.statusPagamento === 'pendente' || curr.statusPagamento === 'atrasado') return acc + curr.valor;
      if (curr.statusPagamento === 'parcial') return acc + (curr.valor - (curr.valor_pago || 0));
      return acc;
    }, 0);

  const expense = transactions
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, curr) => {
      if (curr.statusPagamento === 'pago' || !curr.statusPagamento) return acc + curr.valor;
      if (curr.statusPagamento === 'parcial') return acc + (curr.valor_pago || 0);
      return acc;
    }, 0);

  const pendingExpense = transactions
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, curr) => {
      if (curr.statusPagamento === 'pendente' || curr.statusPagamento === 'atrasado') return acc + curr.valor;
      if (curr.statusPagamento === 'parcial') return acc + (curr.valor - (curr.valor_pago || 0));
      return acc;
    }, 0);

  const balance = income - expense;

  // Organizer Calculations
  const currentDay = getDayOfMonth();
  const currentMonthName = getCurrentMonthName();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get days in current month to handle wraparound
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const targetDays = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() + i);
    return {
      date: d,
      dayOfMonth: d.getDate(),
      dayOfWeek: d.getDay() === 0 ? 7 : d.getDay()
    };
  });

  const getFullMonthImpact = (item: FinancialOrganizer) => {
    if (item.frequency === 'weekly') {
      let count = 0;
      const d = new Date(currentYear, currentMonth, 1);
      while (d.getMonth() === currentMonth) {
        const dow = d.getDay() === 0 ? 7 : d.getDay();
        if (dow === item.due_day) count++;
        d.setDate(d.getDate() + 1);
      }
      return item.amount * count;
    }
    return item.amount;
  };

  const monthlyBillsTotal = financialOrganizers
    .filter(f => f.active && f.type !== 'recebimento')
    .reduce((acc, curr) => acc + getFullMonthImpact(curr), 0);

  const monthlyIncomeTotal = financialOrganizers
    .filter(f => f.active && f.type === 'recebimento')
    .reduce((acc, curr) => acc + getFullMonthImpact(curr), 0);

  // Track which recurrences have been paid this month
  const paidRecurrenceIds = transactions
    .filter(t => {
      if (!t.recurrence_id) return false;
      const tDate = new Date(t.data);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    })
    .map(t => t.recurrence_id);

  const overdueBills = financialOrganizers
    .filter(f => f.active && f.type !== 'recebimento' && !paidRecurrenceIds.includes(f.id))
    .filter(f => {
      if (f.frequency === 'weekly') return false; // For now, focus on monthly for overdue
      return f.due_day < currentDay;
    })
    .map(f => ({
      ...f,
      isOverdue: true,
      displayDay: `Dia ${f.due_day}`
    }));

  const upcomingBills = financialOrganizers
    .filter(f => f.active && f.type !== 'recebimento' && !paidRecurrenceIds.includes(f.id))
    .flatMap(f => {
      const matches = targetDays.filter(td => f.frequency === 'weekly' ? td.dayOfWeek === f.due_day : td.dayOfMonth === f.due_day);
      return matches.map(td => ({
        ...f,
        isWeekend: isWeekend(td.date),
        isToday: td.dayOfMonth === currentDay && td.date.getMonth() === currentMonth,
        displayDay: f.frequency === 'weekly'
          ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][f.due_day - 1]
          : `Dia ${f.due_day}`,
        sortDate: td.date
      }));
    })
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

  const upcomingIncome = financialOrganizers
    .filter(f => f.active && f.type === 'recebimento' && !paidRecurrenceIds.includes(f.id))
    .flatMap(f => {
      const matches = targetDays.filter(td => f.frequency === 'weekly' ? td.dayOfWeek === f.due_day : td.dayOfMonth === f.due_day);
      return matches.map(td => ({
        ...f,
        isWeekend: isWeekend(td.date),
        isToday: td.dayOfMonth === currentDay && td.date.getMonth() === currentMonth,
        displayDay: f.frequency === 'weekly'
          ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][f.due_day - 1]
          : `Dia ${f.due_day}`,
        sortDate: td.date
      }));
    })
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

  const chartData = [
    { name: 'Recebido', value: income, color: '#10b981' },
    { name: 'Pago', value: expense, color: '#f43f5e' },
    { name: 'Saldo Real', value: balance, color: '#06b6d4' },
  ];

  const { profile } = useAuth();
  const { isTrial, daysRemaining, isPremium } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Trial Warning */}
      {isTrial && !isPremium && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative overflow-hidden glass-panel bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-slate-900/40 border-cyan-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white">
                  Período de Teste Ativo
                </h4>
                <p className="text-xs text-slate-400">
                  Você tem <span className="text-cyan-400 font-bold">{daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</span> de acesso total gratuito.
                </p>
              </div>
            </div>
            <Link
              to="/assinatura"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20"
            >
              ASSINAR PREMIUM
            </Link>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-cyan-500/30 text-center shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Activity size={40} className="text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Conheça o <img src="/logo.png" alt="UPStartin" className="h-10 w-auto" />
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              O StartinClients agora é <img src="/logo.png" alt="UPStartin" className="h-4 w-auto inline-block mx-1" />.
              Atualizamos o ícone e a marca para uma experiência ainda mais premium.
              <br /><br />
              <span className="text-xs font-mono text-slate-500 uppercase">Por favor, atualize ou reinstale seu Web App para ver as novas mudanças.</span>
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-cyan-500" /> Visão Geral
          </h1>
          <p className="text-sm text-slate-400">Status do sistema e métricas principais</p>
        </div>
      </div>

      {(upcomingBills.length > 0 || overdueBills.length > 0) && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative overflow-hidden group glass-panel bg-gradient-to-r from-rose-950/40 via-slate-900/40 to-slate-900/40 border-rose-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  {overdueBills.length > 0 ? (
                    <>Atenção: {overdueBills.length} {overdueBills.length === 1 ? 'conta atrasada' : 'contas atrasadas'}!</>
                  ) : (
                    <>Atenção: {upcomingBills.length} {upcomingBills.length === 1 ? 'conta vincendo' : 'contas vencendo'} em breve!</>
                  )}
                  <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Total imediato: <span className="text-rose-400 font-bold font-mono">R$ {(upcomingBills.reduce((acc, b) => acc + b.amount, 0) + overdueBills.reduce((acc, b) => acc + b.amount, 0)).toFixed(2)}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {overdueBills.map((bill, idx) => (
                    <span key={`overdue-${bill.id}-${idx}`} className="text-[10px] items-center flex gap-1 font-mono px-2 py-1 rounded border bg-rose-600/20 border-rose-500 text-rose-400 font-bold">
                      {bill.title} (ATRASADO)
                    </span>
                  ))}
                  {upcomingBills.slice(0, 3).map((bill, idx) => (
                    <span key={`${bill.id}-${idx}`} className={`text-[10px] items-center flex gap-1 font-mono px-2 py-1 rounded border ${bill.isToday ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-1 ring-rose-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      {bill.title} ({bill.displayDay})
                      {bill.isWeekend && <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded ml-1">FDS</span>}
                    </span>
                  ))}
                  {upcomingBills.length > 3 && <span className="text-[10px] text-slate-500 self-center">...e mais {upcomingBills.length - 3}</span>}
                </div>
              </div>
            </div>

            <Link
              to="/financeiro?view=recurrences"
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg border border-rose-500/20 transition-all font-medium text-sm group-hover:border-rose-500/50"
            >
              Recorrências Financeiras
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {upcomingIncome.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative overflow-hidden group glass-panel bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-slate-900/40 border-emerald-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  Ótima notícia: {upcomingIncome.length} {upcomingIncome.length === 1 ? 'recebimento previsto' : 'recebimentos previstos'} em breve!
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Valor a receber: <span className="text-emerald-400 font-bold font-mono">R$ {upcomingIncome.reduce((acc, b) => acc + b.amount, 0).toFixed(2)}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {upcomingIncome.slice(0, 3).map((item, idx) => (
                    <span key={`${item.id}-${idx}`} className={`text-[10px] items-center flex gap-1 font-mono px-2 py-1 rounded border ${item.isToday ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      {item.title} ({item.displayDay})
                      {item.isWeekend && <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded ml-1">FDS</span>}
                    </span>
                  ))}
                  {upcomingIncome.length > 3 && <span className="text-[10px] text-slate-500 self-center">...e mais {upcomingIncome.length - 3}</span>}
                </div>
              </div>
            </div>

            <Link
              to="/financeiro?view=recurrences"
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 transition-all font-medium text-sm group-hover:border-emerald-500/50"
            >
              Ver Recebimentos
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {todayAppointments.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative overflow-hidden group glass-panel bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-slate-900/40 border-cyan-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className={`absolute top-0 left-0 w-1 h-full ${pendingToday.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${pendingToday.length > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'} border shadow-inner`}>
                <CalendarIcon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  Você tem {todayAppointments.length} {todayAppointments.length === 1 ? 'compromisso' : 'compromissos'} hoje
                  {pendingToday.length > 0 && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pendingToday.length > 0
                    ? `Próximo evento pendente: ${pendingToday[0].horario} - ${pendingToday[0].titulo}`
                    : 'Todos os compromissos de hoje foram concluídos!'}
                </p>
              </div>
            </div>

            <Link
              to="/agenda"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all font-medium text-sm group-hover:border-cyan-500/50"
            >
              Ver Agenda
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


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

        <div className="glass-panel p-6 rounded-xl hover:border-rose-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Contas a Pagar ({currentMonthName})</p>
              <h3 className="text-2xl font-bold text-rose-400">R$ {monthlyBillsTotal.toFixed(2)}</h3>
              <span className="text-[10px] uppercase font-mono mt-2 inline-block text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-950/50">
                {financialOrganizers.filter(f => f.active && f.type !== 'recebimento').length} contas ativas
              </span>
            </div>
            <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg text-rose-400 group-hover:shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl hover:border-emerald-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Recorrências a Receber</p>
              <h3 className="text-2xl font-bold text-emerald-400">R$ {monthlyIncomeTotal.toFixed(2)}</h3>
              <span className="text-[10px] uppercase font-mono mt-2 inline-block text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-950/50">
                {financialOrganizers.filter(f => f.active && f.type === 'recebimento').length} recebimentos ativos
              </span>
            </div>
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-emerald-400 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all">
              <ArrowUpCircle size={24} />
            </div>
          </div>
        </div>

        {appMode === 'store' && (
          <div className="glass-panel p-6 rounded-xl hover:border-orange-500/30 transition-all group lg:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Itens em Estoque</p>
                <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {inventory.length} <span className="text-xs text-slate-500 font-normal">tipos</span>
                </h3>
                <span className="text-xs text-orange-300 bg-orange-950/50 border border-orange-900 px-2 py-1 rounded-full mt-2 inline-block">
                  {inventory.reduce((acc, curr) => acc + curr.quantidade, 0)} unidades totais
                </span>
              </div>
              <div className="p-3 bg-orange-950/30 border border-orange-500/20 rounded-lg text-orange-400 group-hover:shadow-[0_0_10px_rgba(234,88,12,0.3)] transition-all">
                <Package size={24} />
              </div>
            </div>
          </div>
        )}
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
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${(t.statusPagamento === 'pendente' || t.statusPagamento === 'atrasado')
                    ? 'bg-amber-500 shadow-amber-500/50'
                    : t.statusPagamento === 'parcial'
                      ? 'bg-blue-500 shadow-blue-500/50'
                      : t.tipo === 'receita' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'
                    }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200">{t.descricao.startsWith('VENDA_ID:') ? `Venda #${t.descricao.split(':')[1].substring(0, 8)}` : t.descricao}</p>
                      {t.statusPagamento === 'pendente' && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded uppercase font-bold">Pendente</span>
                      )}
                      {t.statusPagamento === 'atrasado' && (
                        <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1 rounded uppercase font-bold animate-pulse">Atrasado</span>
                      )}
                      {t.statusPagamento === 'parcial' && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 rounded uppercase font-bold">Parcial</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{t.categoria}</span>
                      <span>•</span>
                      <span>{formatDisplayDate(t.data)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${(t.statusPagamento === 'pendente' || t.statusPagamento === 'atrasado')
                    ? 'text-amber-500'
                    : t.statusPagamento === 'parcial'
                      ? 'text-blue-400'
                      : t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {t.statusPagamento === 'parcial' && t.valor_pago != null && (
                    <div className="text-[9px] text-slate-400 font-mono">
                      Pago: R$ {t.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
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