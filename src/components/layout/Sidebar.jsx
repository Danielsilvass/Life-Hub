import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Calendar, CheckSquare, UtensilsCrossed, LogOut, Flame, Lightbulb, ShoppingBag, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { logout, user } = useAuth();
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Resumo' },
    { to: '/finance', icon: Wallet, label: 'Finanças' },
    { to: '/calendar', icon: Calendar, label: 'Agenda' },
    { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { to: '/brainstorm', icon: Lightbulb, label: 'Brainstorm' },
    { to: '/wishlist', icon: ShoppingBag, label: 'Compras' },
    { to: '/health', icon: Activity, label: 'Saúde' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full border-r border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="p-6 flex gap-2 items-center text-white font-bold text-xl"><Flame className="text-emerald-500" /> Life Hub</div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-zinc-900 text-zinc-200'}`}>
            <item.icon size={20} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4"><button onClick={logout} className="text-sm font-bold flex gap-2 items-center hover:text-white"><LogOut size={16}/> Sair</button></div>
    </aside>
  );
}
