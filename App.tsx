import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VideoIdeas from './pages/VideoIdeas';
import Kanban from './pages/Kanban';
import Finance from './pages/Finance';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Agenda from './pages/Agenda';
import SharedIdea from './pages/SharedIdea';
import ClientPortal from './pages/ClientPortal';
import PublicBio from './pages/PublicBio';
import BioSettings from './pages/BioSettings';
import Help from './pages/Help';
import LandingPage from './pages/LandingPage';
import PlanExpired from './pages/PlanExpired';
import Subscription from './pages/Subscription';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();

  const loading = authLoading || subLoading;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
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
      <Routes>
        {/* PUBLIC ROUTE - Must come FIRST and be EXACT */}
        <Route path="/share/:token" element={<SharedIdea />} />
        <Route path="/portal/:token" element={<ClientPortal />} />
        <Route path="/bio/:username" element={<PublicBio />} />
        <Route path="/lp" element={<LandingPage />} />


        {/* AUTH-REQUIRED ROUTES */}
        <Route path="/login" element={
          <AuthProvider>
            <Login />
          </AuthProvider>
        } />

        <Route path="/plan-expired" element={
          <AuthProvider>
            <PlanExpired />
          </AuthProvider>
        } />

        <Route path="/signup" element={
          <AuthProvider>
            <Signup />
          </AuthProvider>
        } />

        <Route path="/" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/ideias" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <VideoIdeas />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/tarefas" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Kanban />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/financeiro" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Finance />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/clientes" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/contratos" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Contracts />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/estoque" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/vendas" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/agenda" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Agenda />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/config-bio" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <BioSettings />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/assinatura" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Subscription />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="/ajuda" element={
          <AuthProvider>
            <AppProvider>
              <ProtectedRoute>
                <Layout>
                  <Help />
                </Layout>
              </ProtectedRoute>
            </AppProvider>
          </AuthProvider>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
