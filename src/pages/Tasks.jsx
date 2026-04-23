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
    <div className="p-6 md:p-10 pb-32 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="mb-4">
         <h1 className="text-3xl font-extrabold text-white flex items-center gap-3"><CheckSquare className="text-amber-500" size={32}/> Sprint Log</h1>
      </header>

      {/* Rápido Inject */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-sm">
         <form onSubmit={handleTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
               <label className="text-xs font-bold text-zinc-500 uppercase ml-2 block mb-1">Missão</label>
               <input required value={tTit} onChange={e => setTTit(e.target.value)} type="text" placeholder="Entregar Relatório..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-bold text-zinc-500 uppercase ml-2 block mb-1">Prioridade</label>
               <select value={tPrio} onChange={e => setTPrio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-amber-500">
                  <option value="1">1 - Máxima</option>
                  <option value="2">2 - Normal</option>
                  <option value="3">3 - Baixa</option>
               </select>
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-bold text-zinc-500 uppercase ml-2 block mb-1">Custo? R$</label>
               <input value={tCusto} onChange={e => setTCusto(e.target.value)} type="number" step="0.01" placeholder="Se houver" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-bold text-zinc-500 uppercase ml-2 block mb-1 flex items-center gap-1"><LinkIcon size={12}/> Meta Origem</label>
               <select value={tMeta} onChange={e => setTMeta(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-amber-500">
                  <option value="">Sem vínculo</option>
                  {metas.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
               </select>
            </div>
            <div className="md:col-span-1">
               <button disabled={loading} className="w-full h-12 bg-amber-500 hover:bg-amber-600 focus:ring-4 ring-amber-500/20 text-white flex items-center justify-center font-black rounded-xl disabled:opacity-50 transition-all">
                 {loading ? '...' : <Plus size={24}/>}
               </button>
            </div>
         </form>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4">
         
         <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-6 min-h-[400px]">
             <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center">
                 A Fazer
                 <span className="bg-amber-500/10 text-amber-500 text-sm px-3 py-1 rounded-full">{aFazer.length}</span>
             </h2>
             <div className="space-y-3">
                 {aFazer.map(t => <TaskItem key={t.id} tarefa={t} />)}
                 {aFazer.length === 0 && <p className="text-zinc-600 text-center font-bold mt-10">Tudo limpo!</p>}
             </div>
         </div>

         <div className="bg-zinc-950/20 border border-zinc-800/50 rounded-3xl p-6 min-h-[400px] opacity-70 hover:opacity-100 transition-opacity">
             <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center text-zinc-500">
                 Finalizadas
                 <span className="bg-zinc-800 text-zinc-400 text-sm px-3 py-1 rounded-full">{feitas.length}</span>
             </h2>
             <div className="space-y-3">
                 {feitas.map(t => <TaskItem key={t.id} tarefa={t} />)}
             </div>
         </div>

      </div>
    </div>
  );
}
