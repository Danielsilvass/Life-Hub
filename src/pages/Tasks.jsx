import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { CheckSquare, Plus, Link as LinkIcon } from 'lucide-react';
import TaskItem from '../components/features/TaskItem';

export default function Tasks() {
  const { tarefas, adicionarTarefa, metas } = useDb();
  const [loading, setLoading] = useState(false);

  const [tTit, setTTit] = useState("");
  const [tPrio, setTPrio] = useState("3");
  const [tCusto, setTCusto] = useState("");
  const [tMeta, setTMeta] = useState("");

  const handleTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adicionarTarefa({
        titulo: tTit,
        prioridade: Number(tPrio),
        custo: Number(tCusto) || null,
        metaId: tMeta || null
      });
      setTTit(""); setTCusto(""); setTMeta("");
    } catch (err) { alert("Erro ao criar Tarefa"); }
    finally { setLoading(false); }
  };

  const aFazer = tarefas.filter(t => t.status === "a_fazer").sort((a,b) => Number(a.prioridade) - Number(b.prioridade));
  const feitas = tarefas.filter(t => t.status === "feito");

  return (
    <div className="w-full flex justify-center pb-8 lg:pb-12">
      <div className="w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-8 space-y-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-4">
           <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
             <CheckSquare className="text-amber-500 shrink-0" size={28}/> 
             Sprint Log
           </h1>
        </header>

        {/* Rápido Inject */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm">
           <form onSubmit={handleTask} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-12 lg:col-span-5">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 block mb-1">Missão</label>
                 <input required value={tTit} onChange={e => setTTit(e.target.value)} type="text" placeholder="Entregar Relatório..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" />
              </div>
              <div className="sm:col-span-6 lg:col-span-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 block mb-1">Prio</label>
                 <select value={tPrio} onChange={e => setTPrio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white outline-none transition-all appearance-none">
                    <option value="1">1 - Máxima</option>
                    <option value="2">2 - Normal</option>
                    <option value="3">3 - Baixa</option>
                 </select>
              </div>
              <div className="sm:col-span-6 lg:col-span-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 block mb-1">Custo R$</label>
                 <input value={tCusto} onChange={e => setTCusto(e.target.value)} type="number" step="0.01" placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white outline-none transition-all" />
              </div>
              <div className="sm:col-span-12 lg:col-span-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 block mb-1 flex items-center gap-1"><LinkIcon size={12}/> Meta</label>
                 <select value={tMeta} onChange={e => setTMeta(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white outline-none transition-all appearance-none">
                    <option value="">Sem vínculo</option>
                    {metas.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                 </select>
              </div>
              <div className="sm:col-span-12 lg:col-span-1 flex items-end">
                 <button disabled={loading} className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center font-black rounded-xl disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/10">
                   {loading ? '...' : <Plus size={24}/>}
                 </button>
              </div>
           </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
           <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 sm:p-6 min-h-[300px]">
               <h2 className="text-lg font-bold text-white mb-6 flex justify-between items-center">
                   A Fazer
                   <span className="bg-amber-500/10 text-amber-500 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">{aFazer.length}</span>
               </h2>
               <div className="space-y-3">
                   {aFazer.map(t => <TaskItem key={t.id} tarefa={t} />)}
                   {aFazer.length === 0 && <p className="text-zinc-600 text-center font-bold mt-10 text-sm">Tudo limpo!</p>}
               </div>
           </div>

           <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 sm:p-6 min-h-[300px] opacity-70 hover:opacity-100 transition-opacity">
               <h2 className="text-lg font-bold text-zinc-400 mb-6 flex justify-between items-center">
                   Finalizadas
                   <span className="bg-zinc-800 text-zinc-500 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">{feitas.length}</span>
               </h2>
               <div className="space-y-3">
                   {feitas.map(t => <TaskItem key={t.id} tarefa={t} />)}
               </div>
           </div>
        </div>

      </div>
    </div>
  );
}
