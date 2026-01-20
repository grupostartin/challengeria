import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { FileText, Plus, Trash2, Download, Search, FileUp, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(timestamp));
};

const Contracts: React.FC = () => {
    const { contracts, customers, addContract, updateContract, deleteContract } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [newContract, setNewContract] = useState({
        title: '',
        customer_id: '',
        file: null as File | null
    });

    const filteredContracts = contracts.filter(contract => {
        const customer = customers.find(c => c.id === contract.customer_id);
        const searchLower = searchTerm.toLowerCase();
        return (
            contract.title.toLowerCase().includes(searchLower) ||
            customer?.nome.toLowerCase().includes(searchLower)
        );
    });

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContract.file || !newContract.customer_id || !newContract.title) return;

        setIsUploading(true);
        try {
            const file = newContract.file;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `contracts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('contracts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('contracts')
                .getPublicUrl(filePath);

            await addContract({
                title: newContract.title,
                customer_id: newContract.customer_id,
                pdf_url: publicUrl
            });

            setIsModalOpen(false);
            setNewContract({ title: '', customer_id: '', file: null });
        } catch (error) {
            console.error('Error uploading contract:', error);
            alert('Erro ao fazer upload do contrato.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleProofUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile || !selectedContractId) return;

        setIsUploading(true);
        try {
            const file = proofFile;
            const fileExt = file.name.split('.').pop();
            const fileName = `proof-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `contracts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('contracts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('contracts')
                .getPublicUrl(filePath);

            await updateContract(selectedContractId, {
                payment_proof_url: publicUrl
            });

            setIsProofModalOpen(false);
            setProofFile(null);
            setSelectedContractId(null);
        } catch (error) {
            console.error('Error uploading proof:', error);
            alert('Erro ao fazer upload do comprovante.');
        } finally {
            setIsUploading(false);
        }
    };

    const getCustomerName = (id: string) => {
        return customers.find(c => c.id === id)?.nome || 'Cliente não encontrado';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Contratos</h1>
                    <p className="text-slate-400 mt-1">Gerencie os contratos e comprovantes (PDF ou Imagem) de seus clientes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Novo Contrato
                </button>
            </div>

            <div className="glass-panel p-4 flex items-center gap-3">
                <Search className="text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por título ou cliente..."
                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContracts.map((contract) => (
                    <div key={contract.id} className="glass-panel p-6 group hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                                <FileText size={24} />
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir este contrato?')) {
                                        deleteContract(contract.id);
                                    }
                                }}
                                className="text-slate-600 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{contract.title}</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <User size={14} className="text-cyan-500" />
                                <span>{getCustomerName(contract.customer_id)}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                                Criado em: {formatDate(contract.created_at)}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={contract.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 group-hover:border-cyan-500/30 text-sm"
                            >
                                <Download size={16} />
                                Documento do Contrato
                            </a>

                            {contract.payment_proof_url ? (
                                <a
                                    href={contract.payment_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 text-sm"
                                >
                                    <Download size={16} />
                                    Visualizar Comprovante
                                </a>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSelectedContractId(contract.id);
                                        setIsProofModalOpen(true);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20 text-sm"
                                >
                                    <Plus size={16} />
                                    Anexar Comprovante
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredContracts.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 border border-slate-700">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-400">Nenhum contrato encontrado</h3>
                        <p className="text-slate-600 mt-2">Comece adicionando um novo contrato para seus clientes.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-lg p-8 animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <FileUp className="text-cyan-400" />
                                Novo Contrato
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleFileUpload} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Título do Contrato</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Ex: Contrato de Prestação de Serviços"
                                    value={newContract.title}
                                    onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Cliente</label>
                                <select
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                                    value={newContract.customer_id}
                                    onChange={(e) => setNewContract({ ...newContract, customer_id: e.target.value })}
                                >
                                    <option value="">Selecionar Cliente</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>{customer.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Arquivo (PDF ou Imagem)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="application/pdf,image/jpeg,image/png,image/webp"
                                        required
                                        onChange={(e) => setNewContract({ ...newContract, file: e.target.files?.[0] || null })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg px-4 py-10 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-cyan-500/50 transition-all">
                                        <FileUp size={32} />
                                        <span>{newContract.file ? newContract.file.name : 'Clique para selecionar o arquivo'}</span>
                                        <span className="text-xs text-slate-600">PDF ou Imagens</span>
                                        <p className="text-[10px] text-slate-500 mt-2">Dica: No Android, escolha a opção "Arquivos" para PDFs.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Salvar Contrato'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isProofModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-lg p-8 animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <FileUp className="text-emerald-400" />
                                Comprovante de Pagamento
                            </h2>
                            <button onClick={() => setIsProofModalOpen(false)} className="text-slate-400 hover:text-white">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleProofUpload} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Arquivo (PDF ou Imagem)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="application/pdf,image/jpeg,image/png,image/webp"
                                        required
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg px-4 py-10 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-emerald-500/50 transition-all">
                                        <FileUp size={32} />
                                        <span>{proofFile ? proofFile.name : 'Clique para selecionar o comprovante'}</span>
                                        <span className="text-xs text-slate-600">PDF ou Imagens</span>
                                        <p className="text-[10px] text-slate-500 mt-2">Dica: No Android, escolha a opção "Arquivos" para PDFs.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsProofModalOpen(false)}
                                    className="flex-1 py-3 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Anexar Comprovante'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contracts;
