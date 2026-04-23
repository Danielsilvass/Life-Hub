import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Brainstorm from './pages/Brainstorm';
import Wishlist from './pages/Wishlist';
import Health from './pages/Health';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DbProvider } from './contexts/DbContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

function AppContent() {
  const { user } = useAuth();
  if (!user) return <Login />;

  return (
    <Router>
      <div className="flex h-screen bg-zinc-950 text-slate-200 font-sans">
        <Sidebar className="w-64" />
        <main className="flex-1 flex flex-col p-4 lg:pl-0">
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-y-auto shadow-2xl relative custom-scrollbar">
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
          </div>
        </main>
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
