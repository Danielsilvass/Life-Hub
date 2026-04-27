import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Detect if it's iOS
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    
    // 2. Detect if already in standalone mode
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    // 3. Check if user already dismissed it
    const isDismissed = localStorage.getItem('hideInstallPrompt') === 'true';

    // Show only if iOS, NOT standalone, and NOT dismissed
    if (isIOS && !isStandalone && !isDismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hideInstallPrompt', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Progress bar or accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700">
              <img src="/icon-192.png" alt="Life Hub Icon" className="w-10 h-10 rounded-lg shadow-sm" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-semibold text-lg leading-tight">
                Instale o Life Hub
              </h3>
              <p className="text-zinc-400 text-sm mt-1">
                Melhor experiência no seu iPhone
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-3 text-zinc-300 text-sm">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-800 text-xs font-bold border border-zinc-700">1</span>
              <span>Abra no <strong className="text-white">Safari</strong></span>
            </div>
            
            <div className="flex items-center gap-3 text-zinc-300 text-sm">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-800 text-xs font-bold border border-zinc-700">2</span>
              <span className="flex items-center gap-2">
                Toque no botão <Share size={16} className="text-blue-400" />
              </span>
            </div>

            <div className="flex items-center gap-3 text-zinc-300 text-sm">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-800 text-xs font-bold border border-zinc-700">3</span>
              <span className="flex items-center gap-2">
                Selecione <PlusSquare size={16} className="text-zinc-400" /> <strong className="text-white">"Tela de Início"</strong>
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
