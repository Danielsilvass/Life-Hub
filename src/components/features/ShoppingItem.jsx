import React, { useState } from 'react';
import { useDb } from '../../contexts/DbContext';
import { ShoppingCart, Check } from 'lucide-react';

export default function ShoppingItem({ item }) {
  const { comprarItem } = useDb();
  const [loading, setLoading] = useState(false);

  const onBuyClick = async () => {
    if (item.status === 'comprado') return;
    setLoading(true);
    try {
      await comprarItem(item);
    } catch (error) {
      alert("Erro ao debitar item da lista.");
    } finally {
      setLoading(false);
    }
  };

  const isComprado = item.status === 'comprado';

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all">
      <div>
        <h3 className={`font-semibold text-zinc-200 ${isComprado ? 'line-through text-zinc-600' : ''}`}>{item.nome}</h3>
        <p className="text-sm font-medium text-amber-500">R$ {Number(item.custoEstimado || 0).toFixed(2)}</p>
      </div>
      
      <button
        onClick={onBuyClick}
        disabled={isComprado || loading}
        className={`flex gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
          isComprado ? 'text-emerald-700/50 bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
        }`}
      >
        {isComprado ? <Check size={18} /> : <ShoppingCart size={18} />}
        {isComprado ? 'Feito' : 'Comprar'}
      </button>
    </div>
  );
}
