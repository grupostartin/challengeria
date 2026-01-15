import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Appointment } from '../types';
import Modal from '../components/Modal';
import {
    Plus,
    Trash2,
    Edit2,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Briefcase,
    User,
    MoreVertical,
    Filter,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getBrasiliaDate, formatDisplayDate } from '../lib/dateUtils';

const Agenda: React.FC = () => {
    const { appointments, customers, addAppointment, updateAppointment, deleteAppointment } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'servico' | 'compromisso' | 'outro'>('all');

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [formData, setFormData] = useState<{
        titulo: string;
        descricao: string;
        data: string;
        horario: string;
        tipo: 'servico' | 'compromisso' | 'outro';
        status: 'pendente' | 'concluido' | 'cancelado';
        customer_id: string;
    }>({
        titulo: '',
        descricao: '',
        data: getBrasiliaDate(),
        horario: '09:00',
        tipo: 'servico',
        status: 'pendente',
        customer_id: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateAppointment(editingId, formData);
        } else {
            addAppointment(formData);
        }
        resetForm();
        setIsModalOpen(false);
    };

    const handleEdit = (a: Appointment) => {
        setFormData({
            titulo: a.titulo,
            descricao: a.descricao,
            data: a.data,
            horario: a.horario,
            tipo: a.tipo,
            status: a.status,
            customer_id: a.customer_id || ''
        });
        setEditingId(a.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            titulo: '',
            descricao: '',
            data: getBrasiliaDate(),
            horario: '09:00',
            tipo: 'servico',
            status: 'pendente',
            customer_id: ''
        });
        setEditingId(null);
    };

    const filteredAppointments = appointments
        .filter(a => filterType === 'all' || a.tipo === filterType)
        .filter(a => !selectedDate || a.data === selectedDate)
        .sort((a, b) => {
            if (a.data !== b.data) return a.data.localeCompare(b.data);
            return a.horario.localeCompare(b.horario);
        });

    // Calendar Helpers
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];
        // Padding for first week
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasAppointments = appointments.some(a => a.data === dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === getBrasiliaDate();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all relative
            ${isSelected ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-110 z-10' :
                            isToday ? 'bg-white/10 text-cyan-400 border border-cyan-500/30' :
                                'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
                >
                    {day}
                    {hasAppointments && !isSelected && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full"></div>
                    )}
                </button>
            );
        }
        return days;
    };

    // Group by date
    const groupedAppointments: { [key: string]: Appointment[] } = {};
    filteredAppointments.forEach(a => {
        if (!groupedAppointments[a.data]) {
            groupedAppointments[a.data] = [];
        }
        groupedAppointments[a.data].push(a);
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendente': return <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono tracking-tighter uppercase"><AlertCircle size={10} /> Pendente</span>;
            case 'cancelado': return <span className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 font-mono tracking-tighter uppercase"><XCircle size={10} /> Cancelado</span>;
            case 'concluido': return <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono tracking-tighter uppercase"><CheckCircle size={10} /> Concluído</span>;
            default: return null;
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'servico': return <Briefcase className="text-cyan-400" size={16} />;
            case 'compromisso': return <CalendarIcon className="text-purple-400" size={16} />;
            default: return <MoreVertical className="text-slate-400" size={16} />;
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CalendarIcon className="text-cyan-400" /> Agenda & Compromissos
                    </h1>
                    <p className="text-slate-400 text-sm">Organize seus serviços e horários com precisão</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/30"
                >
                    <Plus size={18} />
                    <span className="font-medium">Novo Agendamento</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar Calendar */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <div className="flex gap-1">
                                <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                                <div key={d} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendar()}
                        </div>

                        {selectedDate && (
                            <button
                                type="button"
                                onClick={() => setSelectedDate(null)}
                                className="w-full mt-6 py-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 bg-cyan-500/5 rounded-lg transition-all uppercase tracking-widest"
                            >
                                Limpar Filtro por Data
                            </button>
                        )}
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Filter size={12} /> Filtros Rápidos
                        </h4>
                        <div className="flex flex-col gap-2">
                            {['all', 'servico', 'compromisso', 'outro'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFilterType(type as any)}
                                    className={`w-full px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex justify-between items-center ${filterType === type
                                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-inner'
                                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <span>{type === 'all' ? 'TODOS' : type}</span>
                                    <div className={`h-1.5 w-1.5 rounded-full ${type === 'servico' ? 'bg-cyan-500' : type === 'compromisso' ? 'bg-purple-500' : type === 'outro' ? 'bg-slate-500' : 'bg-transparent'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main List */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {selectedDate && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl flex items-center justify-between">
                            <p className="text-xs text-cyan-400 font-medium">
                                Exibindo apenas compromissos para <span className="font-bold">{formatDisplayDate(selectedDate)}</span>
                            </p>
                            <button type="button" onClick={() => setSelectedDate(null)} className="text-cyan-400 hover:text-cyan-200">
                                <XCircle size={16} />
                            </button>
                        </div>
                    )}

                    <div className="space-y-8">
                        {Object.keys(groupedAppointments).length === 0 ? (
                            <div className="glass-panel p-20 text-center rounded-3xl border border-slate-800 bg-slate-900/30">
                                <CalendarIcon className="mx-auto text-slate-800 mb-4" size={64} />
                                <h3 className="text-slate-400 font-medium text-lg">Sem agendamentos no período</h3>
                                <p className="text-slate-600 text-sm mt-1">Selecione outra data no calendário ou mude o filtro.</p>
                            </div>
                        ) : (
                            Object.keys(groupedAppointments).sort().map(date => (
                                <div key={date} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-800/50 h-px flex-1"></div>
                                        <div className="bg-slate-900 border border-slate-700 px-5 py-2 rounded-full shadow-lg">
                                            <span className="text-xs font-bold text-slate-200 font-mono tracking-tight">
                                                {date === getBrasiliaDate() ? '📅 HOJE' : formatDisplayDate(date)}
                                            </span>
                                        </div>
                                        <div className="bg-slate-800/50 h-px flex-1"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                                        {groupedAppointments[date].map(a => (
                                            <div key={a.id} className="glass-panel p-5 rounded-2xl border border-slate-800/50 hover:border-cyan-500/40 transition-all group relative overflow-hidden bg-slate-900/40 backdrop-blur-md">
                                                {/* Background indicator for type */}
                                                <div className={`absolute top-0 left-0 w-1 h-full ${a.tipo === 'servico' ? 'bg-cyan-500' : a.tipo === 'compromisso' ? 'bg-purple-500' : 'bg-slate-500'
                                                    }`}></div>

                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {getTipoIcon(a.tipo)}
                                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{a.tipo}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button type="button" onClick={() => handleEdit(a)} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button type="button" onClick={() => { if (window.confirm('Excluir agendamento?')) deleteAppointment(a.id); }} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight leading-tight">
                                                            {a.titulo}
                                                        </h3>
                                                        {a.descricao && (
                                                            <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{a.descricao}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/50">
                                                        <div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono bg-slate-950/50 px-2 py-1 rounded">
                                                            <Clock size={12} className="text-cyan-400" />
                                                            {a.horario}
                                                        </div>
                                                        {getStatusBadge(a.status)}
                                                    </div>

                                                    {a.customer_id && (
                                                        <div className="flex items-center gap-2 pt-2">
                                                            <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                                                                <User size={10} className="text-cyan-400" />
                                                            </div>
                                                            <span className="text-[10px] text-cyan-200 font-medium">
                                                                {customers.find(c => c.id === a.customer_id)?.nome || 'Cliente'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingId ? "Editar Agendamento" : "Novo Agendamento"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        {['servico', 'compromisso', 'outro'].map((t) => (
                            <label key={t} className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    value={t}
                                    checked={formData.tipo === t}
                                    onChange={() => setFormData({ ...formData, tipo: t as any })}
                                    className="peer sr-only"
                                />
                                <div className={`text-center py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 transition-all font-mono text-[10px] uppercase tracking-wider
                  ${t === 'servico' ? 'peer-checked:bg-cyan-950/30 peer-checked:border-cyan-500 peer-checked:text-cyan-400' : ''}
                  ${t === 'compromisso' ? 'peer-checked:bg-purple-950/30 peer-checked:border-purple-500 peer-checked:text-purple-400' : ''}
                  ${t === 'outro' ? 'peer-checked:bg-slate-800 peer-checked:border-slate-500 peer-checked:text-slate-300' : ''}
                `}>
                                    {t}
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Data</label>
                            <input
                                type="date"
                                required
                                value={formData.data}
                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Horário</label>
                            <input
                                type="time"
                                required
                                value={formData.horario}
                                onChange={e => setFormData({ ...formData, horario: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-purple-500 mb-1 uppercase tracking-wider">Status</label>
                        <div className="flex gap-2">
                            {['pendente', 'concluido', 'cancelado'].map((s) => (
                                <label key={s} className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        value={s}
                                        checked={formData.status === s}
                                        onChange={() => setFormData({ ...formData, status: s as any })}
                                        className="peer sr-only"
                                    />
                                    <div className={`text-center py-1.5 rounded-md border border-slate-800 bg-slate-900/50 text-slate-500 text-[9px] font-bold uppercase tracking-widest transition-all
                    ${s === 'pendente' ? 'peer-checked:bg-amber-500/10 peer-checked:border-amber-500/40 peer-checked:text-amber-400' : ''}
                    ${s === 'concluido' ? 'peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/40 peer-checked:text-emerald-400' : ''}
                    ${s === 'cancelado' ? 'peer-checked:bg-rose-500/10 peer-checked:border-rose-500/40 peer-checked:text-rose-400' : ''}
                  `}>
                                        {s}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Cliente Vinculado</label>
                        <select
                            value={formData.customer_id}
                            onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                        >
                            <option value="">Sem cliente (Geral)</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Título / Assunto</label>
                        <input
                            type="text"
                            required
                            value={formData.titulo}
                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                            placeholder="Ex: Instalação de Ar Condicionado"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Notas Adicionais</label>
                        <textarea
                            rows={3}
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                            placeholder="Detalhes sobre o serviço ou local..."
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-slate-400 hover:text-white font-mono text-xs uppercase">CANCELAR</button>
                        <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg font-bold text-sm uppercase tracking-wide">
                            {editingId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR AGENDAMENTO"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agenda;
