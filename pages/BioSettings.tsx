import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { BioLink, BioConfig } from '../types';
import { cn } from '../lib/utils';
import {
    Layout as LayoutIcon,
    Link as LinkIcon,
    Palette,
    Save,
    Plus,
    Trash2,
    ExternalLink,
    User,
    Image as ImageIcon,
    Copy,
    CheckCircle,
    Send,
    Upload,
    Loader2,
    Crop
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { supabase } from '../lib/supabase';
import { getCroppedImg } from '../lib/imageUtils';

const BioSettings: React.FC = () => {
    const { bioConfig, updateBioConfig } = useApp();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    // Crop State
    const [cropModal, setCropModal] = useState<{
        open: boolean;
        image: string;
        aspect: number;
        onComplete: (blob: Blob) => void;
    }>({ open: false, image: '', aspect: 1, onComplete: () => { } });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const [formData, setFormData] = useState<Partial<BioConfig>>({
        username: '',
        title: '',
        description: '',
        avatar_url: '',
        background_color: '#0f172a',
        button_color: '#06b6d4',
        button_text_color: '#ffffff',
        text_color: '#ffffff',
        background_image_url: '',
        links: []
    });

    useEffect(() => {
        if (bioConfig) {
            setFormData(bioConfig);
        }
    }, [bioConfig]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateBioConfig(formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar configurações.');
        } finally {
            setLoading(false);
        }
    };

    const addLink = () => {
        const links = [...(formData.links || []), { label: 'Novo Link', url: 'https://' }];
        setFormData({ ...formData, links });
    };

    const updateLink = (index: number, field: keyof BioLink, value: string) => {
        const links = [...(formData.links || [])];
        links[index] = { ...links[index], [field]: value };
        setFormData({ ...formData, links });
    };

    const removeLink = (index: number) => {
        const links = [...(formData.links || [])].filter((_, i) => i !== index);
        setFormData({ ...formData, links });
    };

    const copyUrl = () => {
        const url = `${window.location.origin}/#/bio/${formData.username}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onCropComplete = (croppedArea: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    };

    const handleApplyCrop = async () => {
        if (!croppedAreaPixels || !cropModal.image) return;

        try {
            setUploading(true);
            const croppedBlob = await getCroppedImg(cropModal.image, croppedAreaPixels);
            if (croppedBlob) {
                cropModal.onComplete(croppedBlob);
            }
            setCropModal({ ...cropModal, open: false });
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                open: true,
                image: reader.result as string,
                aspect: 1,
                onComplete: async (blob: Blob) => {
                    const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
                    const filePath = `avatars/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('bios')
                        .upload(filePath, blob);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('bios')
                        .getPublicUrl(filePath);

                    setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
                }
            });
        };
        reader.readAsDataURL(file);
    };

    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                open: true,
                image: reader.result as string,
                aspect: 9 / 16,
                onComplete: async (blob: Blob) => {
                    const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
                    const filePath = `backgrounds/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('bios')
                        .upload(filePath, blob);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('bios')
                        .getPublicUrl(filePath);

                    setFormData(prev => ({ ...prev, background_image_url: publicUrl }));
                }
            });
        };
        reader.readAsDataURL(file);
    };

    const handleLinkImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                open: true,
                image: reader.result as string,
                aspect: 3.5 / 1, // Aspecto retangular para botões
                onComplete: async (blob: Blob) => {
                    const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
                    const filePath = `link-images/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('bios')
                        .upload(filePath, blob);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('bios')
                        .getPublicUrl(filePath);

                    updateLink(index, 'image_url', publicUrl);
                }
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <LayoutIcon className="text-cyan-400" /> Página Bio
                    </h1>
                    <p className="text-slate-400 text-sm">Configure sua página de links personalizada</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {bioConfig && (
                        <button
                            onClick={copyUrl}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all border border-slate-700"
                        >
                            {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            <span className="font-medium text-sm">{copied ? 'Copiado!' : 'URL'}</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
                    >
                        {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                        <span className="font-bold">{loading ? '...' : saved ? 'Salvo!' : 'Salvar'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Editor Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* General Section */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                            <User size={18} className="text-cyan-400" /> Identidade Visual
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">URL Amigável (Username)</label>
                                <div className="flex items-center">
                                    <span className="bg-slate-900 border border-r-0 border-slate-700 rounded-l-lg px-3 py-2 text-slate-500 text-sm">bio/</span>
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-r-lg text-white outline-none focus:border-cyan-500 transition-all"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                                        placeholder="seu-nome"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Título da Página</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500 transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Seu Nome | Especialista"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Mini Biografia / Descrição</label>
                            <textarea
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500 transition-all resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Uma breve descrição sobre você ou seu negócio..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1 uppercase tracking-wider">Foto de Perfil / Avatar</label>
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0 shadow-inner">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-700"><ImageIcon size={24} /></div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all font-bold text-sm disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        {uploading ? 'Enviando...' : 'Fazer Upload de Foto'}
                                    </button>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">PNG, JPG ou GIF (Recomendado 400x400px)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Styling Section */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                            <Palette size={18} className="text-cyan-400" /> Cores e Estilo
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Fundo</label>
                                <input
                                    type="color"
                                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                                    value={formData.background_color}
                                    onChange={e => setFormData({ ...formData, background_color: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Botão</label>
                                <input
                                    type="color"
                                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                                    value={formData.button_color}
                                    onChange={e => setFormData({ ...formData, button_color: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Texto Botão</label>
                                <input
                                    type="color"
                                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                                    value={formData.button_text_color}
                                    onChange={e => setFormData({ ...formData, button_text_color: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Texto Geral</label>
                                <input
                                    type="color"
                                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                                    value={formData.text_color}
                                    onChange={e => setFormData({ ...formData, text_color: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-wider">Imagem de Fundo da Página (Opcional)</label>
                            <div className="flex gap-4 items-center">
                                <div className="w-20 h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0 shadow-inner relative group">
                                    {formData.background_image_url ? (
                                        <>
                                            <img src={formData.background_image_url} className="w-full h-full object-cover" alt="BG Preview" />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, background_image_url: '' }))}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-700"><ImageIcon size={24} /></div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={bgInputRef}
                                        onChange={handleBgUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => bgInputRef.current?.click()}
                                        disabled={uploading}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all font-bold text-sm disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        {uploading ? 'Enviando...' : 'Fazer Upload de Fundo'}
                                    </button>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Otimizado para mobile (Retrato). Proporção 9:16 recomendada.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <LinkIcon size={18} className="text-cyan-400" /> Links Úteis
                            </h3>
                            <button
                                onClick={addLink}
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all"
                            >
                                <Plus size={14} /> ADICIONAR LINK
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.links?.map((link, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 animate-in slide-in-from-left-2 duration-300 space-y-4">
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm text-white font-bold outline-none focus:border-cyan-500"
                                                value={link.label}
                                                onChange={e => updateLink(idx, 'label', e.target.value)}
                                                placeholder="Rótulo do Link"
                                            />
                                            <input
                                                type="text"
                                                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-400 outline-none focus:border-cyan-500"
                                                value={link.url}
                                                onChange={e => updateLink(idx, 'url', e.target.value)}
                                                placeholder="URL (https://...)"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeLink(idx)}
                                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex gap-4 items-center bg-black/30 p-3 rounded-xl border border-white/5">
                                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                                            {link.image_url ? (
                                                <img src={link.image_url} className="w-full h-full object-cover" alt="Button Background" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={16} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id={`link-image-${idx}`}
                                                onChange={(e) => handleLinkImageUpload(idx, e)}
                                            />
                                            <label
                                                htmlFor={`link-image-${idx}`}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all font-bold text-[10px] cursor-pointer"
                                            >
                                                <Upload size={12} />
                                                {link.image_url ? 'TROCAR IMAGEM DE FUNDO' : 'ADD IMAGEM DE FUNDO'}
                                            </label>
                                        </div>
                                        {link.image_url && (
                                            <button
                                                onClick={() => updateLink(idx, 'image_url', '')}
                                                className="text-[10px] text-rose-500 font-bold hover:underline"
                                            >
                                                REMOVER
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!formData.links || formData.links.length === 0) && (
                                <p className="text-center text-sm text-slate-600 py-4 italic">Nenhum link adicionado ainda.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Preview Column */}
                <div className="lg:col-span-4">
                    <div className="sticky top-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Pré-visualização Mobile</h3>
                        <div className="relative mx-auto border-[8px] border-slate-900 rounded-[3rem] h-[600px] w-full max-w-[280px] overflow-hidden shadow-2xl bg-black">
                            <div className="absolute top-0 w-full h-6 bg-slate-900 flex items-center justify-center">
                                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                            </div>

                            <div className="h-full w-full overflow-y-auto pt-8 pb-4 scrollbar-hide relative" style={{ backgroundColor: formData.background_color }}>
                                {formData.background_image_url && (
                                    <>
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${formData.background_image_url})` }}
                                        />
                                        <div
                                            className="absolute inset-0 backdrop-blur-[1px]"
                                            style={{ backgroundColor: `${formData.background_color}cc` }}
                                        />
                                    </>
                                )}
                                <div className="p-4 flex flex-col items-center relative z-10">
                                    {formData.avatar_url && (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-2 mb-3 shadow-md" style={{ borderColor: formData.button_color }} />
                                    )}
                                    <h4 className="text-sm font-bold text-center mb-1" style={{ color: formData.text_color }}>{formData.title || 'Seu Título'}</h4>
                                    <p className="text-[9px] text-center opacity-70 mb-5 leading-tight" style={{ color: formData.text_color }}>{formData.description || 'Sua descrição aparecerá aqui'}</p>

                                    <div className="w-full space-y-3 mb-6">
                                        {formData.links?.map((link, i) => (
                                            <div
                                                key={i}
                                                className="relative w-full overflow-hidden rounded-xl h-14 flex items-center justify-center shadow-lg border border-white/10"
                                                style={{ backgroundColor: formData.button_color }}
                                            >
                                                {link.image_url && (
                                                    <>
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center"
                                                            style={{ backgroundImage: `url(${link.image_url})` }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40" />
                                                    </>
                                                )}
                                                <div className="relative z-10 text-[10px] font-bold text-center drop-shadow-md" style={{ color: formData.button_text_color }}>
                                                    {link.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-800 rounded-full"></div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <a
                                href={`${window.location.origin}/#/bio/${formData.username}`}
                                target="_blank"
                                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 group"
                            >
                                Ver Página em Nova Aba <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Recorte */}
            {cropModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Crop className="text-cyan-400" /> Recortar Imagem
                            </h3>
                            <button
                                onClick={() => setCropModal({ ...cropModal, open: false })}
                                className="text-slate-400 hover:text-white"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>

                        <div className="relative h-[400px] bg-black">
                            <Cropper
                                image={cropModal.image}
                                crop={crop}
                                zoom={zoom}
                                aspect={cropModal.aspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">Zoom</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            <button
                                onClick={handleApplyCrop}
                                disabled={uploading}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                {uploading ? 'Processando...' : 'Aplicar Recorte e Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BioSettings;
