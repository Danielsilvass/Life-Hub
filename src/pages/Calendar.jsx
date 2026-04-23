import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Calendar as CalIcon, Clock, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const { eventos, adicionarEvento } = useDb();
  const [loading, setLoading] = useState(false);

  const [evTit, setEvTit] = useState("");
  const [evIni, setEvIni] = useState("");
  const [evFim, setEvFim] = useState("");

  const handleEv = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!evTit || !evIni || !evFim) return;
      await adicionarEvento({
        titulo: evTit,
        dataInicio: evIni,
        dataFim: evFim
      });
      setEvTit(""); setEvIni(""); setEvFim("");
    } catch (err) { alert("Erro ao salvar Evento"); }
    finally { setLoading(false); }
  };

  const hojeStr = new Date().toISOString().substring(0, 16);
  const eventosFuturos = eventos.filter(e => e.dataInicio >= hojeStr)
                                .sort((a,b) => a.dataInicio.localeCompare(b.dataInicio));

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
         <h1 className="text-3xl font-extrabold text-white flex items-center gap-3"><CalIcon className="text-blue-500" size={32}/> Master Calendar</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-sm h-fit">
           <h2 className="text-xl font-bold text-white mb-6">Bloqueio de Agenda</h2>
           <form onSubmit={handleEv} className="space-y-4">
             <input required value={evTit} onChange={e => setEvTit(e.target.value)} type="text" placeholder="Nome do Compromisso" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-blue-500" />
             
             <div>
               <label className="text-xs font-bold text-zinc-500 uppercase ml-2">Início</label>
               <input required value={evIni} onChange={e => setEvIni(e.target.value)} type="datetime-local" className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-blue-500 [color-scheme:dark]" />
             </div>
             
             <div>
               <label className="text-xs font-bold text-zinc-500 uppercase ml-2">Término</label>
               <input required value={evFim} onChange={e => setEvFim(e.target.value)} type="datetime-local" className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-blue-500 [color-scheme:dark]" />
             </div>

             <button disabled={loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 focus:ring-4 ring-blue-500/20 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all">
               {loading ? 'Bloqueando...' : 'Criar Evento'}
             </button>
           </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-xl font-bold text-white mb-2 pl-2">Timeline Futura</h2>
           {eventosFuturos.map((ev, index) => {
              const dataObj = new Date(ev.dataInicio);
              const dia = String(dataObj.getDate()).padStart(2, '0');
              const mes = String(dataObj.getMonth()+1).padStart(2, '0');
              const hora = String(dataObj.getHours()).padStart(2, '0');
              const min = String(dataObj.getMinutes()).padStart(2, '0');

              return (
                 <div key={ev.id || index} className="group relative flex gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-blue-500/50 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-2xl min-w-[80px]">
                       <span className="text-2xl font-black text-white">{dia}</span>
                       <span className="text-xs font-bold text-blue-500 uppercase">{mes}</span>
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                       <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{ev.titulo}</h3>
                       <p className="text-sm font-semibold text-zinc-500 flex items-center gap-1 mt-1"><Clock size={14}/> {hora}:{min}</p>
                    </div>
                    <div className="flex items-center text-zinc-700 pr-2 group-hover:text-blue-500 transition-colors">
                       <ChevronRight size={24} />
                    </div>
                 </div>
              )
           })}

           {eventosFuturos.length === 0 && (
              <div className="p-10 text-center border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center">
                 <CalIcon className="text-zinc-700 mb-3" size={48} />
                 <p className="text-zinc-500 font-bold text-lg">Nenhum evento no horizonte temporal.</p>
                 <p className="text-zinc-600 text-sm mt-1">Sua agenda está livre.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
