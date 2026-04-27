import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import BottomNav from './components/layout/BottomNav';
import InstallPrompt from './components/layout/InstallPrompt';
import Login from './pages/Login';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DbProvider } from './contexts/DbContext';

// Lazy loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Finance = lazy(() => import('./pages/Finance'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Brainstorm = lazy(() => import('./pages/Brainstorm'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Health = lazy(() => import('./pages/Health'));

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-zinc-950">
      <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Login />;

  return (
    <Router>
      <div className="flex flex-col lg:flex-row h-screen bg-zinc-950 text-slate-200 font-sans overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 flex flex-col p-4 pb-24 lg:pb-4 lg:pl-0 overflow-hidden">
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl lg:rounded-3xl overflow-y-auto shadow-2xl relative custom-scrollbar">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
                  <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
                  <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
                  <Route path="/brainstorm" element={<PrivateRoute><Brainstorm /></PrivateRoute>} />
                  <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                  <Route path="/health" element={<PrivateRoute><Health /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </div>
          </main>

          <BottomNav />
        </div>
        <InstallPrompt />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DbProvider>
         <AppContent />
      </DbProvider>
    </AuthProvider>
  );
}
