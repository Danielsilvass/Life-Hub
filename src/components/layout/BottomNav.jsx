import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, CheckSquare, Activity } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Resumo' },
    { to: '/finance', icon: Wallet, label: 'Finanças' },
    { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { to: '/health', icon: Activity, label: 'Saúde' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 px-6 py-3 pb-6">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-emerald-500 scale-110' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
