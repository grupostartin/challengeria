import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SaleItem, Sale } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash2, ShoppingCart, User, Package, CreditCard, DollarSign, CheckCircle, Search, X } from 'lucide-react';

const Sales: React.FC = () => {
    const { inventory, customers, sales, addSale, deleteSale, updateSaleStatus } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cart, setCart] = useState<Omit<SaleItem, 'id' | 'sale_id'>[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
    const [searchProduct, setSearchProduct] = useState('');

    const cartTotal = cart.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantidade: item.quantidade + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                quantidade: 1,
                preco_unitario: product.preco,
                nome_produto: product.nome
            }]);
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId: string, qty: number) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, quantidade: qty } : item
        ));
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;

        addSale({
            customer_id: selectedCustomerId || undefined,
            total: cartTotal,
            status: 'concluido',
            metodo_pagamento: paymentMethod
        }, cart);

        setCart([]);
        setSelectedCustomerId('');
        setIsModalOpen(false);
    };

    const filteredProducts = inventory.filter(p =>
        p.nome.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchProduct.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <ShoppingCart className="text-pink-500" /> Ponto de Venda (PDV)
                    </h1>
                    <p className="text-slate-400 text-sm">Realize vendas e processamentos de pagamentos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-500 transition-all shadow-[0_0_15px_rgba(219,39,119,0.4)] border border-pink-400/30"
                >
                    <Plus size={18} />
                    <span className="font-medium">Nova Venda</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales History */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="font-semibold text-slate-200">Histórico de Vendas Recentes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase font-mono tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Data / ID</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {sales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-300">{new Date(sale.criadoEm).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-mono text-slate-500">#{sale.id.substring(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-200">
                                                    {customers.find(c => c.id === sale.customer_id)?.nome || 'Consumidor'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-emerald-400 font-mono">
                                                    R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                                <div className="text-[9px] text-slate-500 uppercase font-mono">{sale.metodo_pagamento}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sale.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    sale.status === 'pendente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                    }`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => deleteSale(sale.id)}
                                                    className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sales.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">Nenhuma venda registrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Stats / Store View */}
                <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950">
                        <h3 className="text-lg font-bold text-white mb-4">Métricas da Loja</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Faturamento Total</p>
                                        <p className="text-lg font-bold text-white">R$ {sales.reduce((acc, s) => acc + s.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Vendas Hoje</p>
                                        <p className="text-lg font-bold text-white">
                                            {sales.filter(s => new Date(s.criadoEm).toDateString() === new Date().toDateString()).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Venda - PDV" maxWidth="max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
                    {/* Product Selection */}
                    <div className="flex flex-col gap-4 overflow-hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar produto ou categoria..."
                                value={searchProduct}
                                onChange={(e) => setSearchProduct(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-pink-500"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-pink-500/50 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-pink-500/10 group-hover:text-pink-400 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{product.nome}</h4>
                                            <p className="text-[10px] text-slate-500 uppercase">{product.categoria} • {product.quantidade} em estoque</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">R$ {product.preco.toFixed(2)}</p>
                                        <Plus size={14} className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity inline-block ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Checkout Area */}
                    <div className="flex flex-col glass-panel border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                        <div className="p-4 border-b border-slate-800">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <ShoppingCart size={18} className="text-pink-500" /> Carrinho de Compras
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {cart.map(item => (
                                <div key={item.product_id} className="flex items-center justify-between gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">
                                    <div className="flex-1">
                                        <h5 className="text-xs font-bold text-slate-200 truncate">{item.nome_produto}</h5>
                                        <p className="text-[10px] text-slate-500">R$ {item.preco_unitario.toFixed(2)} / un</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.product_id, item.quantidade - 1)} className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-slate-400">-</button>
                                        <span className="text-xs font-bold text-white w-4 text-center">{item.quantidade}</span>
                                        <button onClick={() => updateQuantity(item.product_id, item.quantidade + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-slate-400">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.product_id)} className="text-slate-600 hover:text-rose-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                                    <ShoppingCart size={40} opacity={0.2} />
                                    <p className="text-xs">Carrinho Vazio</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-900/80 border-t border-slate-800 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex justify-between">
                                    <span>Vincular Cliente (Opcional)</span>
                                    {selectedCustomerId && <button onClick={() => setSelectedCustomerId('')} className="text-pink-500 hover:text-pink-400 text-[9px]">remover</button>}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-pink-500 transition-colors">
                                        <User size={14} />
                                    </div>
                                    <select
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-pink-500 outline-none appearance-none cursor-pointer hover:border-slate-700 transition-all"
                                    >
                                        <option value="" className="bg-slate-950">Consumidor Final (Sem cadastro)</option>
                                        {customers.length > 0 && (
                                            <optgroup label="Clientes Cadastrados" className="bg-slate-950 text-slate-500 text-[10px]">
                                                {customers.map(c => (
                                                    <option key={c.id} value={c.id} className="text-slate-200">{c.nome}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Método de Pagamento</label>
                                <div className="flex gap-2">
                                    {(['pix', 'cartao', 'dinheiro'] as const).map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${paymentMethod === method
                                                ? 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(219,39,119,0.2)]'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                                }`}
                                        >
                                            {method === 'pix' && <CheckCircle size={14} />}
                                            {method === 'cartao' && <CreditCard size={14} />}
                                            {method === 'dinheiro' && <DollarSign size={14} />}
                                            <span className="text-[9px] uppercase font-bold mt-1">{method}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-400 text-sm">Total da Venda</span>
                                    <span className="text-2xl font-black text-white font-mono">R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0}
                                    className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <CheckCircle size={20} />
                                    FINALIZAR VENDA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Sales;
