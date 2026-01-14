import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { InventoryItem } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash2, Edit2, Filter, Package, ShoppingCart, Tag, Box } from 'lucide-react';

const Inventory: React.FC = () => {
    const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const [formData, setFormData] = useState<{
        nome: string;
        descricao: string;
        quantidade: string;
        preco: string;
        categoria: string;
    }>({
        nome: '',
        descricao: '',
        quantidade: '0',
        preco: '0',
        categoria: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const itemData = {
            ...formData,
            quantidade: parseInt(formData.quantidade),
            preco: parseFloat(formData.preco)
        };

        if (editingId) {
            updateInventoryItem(editingId, itemData);
        } else {
            addInventoryItem(itemData);
        }
        resetForm();
        setIsModalOpen(false);
    };

    const handleEdit = (item: InventoryItem) => {
        setFormData({
            nome: item.nome,
            descricao: item.descricao,
            quantidade: item.quantidade.toString(),
            preco: item.preco.toString(),
            categoria: item.categoria
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            quantidade: '0',
            preco: '0',
            categoria: ''
        });
        setEditingId(null);
    };

    const categories = ['all', ...Array.from(new Set(inventory.map(i => i.categoria)))];

    const filteredInventory = inventory.filter(item =>
        filterCategory === 'all' || item.categoria === filterCategory
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Package className="text-orange-400" /> Controle de Estoque
                    </h1>
                    <p className="text-slate-400 text-sm">Gerenciamento de Produtos e Insumos</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-all shadow-[0_0_15px_rgba(234,88,12,0.4)] border border-orange-400/30"
                >
                    <Plus size={18} />
                    <span className="font-medium">Novo Item</span>
                </button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/50 gap-4 sm:gap-0">
                    <h3 className="font-semibold text-slate-200">Lista de Materiais</h3>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 w-full sm:w-auto">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="text-xs bg-transparent border-none text-slate-300 focus:ring-0 cursor-pointer outline-none w-full sm:w-auto"
                        >
                            {categories.map((cat: any) => (
                                <option key={cat} value={cat}>{cat === 'all' ? 'TODAS AS CATEGORIAS' : String(cat).toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase font-mono tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Produto / Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4 text-center">Quantidade</th>
                                <th className="px-6 py-4 text-right">Preço Unitário</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-200 text-sm uppercase tracking-tight">{item.nome}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-xs">{item.descricao}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400 lowercase">{item.categoria}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${item.quantidade <= 5
                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                            }`}>
                                            <Box size={12} /> {item.quantidade}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold font-mono tracking-wide text-orange-400">
                                        R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-slate-600 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Tem certeza que deseja excluir este item?')) {
                                                        deleteInventoryItem(item.id);
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
                    {filteredInventory.map((item) => (
                        <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-slate-800/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-slate-200 text-sm uppercase tracking-tight">{item.nome}</span>
                                    <span className="bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 self-start">{item.categoria}</span>
                                </div>
                                <div className="font-bold font-mono tracking-wide text-sm text-orange-400">
                                    R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${item.quantidade <= 5
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    }`}>
                                    <Box size={12} /> {item.quantidade} unidades
                                </div>

                                <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700/50">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-1.5 text-slate-600 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-md transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Tem certeza que deseja excluir este item?')) {
                                                deleteInventoryItem(item.id);
                                            }
                                        }}
                                        className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredInventory.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">Nenhum item encontrado no estoque.</div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingId ? "Editar Item do Estoque" : "Novo Item no Estoque"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-orange-500 mb-1 uppercase tracking-wider">Nome do Produto</label>
                        <input type="text" required value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="Ex: Câmera Sony A7III" />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-orange-500 mb-1 uppercase tracking-wider">Descrição / Notas</label>
                        <textarea value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-orange-500 outline-none resize-none h-20" placeholder="Detalhes técnicos, estado de conservação..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-orange-500 mb-1 uppercase tracking-wider">Quantidade</label>
                            <input type="number" required value={formData.quantidade} onChange={e => setFormData({ ...formData, quantidade: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-orange-500 outline-none font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-orange-500 mb-1 uppercase tracking-wider">Preço Unitário</label>
                            <input type="number" step="0.01" required value={formData.preco} onChange={e => setFormData({ ...formData, preco: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-orange-500 outline-none font-mono" placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-orange-500 mb-1 uppercase tracking-wider">Categoria</label>
                        <input type="text" required value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" placeholder="Ex: Equipamentos, Iluminação, Acessórios..." />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-slate-400 hover:text-white font-mono">CANCELAR</button>
                        <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 shadow-lg font-bold">{editingId ? "SALVAR ALTERAÇÕES" : "ADICIONAR AO ESTOQUE"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;
