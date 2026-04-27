import React from 'react';
import { useDb } from '../contexts/DbContext';
import { calcularMediaDiaria, preverGastoMensal, detectarRisco, calcularIMC } from '../utils/predictions';
import { AlertCircle, Target, TrendingUp, TrendingDown, CheckSquare, UtensilsCrossed, Sparkles, Lightbulb, ShoppingBag, Activity } from 'lucide-react';
import TaskItem from '../components/features/TaskItem';

export default function Dashboard() {
  const { orcamentos, transacoes, tarefas, getTodayDiet, brainstorm, wishlist, saudePerfil, pesoLogs } = useDb();

  const limiteGlob = orcamentos.reduce((acc, o) => acc + (Number(o.limite) || 0), 0);
  const totalGasto = transacoes.reduce((acc, t) => t.tipo === "saida" ? acc + (Number(t.valor) || 0) : acc, 0);

  const projecao = preverGastoMensal(transacoes);
  
  const statusRisco = detectarRisco(orcamentos, projecao);
  const isPerigo = statusRisco.includes("Perigo");
  const isAlerta = statusRisco.includes("Atenção");

  const topTarefas = tarefas.filter(t => t.status === "a_fazer")
       .sort((a, b) => (Number(a.prioridade) || 9) - (Number(b.prioridade) || 9)).slice(0, 3);

  const hojeDieta = getTodayDiet();

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const transacoesMes = transacoes.filter(t => {
      const dataStr = t.data ? (t.data.toDate ? t.data.toDate() : new Date(t.data)) : new Date();
      return (t.tipo === "saida" && dataStr.getTime() >= inicioMes);
  });

  const gastosPorCatObj = transacoesMes.reduce((acc, t) => {
      const cat = t.categoria || "Outros";
      acc[cat] = (acc[cat] || 0) + Number(t.valor);
      return acc;
  }, {});

  const topCategorias = Object.entries(gastosPorCatObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

  let proximaRefeicaoNome = "Refeição";
  let proximaRefeicaoValor = "Sem Planejamento";

  if (hojeDieta) {
      const now = new Date();
      const horaDec = now.getHours() + (now.getMinutes() / 60);

      if (horaDec < 10) {
          proximaRefeicaoNome = "Café da Manhã";
          proximaRefeicaoValor = hojeDieta.cafeDaManha;
      } else if (horaDec >= 10 && horaDec < 14) {
          proximaRefeicaoNome = "Almoço";
          proximaRefeicaoValor = hojeDieta.almoco;
      } else if (horaDec >= 14 && horaDec < 16.5) {
          proximaRefeicaoNome = "Lanche da Tarde";
          proximaRefeicaoValor = hojeDieta.lancheTarde;
      } else if (horaDec >= 16.5 && horaDec < 21) {
          proximaRefeicaoNome = "Janta";
          proximaRefeicaoValor = hojeDieta.janta;
      } else {
          proximaRefeicaoNome = "Ceia";
          proximaRefeicaoValor = hojeDieta.ceia;
      }

      if (!proximaRefeicaoValor) {
          proximaRefeicaoValor = "Não preenchido";
      }
  }

  const ultimasIdeias = brainstorm.filter(b => b.status === "pendente").slice(-3).reverse();
  const proximosDesejos = wishlist.filter(w => w.status === "pendente").slice(0, 3);
  
  const pesoAtual = saudePerfil?.pesoAtual || (pesoLogs.length > 0 ? pesoLogs.toReversed()[0].peso : 0);
  const imc = calcularIMC(pesoAtual, saudePerfil?.altura);

  return (
    <div className="w-full flex justify-center pb-8 lg:pb-12">
      <div className="w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-8 space-y-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-2">
             <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Segundo Cérebro <Sparkles className="text-emerald-500 shrink-0" size={26}/>
             </h1>
             <p className="text-zinc-400 mt-2 font-medium text-sm sm:text-base">Análise preditiva gerada. Eis o norte de hoje.</p>
        </header>

        {(isPerigo || isAlerta || (limiteGlob > 0 && totalGasto > limiteGlob)) && (
          <div className={`p-4 sm:p-5 rounded-2xl flex items-start gap-4 shadow-sm ${isPerigo || totalGasto > limiteGlob ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'}`}>
             <AlertCircle size={24} className="shrink-0 mt-0.5" />
             <div>
                <p className="font-bold text-base sm:text-lg mb-1">{statusRisco}</p>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                   O motor de projeção indica que seu gasto do mês esbarrará em <strong>R$ {projecao.toFixed(2)}</strong>.
                </p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
               <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-4 sm:mb-6">
                 <TrendingUp className="text-emerald-500" size={20}/> Visão Financeira
               </h2>
               <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                    <p className="text-zinc-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Real</p>
                    <p className="text-xl sm:text-2xl font-black text-white">R$ {totalGasto.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 relative overflow-hidden">
                    <p className="text-zinc-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Projeção</p>
                    <p className={`text-xl sm:text-2xl font-black ${isPerigo ? 'text-rose-500' : 'text-emerald-500'}`}>
                      R$ {projecao.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                    </p>
                  </div>
               </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-6">
               <div className={`h-1.5 rounded-full ${isPerigo ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (totalGasto/limiteGlob)*100 || 0)}%` }}></div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
               <CheckSquare className="text-amber-500" size={20}/> Intervenção Rápida
            </h2>
            <div className="space-y-3">
               {topTarefas.map(t => <TaskItem key={t.id} tarefa={t} />)}
               {topTarefas.length === 0 && (
                   <div className="text-center py-6 border border-dashed border-zinc-700 rounded-xl">
                       <p className="text-zinc-500 font-bold text-sm">Base limpa 🚀</p>
                   </div>
               )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <Target className="text-indigo-500" size={20}/> Top Categorias
              </h2>
              <div className="space-y-2 flex-1">
                 {topCategorias.map(([cat, val]) => (
                     <div key={cat} className="flex justify-between items-center p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                        <span className="text-zinc-300 font-bold text-xs tracking-wide uppercase">{cat}</span>
                        <span className="text-white font-black text-sm">R$ {val.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</span>
                     </div>
                 ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
               <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="text-amber-500" size={20}/> Ideias Rápidas
               </h2>
               <div className="space-y-2 flex-1">
                   {ultimasIdeias.map(id => (
                       <div key={id.id} className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                           <p className="text-sm font-bold text-white mb-1">{id.titulo}</p>
                           <p className="text-[10px] text-amber-500 font-bold uppercase">{id.categoria}</p>
                       </div>
                   ))}
                   {ultimasIdeias.length === 0 && <p className="text-center text-zinc-500 text-sm italic py-4">Nenhuma ideia.</p>}
               </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col relative overflow-hidden group min-h-[140px]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
               <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                  <UtensilsCrossed className="text-blue-500" size={20}/> Próxima Refeição
               </h2>
               <div className="flex-1 flex flex-col justify-center gap-1 relative z-10">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{proximaRefeicaoNome}</p>
                  <p className="text-lg sm:text-xl font-black text-white">{proximaRefeicaoValor}</p>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
