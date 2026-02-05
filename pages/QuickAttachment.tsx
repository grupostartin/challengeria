import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { FileUp, Image as ImageIcon, CheckCircle, Loader2, AlertCircle, FileText, DollarSign, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';

const QuickAttachment: React.FC = () => {
    const { contracts, transactions, customers, updateContract, updateTransaction } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [targetType, setTargetType] = useState<'contract' | 'finance' | null>(null);
    const [targetId, setTargetId] = useState<string>('');
    const [step, setStep] = useState<1 | 2>(1); // 1: Select File, 2: Select Target
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type.startsWith('image/')) {
            setFile(selected);
            setStep(2);
        } else if (selected) {
            alert('Apenas imagens são permitidas nesta aba rápida.');
        }
    };

    const handleUpload = async () => {
        if (!file || !targetType || !targetId) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `quick-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const bucket = targetType === 'contract' ? 'contracts' : 'finance';
            const folder = targetType === 'contract' ? 'proofs' : 'receipts';
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            if (targetType === 'contract') {
                await updateContract(targetId, { payment_proof_url: publicUrl });
            } else {
                await updateTransaction(targetId, { attachment_url: publicUrl });
            }

            alert('Anexo enviado com sucesso!');
            setFile(null);
            setTargetId('');
            setTargetType(null);
            setStep(1);
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao enviar anexo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 md:hidden">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <FileUp className="text-cyan-400" /> Anexo Rápido
                </h1>
                <p className="text-slate-400 text-sm italic">Capture e anexe fotos instantaneamente</p>
            </div>

            {step === 1 ? (
                <div className="space-y-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 text-slate-400 hover:border-cyan-500/50 transition-all cursor-pointer active:scale-95 shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                            <ImageIcon size={48} />
                        </div>
                        <div className="text-center">
                            <span className="text-xl font-bold text-slate-200 block mb-2">Tirar Foto</span>
                            <p className="text-sm text-slate-500">Toque para abrir a câmera ou galeria</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 flex items-center gap-4">
                        {file && (
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-xl border border-slate-600"
                            />
                        )}
                        <div className="flex-1 overflow-hidden">
                            <p className="text-slate-200 font-bold truncate">{file?.name}</p>
                            <button
                                onClick={() => setStep(1)}
                                className="text-xs text-cyan-400 font-bold mt-1"
                            >
                                TROCAR IMAGEM
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-mono text-cyan-500 uppercase tracking-widest">Onde anexo?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setTargetType('finance'); setTargetId(''); }}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${targetType === 'finance' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}
                            >
                                <DollarSign size={24} />
                                <span className="text-xs font-bold">FINANCEIRO</span>
                            </button>
                            <button
                                onClick={() => { setTargetType('contract'); setTargetId(''); }}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${targetType === 'contract' ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}
                            >
                                <FileText size={24} />
                                <span className="text-xs font-bold">CONTRATO</span>
                            </button>
                        </div>
                    </div>

                    {targetType && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <label className="block text-xs font-mono text-cyan-500 uppercase tracking-widest">
                                Selecione o {targetType === 'contract' ? 'Contrato' : 'Registro Financeiro'}
                            </label>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none"
                            >
                                <option value="">Clique para escolher...</option>
                                {targetType === 'contract' ? (
                                    contracts.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} | {customers.find(cust => cust.id === c.customer_id)?.nome || 'Cliente'}
                                        </option>
                                    ))
                                ) : (
                                    transactions
                                        .filter(t => t.tipo === 'receita')
                                        .slice(0, 30)
                                        .map(t => (
                                            <option key={t.id} value={t.id}>
                                                R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - {t.descricao}
                                            </option>
                                        ))
                                )}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!targetId || isUploading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        {isUploading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                FINALIZAR ANEXO
                            </>
                        )}
                    </button>
                </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-200/70">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-[11px] leading-relaxed">
                    Esta ferramenta é otimizada para capturas rápidas. Para arquivos PDF ou configurações avançadas, utilize as abas principais.
                </p>
            </div>
        </div>
    );
};

export default QuickAttachment;
