import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message === 'User already registered' ? 'Usuário já cadastrado' : error.message);
            setLoading(false);
        } else {
            // Se o Supabase estiver configurado para auto-confirmar, a sessão existirá
            // Caso contrário, tentamos logar explicitamente ou apenas navegamos
            if (data.session) {
                navigate('/');
            } else {
                // Tenta fazer o login logo após o cadastro para garantir a entrada direta
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) {
                    setError('Conta criada! Por favor, faça login agora.');
                    setLoading(false); // Ensure loading is false before navigating to login
                    navigate('/login');
                } else {
                    navigate('/');
                }
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Criar Conta</h1>
                    <p>Comece a gerenciar seus projetos hoje</p>
                </div>

                <form onSubmit={handleSignUp} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                id="email"
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="login-actions">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Processando...' : 'Cadastrar'}
                            <UserPlus size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="btn btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

            <style>{sharedStyles}</style>
        </div>
    );
};

const sharedStyles = `
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 20px;
      font-family: 'Inter', sans-serif;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      width: 100%;
      max-width: 400px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-header h1 {
      font-size: 2rem;
      color: white;
      margin: 0;
      letter-spacing: -1px;
    }

    .login-header p {
      color: #94a3b8;
      margin-top: 8px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      color: #e2e8f0;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-icon svg {
      position: absolute;
      left: 12px;
      color: #64748b;
    }

    .input-with-icon input {
      width: 100%;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      padding: 12px 12px 12px 40px;
      color: white;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .input-with-icon input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .login-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }
`;

export default Signup;
