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
    <div className="w-full flex justify-center pb-24">
      <div className="w-full max-w-6xl px-6 py-6 animate-in fade-in duration-500">
        
        <header className="mb-6">
           <h1 className="text-3xl font-extrabold text-white flex items-center gap-3"><Wallet className="text-emerald-500" size={32}/> Finanças Reais</h1>
        </header>

        <div className="flex flex-col gap-6">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4">Nova Transação</h2>
            <form onSubmit={handleTx} className="space-y-4">
              <input required value={txDesc} onChange={e => setTxDesc(e.target.value)} type="text" placeholder="Nome (Ex: Mercado, Conta de Luz)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required value={txValor} onChange={e => setTxValor(e.target.value)} type="number" step="0.01" placeholder="Valor (R$)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                <select value={txTipo} onChange={e => setTxTipo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500">
                   <option value="saida">Saída (-)</option><option value="entrada">Entrada (+)</option>
                </select>
                <select required value={txCategoriaId} onChange={e => setTxCategoriaId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 outline-none focus:border-green-500">
                   {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <button disabled={loadingTx} className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {loadingTx ? 'Carregando...' : 'Registrar Transação'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[260px]">
              <h2 className="text-xl font-bold text-white mb-4">Teto de Gastos</h2>
              <form onSubmit={handleOrc} className="space-y-4 mb-4 shrink-0">
                <div className="flex gap-4">
                  <select required value={orcCatId} onChange={e => setOrcCatId(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 outline-none focus:border-green-500">
                     {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <input required value={orcLim} onChange={e => setOrcLim(e.target.value)} type="number" step="0.01" placeholder="Limite (R$)" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                  <button disabled={loadingOrc} className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                     {loadingOrc ? '...' : 'Definir'}
                  </button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 max-h-[160px]">
                {orcamentos.map(o => (
                   <div key={o.id} className="flex justify-between items-center text-sm p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                     <span className="text-zinc-200 font-bold">{o.categoriaNome}</span>
                     <span className="text-zinc-400 font-mono text-xs">Atual: <span className="text-white">R${o.valorGasto}</span> / Limite: <span className="text-green-500">R${o.limite}</span></span>
                   </div>
                ))}
                {orcamentos.length === 0 && <p className="text-center text-zinc-500 text-sm italic py-4">Nenhum orçamento fixado.</p>}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[260px]">
              <h2 className="text-xl font-bold text-white mb-4">Categorias Livres</h2>
              <form onSubmit={handleCat} className="space-y-4 mb-4 shrink-0">
                <div className="flex gap-4">
                  <input required value={newCatNome} onChange={e => setNewCatNome(e.target.value)} type="text" placeholder="Designar Nome" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                  <input type="color" value={newCatCor} onChange={e => setNewCatCor(e.target.value)} className="w-[58px] h-10 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer p-1 shrink-0" />
                </div>
                <div className="flex gap-4">
                  <select value={newCatTipo} onChange={e => setNewCatTipo(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 outline-none focus:border-green-500">
                     <option value="saida">Uso em Despesas</option>
                     <option value="entrada">Uso em Rendimentos</option>
                  </select>
                  <button disabled={loadingCat} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                     {loadingCat ? '...' : 'Adicionar'}
                  </button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 max-h-[160px]">
                {categorias.map(c => (
                   <div key={c.id} className="flex justify-between items-center text-sm px-4 py-2 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
                     <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: c.cor}}></span>
                        <span className="text-white font-semibold">{c.nome}</span>
                     </div>
                     {c.padrao && <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">Base</span>}
                   </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Repeat className="text-zinc-500" size={20}/> Contas Recorrentes</h2>
              <form onSubmit={handleRec} className="space-y-4 mb-4">
                <input required value={recNome} onChange={e => setRecNome(e.target.value)} type="text" placeholder="Nome (Ex: Netflix)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                <div className="grid grid-cols-3 gap-4">
                   <input required value={recValor} onChange={e => setRecValor(e.target.value)} type="number" step="0.01" placeholder="Valor" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                   <input required value={recDia} onChange={e => setRecDia(e.target.value)} type="number" min="1" max="31" placeholder="Venc." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                   <select required value={recCatId} onChange={e => setRecCatId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-zinc-300 outline-none focus:border-green-500">
                     {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                   </select>
                </div>
                <button disabled={loadingRec} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {loadingRec ? 'Carregando...' : <><Plus size={18}/> Automatizar Mensalidade</>}
                </button>
              </form>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {recorrentes.map(r => (
                  <div key={r.id} className={`flex justify-between items-center p-3 border rounded-lg transition-all ${r.ativo ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-transparent border-zinc-800/50 opacity-50'}`}>
                    <div>
                       <p className="text-white font-bold text-sm">{r.nome} <span className="text-[10px] text-zinc-400 font-normal border ml-2 border-zinc-700 bg-zinc-800 px-1.5 py-0.5 rounded">Dia {r.diaVencimento}</span></p>
                       <p className="text-xs font-mono text-zinc-400 mt-1">R$ {Number(r.valor).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => toggleRecorrenteAtivo(r.id, r.ativo)} className={`p-1.5 rounded transition-colors ${r.ativo ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}><Power size={16}/></button>
                       <button onClick={() => excluirRecorrente(r.id)} className="p-1.5 rounded transition-colors text-zinc-500 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {recorrentes.length === 0 && <p className="text-center text-zinc-500 text-sm italic py-4">Nenhuma assinatura agendada ainda.</p>}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px]">
              <h2 className="text-xl font-bold text-white mb-4">Extrato Vivo</h2>
              <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
                {transacoes.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(t => (
                   <div key={t.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-md ${t.tipo === 'saida' ? 'bg-rose-500/10' : 'bg-green-500/10'}`}>
                            {t.tipo === 'saida' ? <ArrowDownRight size={18} className="text-rose-500" /> : <ArrowUpRight size={18} className="text-green-500" />}
                         </div>
                         <div>
                            <p className="text-white font-bold text-sm flex items-center gap-2">{t.descricao} {t.isRecorrente && <Repeat size={12} className="text-zinc-500"/>}</p>
                            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-0.5">{t.categoria}</p>
                         </div>
                      </div>
                      <p className={`font-black text-sm ${t.tipo === 'saida' ? 'text-white' : 'text-green-500'}`}>
                        {t.tipo === 'saida' ? '- ' : '+ '}R$ {Number(t.valor).toFixed(2)}
                      </p>
                   </div>
                ))}
                {transacoes.length === 0 && <div className="py-8 text-center text-zinc-500 text-sm italic">Nenhuma transação ainda</div>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
