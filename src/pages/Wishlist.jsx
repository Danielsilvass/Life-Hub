import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { ShoppingBag, Plus, ShoppingCart, Apple, Star } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Wishlist() {
  const { 
    wishlist, addWishlistItem, buyWishlistItem,
    listaCompras, adicionarItemLista, comprarItem,
    orcamentos, user
  } = useDb();

  const [tab, setTab] = useState("desejos"); 

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("Media");
  const [orcamentoId, setOrcamentoId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !valor) return;
    setLoading(true);
    try {
      if (tab === "desejos") {
        await addWishlistItem({
          nome,
          valorEstimado: Number(valor),
          categoria: categoria || "Outros",
          prioridade
        });
      } else {
        await adicionarItemLista({
          nome,
          custoEstimado: Number(valor),
          orcamentoId: orcamentoId || null
        });
      }
      setNome("");
      setValor("");
      setCategoria("");
      setOrcamentoId("");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleBuyDesejo = async (item) => {
      // Find matching budget if user desires to link it. Or just pass null to only reduce general balance.
      // For simplicity, we can pass null or find an exact category match. Let's pass null based on current spec.
      await buyWishlistItem(item, null); 
  };

  const handleBuyAlimento = async (item) => {
      await comprarItem(item);
  };

  const handleDelete = async (collMatch, id) => {
      if(!user) return;
      try {
          await deleteDoc(doc(db, `users/${user.uid}/${collMatch}`, id));
      } catch(e) { console.error(e); }
  };

  const pendentesDesejo = wishlist.filter(w => w.status === "pendente");
  const pendentesAlimento = listaCompras.filter(l => l.status === "pendente");

  return (
    <div className="w-full flex justify-center pb-24">
      <div className="w-full max-w-6xl px-6 py-6 space-y-6 flex flex-col animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Compras <ShoppingBag className="text-blue-500" size={26}/>
        </h1>
        <p className="text-zinc-400 mt-2 font-medium">Controle sua lista de desejos e supermercado.</p>
      </header>

      <div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto">
         <button 
           onClick={() => setTab("desejos")} 
           className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${tab === "desejos" ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 border border-transparent'}`}
         >
            <Star size={18} className={tab === "desejos" ? "text-blue-500" : ""}/> Desejos
         </button>
         <button 
           onClick={() => setTab("alimentacao")} 
           className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${tab === "alimentacao" ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 border border-transparent'}`}
         >
            <Apple size={18} className={tab === "alimentacao" ? "text-green-500" : ""}/> Alimentação
         </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
           Novo Item em {tab === 'desejos' ? 'Desejos' : 'Alimentação'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nome do Produto..."
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Valor/Custo R$"
            value={valor}
            onChange={e => setValor(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
          />
          {tab === "desejos" && (
             <>
               <input
                 type="text"
                 placeholder="Categoria (ex: Tech)"
                 value={categoria}
                 onChange={e => setCategoria(e.target.value)}
                 className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
               />
               <select 
                 value={prioridade} 
                 onChange={e => setPrioridade(e.target.value)}
                 className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
               >
                 <option value="Alta">Prioridade Alta</option>
                 <option value="Media">Prioridade Média</option>
                 <option value="Baixa">Prioridade Baixa</option>
               </select>
             </>
          )}
          {tab === "alimentacao" && (
              <select 
                 value={orcamentoId} 
                 onChange={e => setOrcamentoId(e.target.value)}
                 className="lg:col-span-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
               >
                 <option value="">Vincular Orçamento (Opcional)</option>
                 {orcamentos.map(o => (
                   <option key={o.id} value={o.id}>{o.categoriaNome} - Disponível: R$ {(o.limite - o.valorGasto).toFixed(2)}</option>
                 ))}
               </select>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !nome.trim() || !valor}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 self-end mt-2"
        >
          {loading ? "Salvando..." : <><Plus size={20}/> Adicionar</>}
        </button>
      </form>

      <div className="space-y-4">
         {tab === "desejos" && pendentesDesejo.map(item => (
             <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2 w-fit ${item.prioridade === 'Alta' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>{item.prioridade}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{item.nome}</h3>
                    <p className="text-zinc-400 font-medium text-sm mt-1">Categoria: {item.categoria} <span className="mx-2">•</span> <span className="text-white">R$ {Number(item.valorEstimado).toFixed(2)}</span></p>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={() => handleDelete('wishlist', item.id)} className="text-zinc-500 hover:text-rose-500 font-semibold px-4 py-2 transition-colors">Excluir</button>
                    <button onClick={() => handleBuyDesejo(item)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <ShoppingCart size={18}/> Comprar
                    </button>
                </div>
             </div>
         ))}

         {tab === "alimentacao" && pendentesAlimento.map(item => (
             <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-white">{item.nome}</h3>
                    <p className="text-zinc-400 font-medium text-sm mt-1">Estimativa: <span className="text-white">R$ {Number(item.custoEstimado).toFixed(2)}</span></p>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={() => handleDelete('lista_compras', item.id)} className="text-zinc-500 hover:text-rose-500 font-semibold px-4 py-2 transition-colors">Excluir</button>
                    <button onClick={() => handleBuyAlimento(item)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <ShoppingCart size={18}/> Comprar
                    </button>
                </div>
             </div>
         ))}

         {((tab === "desejos" && pendentesDesejo.length === 0) || (tab === "alimentacao" && pendentesAlimento.length === 0)) && (
             <div className="text-center py-10 border border-dashed border-zinc-700 rounded-2xl">
                <p className="text-zinc-500 font-bold text-sm">Nenhum item pendente nesta lista. Você está em dia! 🎉</p>
             </div>
         )}
      </div>

      </div>
    </div>
  );
}
