import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Calendar, CheckSquare, LogOut, Flame, Lightbulb, ShoppingBag, Activity, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Resumo' },
    { to: '/finance', icon: Wallet, label: 'Finanças' },
    { to: '/calendar', icon: Calendar, label: 'Agenda' },
    { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { to: '/brainstorm', icon: Lightbulb, label: 'Brainstorm' },
    { to: '/wishlist', icon: ShoppingBag, label: 'Compras' },
    { to: '/health', icon: Activity, label: 'Saúde' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-6 flex justify-between items-center text-white font-bold text-xl">
          <div className="flex gap-2 items-center">
            <Flame className="text-emerald-500" /> Life Hub
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              onClick={() => { if(window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                    : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <item.icon size={20} /> 
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all font-medium"
          >
            <LogOut size={20}/> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
