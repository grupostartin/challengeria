import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

const Subscription: React.FC = () => {
    const { profile, isPremium, isTrial, daysRemaining, loading } = useSubscription();
    const { user } = useAuth();
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [manageLoading, setManageLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setCheckoutLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('checkout', {
                body: {
                    priceId: 'price_1Sv8sKL51QoDK0cOzyK3MetS',
                    userId: user.id
                }
            });

            if (data?.url) {
                window.location.href = data.url;
            } else {
                alert('Erro ao iniciar checkout.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao iniciar checkout.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setManageLoading(true);
        try {
            // In a real implementation, we would call a function to get the Stripe Portal URL
            // For now, we can just show a message or link to Stripe if we had a function for that.
            // Or we can implement a 'portal' function.
            // Let's assume we don't have it yet and just alert.
            alert('Gerenciamento de assinatura via portal ainda não implementado. Entre em contato com o suporte.');
        } catch (err) {
            console.error(err);
        } finally {
            setManageLoading(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-white">Carregando informações da assinatura...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Minha Assinatura</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Plan Card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="text-cyan-400" />
                        Plano Atual
                    </h2>

                    <div className="mb-6">
                        {isPremium ? (
                            <div className="inline-block px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white font-bold text-sm">
                                PREMIUM
                            </div>
                        ) : (
                            <div className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full font-bold text-sm">
                                {isTrial ? 'PERÍODO DE TESTE' : 'EXPIRADO'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-slate-300">
                            <span>Status:</span>
                            <span className={isPremium ? "text-emerald-400 font-medium" : "text-slate-200"}>
                                {profile?.subscription_status === 'active' ? 'Ativo' :
                                    profile?.subscription_status === 'trialing' ? 'Em teste' :
                                        'Inativo'}
                            </span>
                        </div>
                        {isTrial && (
                            <div className="flex items-center justify-between text-slate-300">
                                <span>Dias restantes:</span>
                                <span className={daysRemaining < 3 ? "text-red-400 font-bold" : "text-white"}>
                                    {daysRemaining} dias
                                </span>
                            </div>
                        )}
                        {!isPremium && isTrial && (
                            <div className="flex items-center justify-between text-slate-300">
                                <span>Expira em:</span>
                                <span className="text-white">
                                    {profile?.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isPremium ? (
                        <button
                            onClick={handleUpgrade}
                            disabled={checkoutLoading}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                        >
                            {checkoutLoading ? 'Processando...' : 'Fazer Upgrade para Premium'}
                        </button>
                    ) : (
                        <button
                            onClick={handleManageSubscription}
                            disabled={manageLoading}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10"
                        >
                            Gerenciar Assinatura
                        </button>
                    )}
                </div>

                {/* Benefits Card */}
                {!isPremium && (
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/10 to-purple-900/10">
                        <h2 className="text-xl font-bold text-white mb-4">Por que ser Premium?</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>Acesso ilimitado a todas as ferramentas</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>CRM Completo para gestão de clientes</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>Gestão Financeira avançada</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>Suporte prioritário</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscription;
