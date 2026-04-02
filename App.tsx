import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

import Kanban from './pages/Kanban';
import Finance from './pages/Finance';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Agenda from './pages/Agenda';

import ClientPortal from './pages/ClientPortal';
import PublicBio from './pages/PublicBio';
import BioSettings from './pages/BioSettings';
import Help from './pages/Help';
import LandingPage from './pages/LandingPage';
import PlanExpired from './pages/PlanExpired';
import Subscription from './pages/Subscription';
import QuickAttachment from './pages/QuickAttachment';
import Notes from './pages/Notes';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  const [verifying, setVerifying] = React.useState(false);

  // Check for session_id (Stripe Success)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId && user) {
      setVerifying(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  // Handle polling and early exit
  React.useEffect(() => {
    if (!verifying) return;

    if (hasAccess) {
      setVerifying(false);
      return;
    }

    let count = 0;
    const interval = setInterval(async () => {
      await refreshProfile();
      count++;
      if (count >= 5) {
        clearInterval(interval);
        setVerifying(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [verifying, hasAccess, refreshProfile]);

  const loading = authLoading || subLoading || verifying;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: 'white', gap: '20px' }}>
        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        {verifying && <p className="font-bold animate-pulse">Confirmando seu pagamento... Aguarde.</p>}
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/plan-expired" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/portal/:token" element={<ClientPortal />} />
            <Route path="/bio/:username" element={<PublicBio />} />
            <Route path="/lp" element={<LandingPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/plan-expired" element={<PlanExpired />} />

            {/* PROTECTED ROUTES */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            <Route path="/tarefas" element={
              <ProtectedRoute>
                <Layout>
                  <Kanban />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/financeiro" element={
              <ProtectedRoute>
                <Layout>
                  <Finance />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/clientes" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/contratos" element={
              <ProtectedRoute>
                <Layout>
                  <Contracts />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/estoque" element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/vendas" element={
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/agenda" element={
              <ProtectedRoute>
                <Layout>
                  <Agenda />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/config-bio" element={
              <ProtectedRoute>
                <Layout>
                  <BioSettings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/assinatura" element={
              <ProtectedRoute>
                <Layout>
                  <Subscription />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/anexo-rapido" element={
              <ProtectedRoute>
                <Layout>
                  <QuickAttachment />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/anotacoes" element={
              <ProtectedRoute>
                <Layout>
                  <Notes />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/ajuda" element={
              <ProtectedRoute>
                <Layout>
                  <Help />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
