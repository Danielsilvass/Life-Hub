export function calcularMediaDiaria(transacoes) {
   const now = new Date();
   const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
   
   let gastoVariavel = 0;
   transacoes.forEach(t => {
      const dataStr = t.data ? (t.data.toDate ? t.data.toDate() : new Date(t.data)) : new Date();
      if (t.tipo === "saida" && !t.isRecorrente && dataStr.getTime() >= inicioMes) {
         gastoVariavel += (Number(t.valor) || 0);
      }
   });

   const day = now.getDate() || 1; 
   return gastoVariavel / day;
}

export function preverGastoMensal(transacoes) {
   const now = new Date();
   const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
   
   const mediaDiariaVariavel = calcularMediaDiaria(transacoes);
   const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
   const previsaoVariaveisFutura = mediaDiariaVariavel * ultimoDia;

   let totalRecorrenteFixo = 0;
   transacoes.forEach(t => {
      const dataStr = t.data ? (t.data.toDate ? t.data.toDate() : new Date(t.data)) : new Date();
      if (t.tipo === "saida" && t.isRecorrente && dataStr.getTime() >= inicioMes) {
         totalRecorrenteFixo += (Number(t.valor) || 0);
      }
   });

   return previsaoVariaveisFutura + totalRecorrenteFixo;
}

export function detectarRisco(orcamentos, previsaoGasto) {
   const limiteTotal = orcamentos.reduce((acc, o) => acc + (Number(o.limite) || 0), 0);
   if (limiteTotal === 0) return "Sem referencial";
   if (previsaoGasto > limiteTotal) return "Perigo: Rombo Financeiro Iminente";
   if (previsaoGasto > limiteTotal * 0.85) return "Atenção: Margem de Risco Alta";
   return "Seguro";
}

export function calcularIMC(peso, altura) {
   if (!peso || !altura) return 0;
   const h = Number(altura) / 100;
   return (Number(peso) / (h * h)).toFixed(1);
}

export function previsaoMetaPeso(pesoAtual, pesoObjetivo, pesoLogs) {
   if (!pesoAtual || !pesoObjetivo || pesoLogs.length < 2) return "Insuficiente";
   
   const sorted = [...pesoLogs].sort((a, b) => {
      const db = b.data?.toDate ? b.data.toDate().getTime() : 0;
      const da = a.data?.toDate ? a.data.toDate().getTime() : 0;
      return db - da; // mais recente primeiro
   });

   const pRecente = sorted[0].peso;
   const pAntigo = sorted[sorted.length - 1].peso;
   const tRecente = sorted[0].data?.toDate ? sorted[0].data.toDate().getTime() : Date.now();
   const tAntigo = sorted[sorted.length - 1].data?.toDate ? sorted[sorted.length - 1].data.toDate().getTime() : Date.now();
   
   const dias = (tRecente - tAntigo) / (1000 * 3600 * 24);
   if (dias === 0) return "Insuficiente";

   const diffRate = (pRecente - pAntigo) / dias;
   if (diffRate === 0) return "Estagnado";

   const targetDiff = Number(pesoObjetivo) - pRecente;
   
   if ((targetDiff > 0 && diffRate < 0) || (targetDiff < 0 && diffRate > 0)) {
       return "Direção Oposta";
   }

   const diasRestantes = targetDiff / diffRate;
   if (diasRestantes < 0) return "Atingido";

   const dataPrevista = new Date(Date.now() + (diasRestantes * 24 * 3600 * 1000));
   return dataPrevista.toLocaleDateString("pt-BR");
}

export function calcularFrequenciaTreino(treinos) {
   const now = Date.now();
   const seteDiasAtras = now - (7 * 24 * 3600 * 1000);
   
   return treinos.filter(t => {
      const data = t.data?.toDate ? t.data.toDate().getTime() : new Date(t.data).getTime();
      return data >= seteDiasAtras;
   }).length;
}
