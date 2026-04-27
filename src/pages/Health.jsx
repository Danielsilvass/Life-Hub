import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext';
import { Activity, Dumbbell, Scale, Apple, TrendingDown, Target, Zap, CheckCircle } from 'lucide-react';
import { calcularIMC, previsaoMetaPeso, calcularFrequenciaTreino } from '../utils/predictions';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Health() {
  const { saudePerfil, pesoLogs, treinos, dieta, getTodayDiet, saveDiet, addHealthProfile, updateWeight, addWorkout, user, rotinaTreino, saveRotinaTreino, toggleTreinoDiario } = useDb();
  
  // Profile Form
  const [altura, setAltura] = useState("");
  const [pesoObjetivo, setPesoObjetivo] = useState("");

  // Weight Log Form
  const [novoPeso, setNovoPeso] = useState("");

  // Workout Form (Weekly Routine)
  const [workoutForm, setWorkoutForm] = useState({
      segunda: "",
      terca: "",
      quarta: "",
      quinta: "",
      sexta: "",
      sabado: "",
      domingo: ""
  });
  const [workoutSaving, setWorkoutSaving] = useState(false);
  const [dirtyWorkout, setDirtyWorkout] = useState(false);
  const [weekDates, setWeekDates] = useState({});
  
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

  useEffect(() => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const mondayDate = new Date(currentDate);
    mondayDate.setDate(currentDate.getDate() - diffToMonday);

    const dates = {};
    const dKeys = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
    dKeys.forEach((key, i) => {
        const dDate = new Date(mondayDate);
        dDate.setDate(mondayDate.getDate() + i);
        const tzoffset = dDate.getTimezoneOffset() * 60000;
        const dateStr = new Date(dDate.getTime() - tzoffset).toISOString().split('T')[0];
        dates[key] = dateStr;
    });
    setWeekDates(dates);
  }, []);

  useEffect(() => {
     if (dirtyWorkout) return;
     if (rotinaTreino) {
        setWorkoutForm({
           segunda: rotinaTreino.segunda || "",
           terca: rotinaTreino.terca || "",
           quarta: rotinaTreino.quarta || "",
           quinta: rotinaTreino.quinta || "",
           sexta: rotinaTreino.sexta || "",
           sabado: rotinaTreino.sabado || "",
           domingo: rotinaTreino.domingo || ""
        });
     }
  }, [rotinaTreino, dirtyWorkout]);

  const handleSaveWorkout = async () => {
      setWorkoutSaving(true);
      try {
         await saveRotinaTreino(workoutForm);
      } catch(e) { console.error(e); }
      setWorkoutSaving(false);
      setDirtyWorkout(false);
  };

  useEffect(() => {
     if (!dirtyWorkout) return;
     const timeout = setTimeout(() => {
        handleSaveWorkout();
     }, 1000);
     return () => clearTimeout(timeout);
  }, [workoutForm, dirtyWorkout]);

  const handleChangeWorkout = (field, val) => {
     setWorkoutForm(prev => ({ ...prev, [field]: val }));
     setDirtyWorkout(true);
  };

  const isWorkoutDone = (dateStr) => {
     return treinos.some(t => t.id === dateStr || t.dataISO === dateStr);
  };

  const handleToggleDone = async (dayKey) => {
     const dateStr = weekDates[dayKey];
     if (!dateStr) return;
     const isDone = isWorkoutDone(dateStr);
     const desc = workoutForm[dayKey] || "Treino Realizado";
     await toggleTreinoDiario(dateStr, !isDone, desc);
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
    <div className="w-full flex justify-center pb-8 lg:pb-12">
      <div className="w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-8 space-y-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Saúde <Activity className="text-rose-500 shrink-0" size={28}/>
        </h1>
        <p className="text-zinc-400 mt-2 font-medium text-sm sm:text-base">Métricas, treinos e alimentação.</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Scale className="text-teal-500" size={20}/> Medidas e Peso</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1">IMC Atual</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{imc > 0 ? imc : '--'}</p>
              </div>
              <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1">Meta</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">{prevPeso}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-800 pt-6 mt-6">
              <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Perfil Base</h3>
                  <input type="number" placeholder="Altura (cm)" value={altura} onChange={e=>setAltura(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  <input type="number" step="0.1" placeholder="Meta de Peso (kg)" value={pesoObjetivo} onChange={e=>setPesoObjetivo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  <button onClick={handleSaveProfile} disabled={loading} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">Salvar Perfil</button>
              </div>
              <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Log de Peso</h3>
                  <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-emerald-500 font-bold flex items-center gap-2"><TrendingDown size={18}/> {pesoAtual ? `${pesoAtual} kg` : 'Nenhum registro'}</p>
                  </div>
                  <input type="number" step="0.1" placeholder="Novo Peso (kg)" value={novoPeso} onChange={e=>setNovoPeso(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  <button onClick={handleLogWeight} disabled={loading || !novoPeso} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">Logar Peso</button>
              </div>
          </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
               <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Dumbbell className="text-violet-500" size={20}/> Treino Semanal</h2>
               <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                   <span className="text-violet-500 font-bold text-[10px] uppercase">Freq: {freqTreino}</span>
               </div>
            </div>
            <button 
               onClick={handleSaveWorkout} 
               disabled={workoutSaving || !dirtyWorkout}
               className="h-10 sm:h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold px-6 rounded-xl transition-all flex items-center justify-center"
            >
               {workoutSaving ? "..." : (dirtyWorkout ? "Salvar" : "Salvo")}
            </button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {[
              { key: "segunda", label: "Segunda" },
              { key: "terca", label: "Terça" },
              { key: "quarta", label: "Quarta" },
              { key: "quinta", label: "Quinta" },
              { key: "sexta", label: "Sexta" },
              { key: "sabado", label: "Sábado" },
              { key: "domingo", label: "Domingo" }
            ].map(day => {
               const dateStr = weekDates[day.key];
               const done = isWorkoutDone(dateStr);
               return (
                  <div key={day.key} className="space-y-2 flex flex-col">
                     <div className="flex justify-between items-center px-1">
                        <label className="text-violet-500 font-bold text-xs uppercase tracking-wider">{day.label}</label>
                        <button 
                           onClick={() => handleToggleDone(day.key)}
                           className={`p-1.5 rounded-full transition-all flex shadow-sm ${done ? 'bg-emerald-500 text-black scale-110' : 'bg-zinc-800 text-zinc-500 hover:text-emerald-500'}`}
                        >
                           <CheckCircle size={16} className={done ? "fill-black text-emerald-500 stroke-[3]" : ""} />
                        </button>
                     </div>
                     <textarea 
                        value={workoutForm[day.key]} 
                        onChange={e => handleChangeWorkout(day.key, e.target.value)}
                        placeholder="Descanso"
                        className={`w-full h-20 sm:h-24 bg-zinc-800 border ${done ? 'border-emerald-500/50' : 'border-zinc-700'} text-white rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all custom-scrollbar`}
                     />
                  </div>
               )
            })}
         </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
         <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex gap-2 flex-1"><Apple className="text-emerald-500" size={20}/> Dieta do Dia</h2>
            <button 
               onClick={handleSaveDiet} 
               disabled={dietSaving || !dirtyDiet}
               className="h-10 sm:h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold px-6 rounded-xl transition-all flex items-center justify-center"
            >
               {dietSaving ? "..." : (dirtyDiet ? "Salvar" : "Salvo")}
            </button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
                { key: "cafeDaManha", label: "Café da Manhã" },
                { key: "almoco", label: "Almoço" },
                { key: "lancheTarde", label: "Lanche da Tarde" },
                { key: "janta", label: "Janta" },
                { key: "ceia", label: "Ceia" }
            ].map(meal => (
                <div key={meal.key} className="space-y-2">
                    <label className="text-emerald-500 font-bold text-xs uppercase tracking-wider">{meal.label}</label>
                    <textarea 
                        value={dietForm[meal.key]} 
                        onChange={e => handleChangeDiet(meal.key, e.target.value)}
                        placeholder="O que comeu?"
                        className="w-full h-20 sm:h-24 bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all custom-scrollbar"
                    />
                </div>
            ))}
         </div>
      </div>

      </div>
    </div>
  );
}
