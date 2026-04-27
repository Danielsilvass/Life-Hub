import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext';
import { Wallet, ArrowUpRight, ArrowDownRight, Repeat, Plus, Trash2, Power } from 'lucide-react';

export default function Finance() {
  const { transacoes, orcamentos, categorias, recorrentes, adicionarTransacao, adicionarOrcamento, adicionarRecorrente, toggleRecorrenteAtivo, excluirRecorrente, adicionarCategoria } = useDb();
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingOrc, setLoadingOrc] = useState(false);

  const [txDesc, setTxDesc] = useState("");
  const [txValor, setTxValor] = useState("");
  const [txTipo, setTxTipo] = useState("saida");
  const [txCategoriaId, setTxCategoriaId] = useState("");

  const [orcCatId, setOrcCatId] = useState("");
  const [orcLim, setOrcLim] = useState("");

  const [newCatNome, setNewCatNome] = useState("");
  const [newCatCor, setNewCatCor] = useState("#22c55e");
  const [newCatTipo, setNewCatTipo] = useState("saida");
  const [loadingCat, setLoadingCat] = useState(false);

  const [recNome, setRecNome] = useState("");
  const [recValor, setRecValor] = useState("");
  const [recCatId, setRecCatId] = useState("");
  const [recDia, setRecDia] = useState("");
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
     if(categorias.length > 0) {
        if(!txCategoriaId) setTxCategoriaId(categorias[0].id);
        if(!orcCatId) setOrcCatId(categorias[0].id);
        if(!recCatId) setRecCatId(categorias[0].id);
     }
  }, [categorias]);

  const handleTx = async (e) => {
    e.preventDefault();
    setLoadingTx(true);
    const cat = categorias.find(c => c.id === txCategoriaId);
    try {
      await adicionarTransacao({
        descricao: txDesc,
        valor: Number(txValor),
        tipo: txTipo,
        categoriaId: cat?.id || null,
        categoria: cat?.nome || "Geral"
      });
      setTxDesc(""); setTxValor("");
    } catch (err) { alert("Erro ao salvar transação"); }
    finally { setLoadingTx(false); }
  };

  const handleOrc = async (e) => {
    e.preventDefault();
    setLoadingOrc(true);
    const cat = categorias.find(c => c.id === orcCatId);
    try {
      await adicionarOrcamento({
        categoriaId: cat?.id || null,
        categoriaNome: cat?.nome || "Geral",
        limite: Number(orcLim)
      });
      setOrcLim("");
    } catch (err) { alert("Erro ao salvar orçamento"); }
    finally { setLoadingOrc(false); }
  };

  const handleRec = async (e) => {
     e.preventDefault();
     setLoadingRec(true);
     const cat = categorias.find(c => c.id === recCatId);
     try {
       await adicionarRecorrente({
          nome: recNome,
          valor: Number(recValor),
          tipo: "saida",
          categoriaId: cat?.id || null,
          categoriaNome: cat?.nome || "Assinaturas",
          diaVencimento: Number(recDia)
       });
       setRecNome(""); setRecValor(""); setRecDia("");
     } catch(e) { alert("Erro ao agendar"); }
     finally { setLoadingRec(false); }
  };

  const handleCat = async (e) => {
     e.preventDefault();
     if(categorias.some(c => c.nome.toLowerCase().trim() === newCatNome.toLowerCase().trim())) {
        alert("Já existe uma categoria com este nome.");
        return;
     }

     setLoadingCat(true);
     try {
       await adicionarCategoria({
          nome: newCatNome,
          cor: newCatCor,
          tipo: newCatTipo
       });
       setNewCatNome("");
     } catch (err) { alert("Erro ao criar categoria"); }
     finally { setLoadingCat(false); }
  };

  return (
    <div className="w-full flex justify-center pb-8 lg:pb-12">
      <div className="w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <header className="mb-6">
           <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
             <Wallet className="text-emerald-500 shrink-0" size={28}/> 
             Finanças Reais
           </h1>
        </header>

        <div className="flex flex-col gap-6">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Nova Transação</h2>
            <form onSubmit={handleTx} className="space-y-4">
              <input required value={txDesc} onChange={e => setTxDesc(e.target.value)} type="text" placeholder="Descrição (Ex: Mercado)" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <input required value={txValor} onChange={e => setTxValor(e.target.value)} type="number" step="0.01" placeholder="Valor (R$)" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                <select value={txTipo} onChange={e => setTxTipo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none">
                   <option value="saida">Saída (-)</option><option value="entrada">Entrada (+)</option>
                </select>
                <select required value={txCategoriaId} onChange={e => setTxCategoriaId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none">
                   {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <button disabled={loadingTx} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 active:scale-[0.98]">
                {loadingTx ? 'Carregando...' : 'Registrar Transação'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[260px]">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Teto de Gastos</h2>
              <form onSubmit={handleOrc} className="space-y-3 mb-4 shrink-0">
                <select required value={orcCatId} onChange={e => setOrcCatId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-zinc-300 outline-none transition-all appearance-none">
                   {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <div className="flex gap-3">
                  <input required value={orcLim} onChange={e => setOrcLim(e.target.value)} type="number" step="0.01" placeholder="Limite (R$)" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none transition-all" />
                  <button disabled={loadingOrc} className="h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]">
                     {loadingOrc ? '...' : 'Fixar'}
                  </button>
                </div>
              </form>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-1">
                {orcamentos.map(o => (
                   <div key={o.id} className="flex justify-between items-center text-sm p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                     <span className="text-zinc-200 font-bold">{o.categoriaNome}</span>
                     <span className="text-zinc-400 font-mono text-xs">R${o.valorGasto} / <span className="text-emerald-500 font-bold">R${o.limite}</span></span>
                   </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[260px]">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Categorias</h2>
              <form onSubmit={handleCat} className="space-y-3 mb-4 shrink-0">
                <div className="flex gap-3">
                  <input required value={newCatNome} onChange={e => setNewCatNome(e.target.value)} type="text" placeholder="Nome" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none transition-all" />
                  <input type="color" value={newCatCor} onChange={e => setNewCatCor(e.target.value)} className="w-[58px] h-12 bg-zinc-800 border border-zinc-700 rounded-xl cursor-pointer p-1.5 shrink-0" />
                </div>
                <div className="flex gap-3">
                  <select value={newCatTipo} onChange={e => setNewCatTipo(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-zinc-300 outline-none transition-all appearance-none">
                     <option value="saida">Despesas</option>
                     <option value="entrada">Rendimentos</option>
                  </select>
                  <button disabled={loadingCat} className="h-12 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold px-4 rounded-xl transition-all disabled:opacity-50">
                     {loadingCat ? '...' : 'Add'}
                  </button>
                </div>
              </form>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-1">
                {categorias.map(c => (
                   <div key={c.id} className="flex justify-between items-center text-sm px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
                     <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: c.cor}}></span>
                        <span className="text-white font-bold">{c.nome}</span>
                     </div>
                     {c.padrao && <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800/50 border border-zinc-700 px-2 py-0.5 rounded-lg">Base</span>}
                   </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[300px]">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2"><Repeat className="text-zinc-500" size={20}/> Recorrentes</h2>
              <form onSubmit={handleRec} className="space-y-3 mb-4">
                <input required recNome={recNome} onChange={e => setRecNome(e.target.value)} type="text" placeholder="Nome (Ex: Netflix)" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none transition-all" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   <input required value={recValor} onChange={e => setRecValor(e.target.value)} type="number" step="0.01" placeholder="Valor" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none transition-all" />
                   <input required value={recDia} onChange={e => setRecDia(e.target.value)} type="number" min="1" max="31" placeholder="Dia" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none transition-all" />
                   <select required value={recCatId} onChange={e => setRecCatId(e.target.value)} className="w-full sm:col-span-1 col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-zinc-300 outline-none transition-all appearance-none">
                     {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                   </select>
                </div>
                <button disabled={loadingRec} className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loadingRec ? 'Carregando...' : <><Plus size={20}/> Automatizar</>}
                </button>
              </form>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {recorrentes.map(r => (
                  <div key={r.id} className={`flex justify-between items-center p-3 border rounded-xl transition-all ${r.ativo ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-transparent border-zinc-800/50 opacity-50'}`}>
                    <div>
                       <p className="text-white font-bold text-sm">{r.nome} <span className="text-[10px] text-zinc-500 border ml-2 border-zinc-700 bg-zinc-800 px-1.5 py-0.5 rounded-lg font-bold uppercase tracking-wider">Dia {r.diaVencimento}</span></p>
                       <p className="text-xs font-mono text-zinc-400 mt-1 font-bold">R$ {Number(r.valor).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => toggleRecorrenteAtivo(r.id, r.ativo)} className={`p-2 rounded-lg transition-colors ${r.ativo ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}><Power size={18}/></button>
                       <button onClick={() => excluirRecorrente(r.id)} className="p-2 rounded-lg transition-colors text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[300px]">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Extrato Vivo</h2>
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {transacoes.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(t => (
                   <div key={t.id} className="flex items-center justify-between p-3.5 bg-zinc-800/30 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`p-2.5 rounded-xl ${t.tipo === 'saida' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                            {t.tipo === 'saida' ? <ArrowDownRight size={20} className="text-rose-500" /> : <ArrowUpRight size={20} className="text-emerald-500" />}
                         </div>
                         <div>
                            <p className="text-white font-bold text-sm flex items-center gap-2 tracking-tight">{t.descricao}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{t.categoria}</p>
                         </div>
                      </div>
                      <p className={`font-black text-sm tracking-tighter ${t.tipo === 'saida' ? 'text-white' : 'text-emerald-500'}`}>
                        {t.tipo === 'saida' ? '- ' : '+ '}R$ {Number(t.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </p>
                   </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
