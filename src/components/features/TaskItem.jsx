import React, { useState } from 'react';
import { useDb } from '../../contexts/DbContext';
import { Circle, CheckCircle2, Link } from 'lucide-react';

export default function TaskItem({ tarefa }) {
  const { concluirTarefa } = useDb();
  const [loading, setLoading] = useState(false);

  const onToggleStatus = async () => {
    if (tarefa.status === 'feito') return;
    setLoading(true);
    try {
      await concluirTarefa(tarefa);
    } catch (error) {
       console.error(error);
       alert("Fundos insuficientes para concluir esta meta amarrada financeiramente!");
    } finally {
      setLoading(false);
    }
  };

  const isFeito = tarefa.status === 'feito';

  return (
    <div onClick={onToggleStatus} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${isFeito ? 'border-zinc-800/20 bg-zinc-950/20' : 'border-zinc-800 bg-zinc-900 hover:border-emerald-500/30'}`}>
      {loading ? <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> : isFeito ? <CheckCircle2 className="text-emerald-600" /> : <Circle className="text-zinc-600 group-hover:text-amber-500" />}
      <div className="flex-1">
        <p className={`font-semibold ${isFeito ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{tarefa.titulo}</p>
        {tarefa.metaId && <p className="text-xs text-amber-500 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider"><Link size={12}/> Meta atrelada</p>}
      </div>
    </div>
  );
}
