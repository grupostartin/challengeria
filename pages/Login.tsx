import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header text-center">
          <img src="/logo.png" alt="UPStartin" className="h-16 mx-auto mb-6" />
          <p>Entre na sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
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
              <span>{error === 'Invalid login credentials' ? 'Credenciais de login inválidas' : error}</span>
            </div>
          )}

          <div className="login-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Processando...' : 'Entrar'}
              <LogIn size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/signup')}
              disabled={loading}
              className="btn btn-secondary"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
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
      `}</style>
    </div>
  );
};

export default Login;
