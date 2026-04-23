import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext';
import { Activity, Dumbbell, Scale, Apple, TrendingDown, Target, Zap } from 'lucide-react';
import { calcularIMC, previsaoMetaPeso, calcularFrequenciaTreino } from '../utils/predictions';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Health() {
  const { saudePerfil, pesoLogs, treinos, dieta, getTodayDiet, saveDiet, addHealthProfile, updateWeight, addWorkout, user } = useDb();
  
  // Profile Form
  const [altura, setAltura] = useState("");
  const [pesoObjetivo, setPesoObjetivo] = useState("");

  // Weight Log Form
  const [novoPeso, setNovoPeso] = useState("");

  // Workout Form
  const [tipoTreino, setTipoTreino] = useState("Calistenia");
  const [descTreino, setDescTreino] = useState("");
  const [duracao, setDuracao] = useState("45");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     if (saudePerfil) {
         setAltura(saudePerfil.altura || "");
         setPesoObjetivo(saudePerfil.pesoObjetivo || "");
     }
  }, [saudePerfil]);

  const [dietForm, setDietForm] = useState({
     cafeDaManha: "",
     almoco: "",
     lancheTarde: "",
     janta: "",
     ceia: ""
  });
  const [dietSaving, setDietSaving] = useState(false);
  const [dirtyDiet, setDirtyDiet] = useState(false);

  useEffect(() => {
     if (dirtyDiet) return; // evite sobrescrever se o user estiver digitando
     const dbDiet = getTodayDiet();
     if (dbDiet) {
        setDietForm({
           cafeDaManha: dbDiet.cafeDaManha || "",
           almoco: dbDiet.almoco || "",
           lancheTarde: dbDiet.lancheTarde || "",
           janta: dbDiet.janta || "",
           ceia: dbDiet.ceia || ""
        });
     }
  }, [dieta, dirtyDiet]);

  const handleSaveDiet = async () => {
      setDietSaving(true);
      try {
         await saveDiet(dietForm);
      } catch(e) { console.error(e); }
      setDietSaving(false);
      setDirtyDiet(false);
  };

  useEffect(() => {
     if (!dirtyDiet) return;
     const timeout = setTimeout(() => {
        handleSaveDiet();
     }, 1000);
     return () => clearTimeout(timeout);
  }, [dietForm, dirtyDiet]);

  const handleChangeDiet = (field, val) => {
     setDietForm(prev => ({ ...prev, [field]: val }));
     setDirtyDiet(true);
  };

  const handleSaveProfile = async () => {
     if (!altura || !pesoObjetivo) return;
     setLoading(true);
     await addHealthProfile({
        altura: Number(altura),
        pesoObjetivo: Number(pesoObjetivo)
     });
     setLoading(false);
  };

  const handleLogWeight = async () => {
    if (!novoPeso) return;
    setLoading(true);
    await updateWeight(novoPeso);
    setNovoPeso("");
    setLoading(false);
  };

  const handleAddWorkout = async () => {
    if (!descTreino || !duracao) return;
    setLoading(true);
    await addWorkout({
       tipo: tipoTreino,
       descricao: descTreino,
       duracao: Number(duracao)
    });
    setDescTreino("");
    setDuracao("45");
    setLoading(false);
  };

  // derived state
  const pesoAtual = saudePerfil?.pesoAtual || (pesoLogs.length > 0 ? pesoLogs.toReversed()[0].peso : 0);
  const imc = calcularIMC(pesoAtual, saudePerfil?.altura);
  const prevPeso = previsaoMetaPeso(pesoAtual, saudePerfil?.pesoObjetivo, pesoLogs);
  const freqTreino = calcularFrequenciaTreino(treinos);

  const handleDeleteWorkout = async (id) => {
    try { await deleteDoc(doc(db, `users/${user.uid}/treinos`, id)); } catch(e) { console.error(e); }
  };

  return (
    <div className="w-full flex justify-center pb-24">
      <div className="w-full max-w-6xl px-6 py-6 space-y-6 flex flex-col animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Saúde <Activity className="text-rose-500" size={26}/>
        </h1>
        <p className="text-zinc-400 mt-2 font-medium">Controle de métricas físicas, treinos e alimentação.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 space-y-6 flex flex-col">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Scale className="text-teal-500" size={22}/> Medidas e Peso</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <p className="text-zinc-400 text-xs font-bold uppercase mb-1">IMC Atual</p>
                      <p className="text-2xl font-black text-white">{imc > 0 ? imc : '--'}</p>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Previsão Meta</p>
                      <p className="text-2xl font-black text-teal-400">{prevPeso}</p>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 border-t border-zinc-800 pt-6">
                  <div className="flex-1 space-y-3">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase">Perfil Base</h3>
                      <input type="number" placeholder="Altura (cm)" value={altura} onChange={e=>setAltura(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                      <input type="number" step="0.1" placeholder="Meta de Peso (kg)" value={pesoObjetivo} onChange={e=>setPesoObjetivo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                      <button onClick={handleSaveProfile} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-1">Salvar Perfil</button>
                  </div>
                  <div className="w-px bg-zinc-800 hidden md:block"></div>
                  <div className="flex-1 space-y-3">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase">Registrar Peso Hoje</h3>
                      <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-3">
                          <p className="text-teal-500 font-bold flex items-center gap-2"><TrendingDown size={18}/> {pesoAtual ? `${pesoAtual} kg` : 'Nenhum registro'}</p>
                      </div>
                      <input type="number" step="0.1" placeholder="Novo Peso (kg)" value={novoPeso} onChange={e=>setNovoPeso(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                      <button onClick={handleLogWeight} disabled={loading || !novoPeso} className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-1">Logar Peso</button>
                  </div>
              </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col">
             <h2 className="text-xl font-bold text-white flex items-center gap-2"><Dumbbell className="text-violet-500" size={22}/> Treinos</h2>
             
             <div className="p-4 bg-violet-500/10 rounded-xl flex items-center justify-between border border-violet-500/20">
                 <div>
                    <p className="text-violet-500 font-bold text-sm">Frequência 7 dias</p>
                    <p className="text-2xl font-black text-white">{freqTreino} treinos</p>
                 </div>
                 <Zap size={32} className="text-violet-500 opacity-50"/>
             </div>

             <div className="space-y-3 border-t border-zinc-800 pt-6">
                <select value={tipoTreino} onChange={e=>setTipoTreino(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 outline-none focus:border-green-500">
                   <option>Calistenia</option>
                   <option>Academia</option>
                   <option>Cardio</option>
                </select>
                <input type="text" placeholder="Nome/Descrição do treino" value={descTreino} onChange={e=>setDescTreino(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                <input type="number" placeholder="Duração (min)" value={duracao} onChange={e=>setDuracao(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500" />
                <button onClick={handleAddWorkout} disabled={loading || !descTreino} className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">Salvar Treino</button>
             </div>

             <div className="flex-1 overflow-y-auto space-y-2 mt-4 custom-scrollbar pr-2 max-h-[140px]">
                 {[...treinos].reverse().slice(0, 5).map(t => (
                     <div key={t.id} className="text-sm bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/50 flex justify-between items-center transition-colors hover:border-zinc-600">
                         <div>
                             <p className="font-bold text-white leading-tight">{t.descricao}</p>
                             <div className="flex gap-2 items-center mt-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase font-semibold">{t.tipo}</span>
                                <span className="text-xs text-violet-400 font-mono">{t.duracao} min</span>
                             </div>
                         </div>
                         <button onClick={()=>handleDeleteWorkout(t.id)} className="text-zinc-500 hover:text-red-500 p-1 rounded transition-colors"><TrendingDown className="rotate-45" size={16}/></button>
                     </div>
                 ))}
             </div>
          </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
         <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex gap-2 flex-1"><Apple className="text-emerald-500" size={22}/> Dieta do Dia</h2>
            <button 
               onClick={handleSaveDiet} 
               disabled={dietSaving || !dirtyDiet}
               className="bg-green-500 hover:bg-green-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
            >
               {dietSaving ? "..." : (dirtyDiet ? "Pendente" : "Salvo")}
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
                <label className="text-emerald-500 font-bold text-sm">Café da Manhã</label>
                <textarea 
                    value={dietForm.cafeDaManha} 
                    onChange={e => handleChangeDiet("cafeDaManha", e.target.value)}
                    placeholder="Descrição..."
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:border-green-500 transition-colors custom-scrollbar"
                />
            </div>
            <div className="space-y-2">
                <label className="text-emerald-500 font-bold text-sm">Almoço</label>
                <textarea 
                    value={dietForm.almoco} 
                    onChange={e => handleChangeDiet("almoco", e.target.value)}
                    placeholder="Descrição..."
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:border-green-500 transition-colors custom-scrollbar"
                />
            </div>
            <div className="space-y-2">
                <label className="text-emerald-500 font-bold text-sm">Lanche da Tarde</label>
                <textarea 
                    value={dietForm.lancheTarde} 
                    onChange={e => handleChangeDiet("lancheTarde", e.target.value)}
                    placeholder="Descrição..."
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:border-green-500 transition-colors custom-scrollbar"
                />
            </div>
            <div className="space-y-2">
                <label className="text-emerald-500 font-bold text-sm">Janta</label>
                <textarea 
                    value={dietForm.janta} 
                    onChange={e => handleChangeDiet("janta", e.target.value)}
                    placeholder="Descrição..."
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:border-green-500 transition-colors custom-scrollbar"
                />
            </div>
            <div className="space-y-2">
                <label className="text-emerald-500 font-bold text-sm">Ceia <span className="opacity-50 text-xs font-normal">(Opcional)</span></label>
                <textarea 
                    value={dietForm.ceia} 
                    onChange={e => handleChangeDiet("ceia", e.target.value)}
                    placeholder="Descrição..."
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:border-green-500 transition-colors custom-scrollbar"
                />
            </div>
         </div>
      </div>

      </div>
    </div>
  );
}
