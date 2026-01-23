import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lightbulb, CheckCircle2, Wallet, TrendingUp, Activity, Package, Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { formatDisplayDate, getBrasiliaDate, getDayOfMonth, isWeekend, getCurrentMonthName } from '../lib/dateUtils';
import { AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { ideas, tasks, transactions, inventory, appointments, appMode, financialOrganizers } = useApp();
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);

  React.useEffect(() => {
    const hasSeenUpdate = localStorage.getItem('startin_clients_update_v1');
    if (!hasSeenUpdate) {
      setShowUpdateModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    localStorage.setItem('startin_clients_update_v1', 'true');
    setShowUpdateModal(false);
  };

  const today = getBrasiliaDate();
  const todayAppointments = appointments.filter(a => a.data === today);
  const pendingToday = todayAppointments.filter(a => a.status === 'pendente');

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

  // Organizer Calculations
  const currentDay = getDayOfMonth();
  const currentMonthName = getCurrentMonthName();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get days in current month to handle wraparound
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const next3Days = Array.from({ length: 4 }, (_, i) => {
    let day = currentDay + i;
    if (day > daysInMonth) day -= daysInMonth;
    return day;
  });

  const monthlyBillsTotal = financialOrganizers
    .filter(f => f.active)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const upcomingBills = financialOrganizers
    .filter(f => f.active && next3Days.includes(f.due_day))
    .map(f => {
      // If due_day is less than currentDay, it means it's for next month
      const billMonth = (f.due_day < currentDay) ? currentMonth + 1 : currentMonth;
      const dueDate = new Date(currentYear, billMonth, f.due_day);
      return {
        ...f,
        isWeekend: isWeekend(dueDate),
        isToday: f.due_day === currentDay
      };
    })
    .sort((a, b) => {
      // Sort so today is first, then by proximity
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;

      // Proximity logic for wraparound
      const distA = a.due_day >= currentDay ? a.due_day - currentDay : (daysInMonth - currentDay) + a.due_day;
      const distB = b.due_day >= currentDay ? b.due_day - currentDay : (daysInMonth - currentDay) + b.due_day;
      return distA - distB;
    });

  const chartData = [
    { name: 'Recebido', value: income, color: '#10b981' },
    { name: 'Pago', value: expense, color: '#f43f5e' },
    { name: 'Saldo Real', value: balance, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-cyan-500/30 text-center shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Activity size={40} className="text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Novo Startin Clients!</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              O ChallengerIA agora é <span className="text-cyan-400 font-bold">Startin Clients</span>.
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

      {upcomingBills.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative overflow-hidden group glass-panel bg-gradient-to-r from-rose-950/40 via-slate-900/40 to-slate-900/40 border-rose-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  Atenção: {upcomingBills.length} {upcomingBills.length === 1 ? 'conta vincendo' : 'contas vencendo'} em breve!
                  <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Total imediato: <span className="text-rose-400 font-bold font-mono">R$ {upcomingBills.reduce((acc, b) => acc + b.amount, 0).toFixed(2)}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {upcomingBills.slice(0, 3).map(bill => (
                    <span key={bill.id} className={`text-[10px] items-center flex gap-1 font-mono px-2 py-1 rounded border ${bill.isToday ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-1 ring-rose-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      {bill.title} (Dia {bill.due_day})
                      {bill.isWeekend && <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded ml-1">FDS</span>}
                    </span>
                  ))}
                  {upcomingBills.length > 3 && <span className="text-[10px] text-slate-500 self-center">...e mais {upcomingBills.length - 3}</span>}
                </div>
              </div>
            </div>

            <Link
              to="/financeiro?view=organizers"
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg border border-rose-500/20 transition-all font-medium text-sm group-hover:border-rose-500/50"
            >
              Organizador Financeiro
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
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

        <div className="glass-panel p-6 rounded-xl hover:border-rose-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Contas a Pagar ({currentMonthName})</p>
              <h3 className="text-2xl font-bold text-rose-400">R$ {monthlyBillsTotal.toFixed(2)}</h3>
              <span className="text-[10px] uppercase font-mono mt-2 inline-block text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-950/50">
                {financialOrganizers.filter(f => f.active).length} contas ativas
              </span>
            </div>
            <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg text-rose-400 group-hover:shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all">
              <CreditCard size={24} />
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