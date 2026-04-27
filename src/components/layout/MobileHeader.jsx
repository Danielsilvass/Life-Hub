import React from 'react';
import { Menu, Flame } from 'lucide-react';

export default function MobileHeader({ onMenuClick }) {
  return (
    <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
      <div className="flex items-center gap-2 text-white font-bold text-xl">
        <Flame className="text-emerald-500" size={24} />
        <span>Life Hub</span>
      </div>
      <button
        onClick={onMenuClick}
        className="p-2 text-zinc-400 hover:text-white transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>
    </header>
  );
}
