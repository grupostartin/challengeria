import React from 'react';
import { ShieldAlert, CreditCard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PlanExpired: React.FC = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setLoading(true);
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
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0f172a] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Seu período de teste acabou</h1>
                <p className="text-slate-400 mb-8">
                    Para continuar usando o Startin e acessar todos os recursos, faça o upgrade para o plano Premium.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Assinar Premium (R$ 47/mês)
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => signOut()}
                        className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanExpired;
