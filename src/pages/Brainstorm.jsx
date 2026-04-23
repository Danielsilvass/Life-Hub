import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Lightbulb, Plus, Check, Trash2, ArrowRight } from 'lucide-react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Brainstorm() {
  const { brainstorm, addBrainstorm, convertBrainstormToTask, user } = useDb();
  const [novaIdeia, setNovaIdeia] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novaIdeia.trim()) return;
    setLoading(true);
    try {
      await addBrainstorm({
        titulo: novaIdeia,
        descricao: desc,
        categoria: categoria
      });
      setNovaIdeia("");
      setDesc("");
      setCategoria("Geral");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleConvert = async (ideia) => {
    try {
      await convertBrainstormToTask(ideia);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/brainstorm`, id));
    } catch(err) {
      console.error(err);
    }
  };

  const pendentes = brainstorm.filter(b => b.status === "pendente");
  const convertidos = brainstorm.filter(b => b.status === "convertido");

  return (
    <div className="w-full flex justify-center pb-24">
      <div className="w-full max-w-6xl px-6 py-6 space-y-6 flex flex-col animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Brainstorm <Lightbulb className="text-amber-500" size={26}/>
        </h1>
        <p className="text-zinc-400 mt-2 font-medium">Capture ideias rapidamente antes que escapem.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white mb-2">Nova Ideia</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Título da Ideia..."
            value={novaIdeia}
            onChange={e => setNovaIdeia(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500 transition-colors"
          />
          <select 
            value={categoria} 
            onChange={e => setCategoria(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
          >
            <option>Geral</option>
            <option>Trabalho</option>
            <option>Projeto Pessoal</option>
            <option>Conteúdo</option>
          </select>
        </div>
        <textarea
           placeholder="Descrição detalhada (opcional)..."
           value={desc}
           onChange={e => setDesc(e.target.value)}
           className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500 transition-colors h-24 resize-none custom-scrollbar"
        />
        <button 
          type="submit" 
          disabled={loading || !novaIdeia.trim()}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 self-end mt-2"
        >
          {loading ? "Salvando..." : <><Plus size={20}/> Capturar</>}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendentes.map(ideia => (
          <div key={ideia.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-zinc-700 transition-colors gap-4">
             <div>
                <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-widest w-fit mb-3">{ideia.categoria}</p>
                <h3 className="text-lg font-bold text-white leading-tight">{ideia.titulo}</h3>
                {ideia.descricao && <p className="text-zinc-400 text-sm mt-3 leading-relaxed">{ideia.descricao}</p>}
             </div>
             <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 mt-2">
                <button onClick={() => handleDelete(ideia.id)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <Trash2 size={18}/>
                </button>
                <button onClick={() => handleConvert(ideia)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                  <ArrowRight size={16}/> Virar Tarefa
                </button>
             </div>
          </div>
        ))}
        {pendentes.length === 0 && (
           <div className="col-span-full text-center py-10 border border-dashed border-zinc-700 rounded-2xl">
              <p className="text-zinc-500 font-bold text-sm">Nenhuma ideia pendente. Mente vazia, mente sã! 🧘‍♂️</p>
           </div>
        )}
      </div>

      </div>
    </div>
  );
}
