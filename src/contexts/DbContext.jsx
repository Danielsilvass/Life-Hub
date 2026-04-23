import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, query, onSnapshot, writeBatch, increment, serverTimestamp, updateDoc, getDoc, setDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const DbContext = createContext();

export function useDb() {
  return useContext(DbContext);
}

export function DbProvider({ children }) {
  const { user } = useAuth();
  
  const [transacoes, setTransacoes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [listaCompras, setListaCompras] = useState([]);
  const [metas, setMetas] = useState([]);
  const [dieta, setDieta] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [recorrentes, setRecorrentes] = useState([]);
  
  const [brainstorm, setBrainstorm] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [saudePerfil, setSaudePerfil] = useState(null);
  const [pesoLogs, setPesoLogs] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [habitos, setHabitos] = useState([]);


  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    let isInitCatOnTheWay = false;
    const initCategorias = async (uid) => {
       if (isInitCatOnTheWay) return;
       isInitCatOnTheWay = true;
       try {
           const catRef = collection(db, `users/${uid}/categorias`);
           const querySnap = await getDocs(catRef);
           
           if (querySnap.empty) {
              const defaultCats = [
                 {nome: "Alimentação", tipo: "saida", cor: "#22c55e", icone: "shopping-cart", padrao: true},
                 {nome: "Transporte", tipo: "saida", cor: "#3b82f6", icone: "car", padrao: true},
                 {nome: "Moradia", tipo: "saida", cor: "#f59e0b", icone: "home", padrao: true},
                 {nome: "Lazer", tipo: "saida", cor: "#ec4899", icone: "smile", padrao: true},
                 {nome: "Saúde", tipo: "saida", cor: "#ef4444", icone: "heart", padrao: true},
                 {nome: "Assinaturas", tipo: "saida", cor: "#8b5cf6", icone: "tv", padrao: true},
                 {nome: "Outros", tipo: "saida", cor: "#64748b", icone: "box", padrao: true},
                 {nome: "Salário", tipo: "entrada", cor: "#10b981", icone: "dollar-sign", padrao: true}
              ];
              const batch = writeBatch(db);
              defaultCats.forEach(c => {
                 batch.set(doc(collection(db, `users/${uid}/categorias`)), c);
              });
              await batch.commit();
           } else {
              // Limpeza retrospectiva de duplicados gerados pelo StrictMode React no Firebase antigo:
              const seen = new Set();
              const batch = writeBatch(db);
              let hasDuplicates = false;
              querySnap.forEach(docSnap => {
                  const nome = docSnap.data().nome;
                  if (seen.has(nome)) {
                      batch.delete(docSnap.ref);
                      hasDuplicates = true;
                  } else {
                      seen.add(nome);
                  }
              });
              if (hasDuplicates) {
                  await batch.commit();
              }
           }
       } finally {
           isInitCatOnTheWay = false;
       }
    };

    const processarRecorrentesGlobal = async (uid) => {
       const recRef = collection(db, `users/${uid}/recorrentes`);
       const recSnap = await getDocs(recRef);
       if (recSnap.empty) return;

       const orcSnap = await getDocs(collection(db, `users/${uid}/orcamentos`));
       const orcamentosArray = orcSnap.docs.map(d => ({id: d.id, ...d.data()}));

       const agora = new Date();
       const mm = String(agora.getMonth() + 1).padStart(2, '0');
       const yyyy = agora.getFullYear();
       const mesAtualStr = `${yyyy}-${mm}`;

       const batch = writeBatch(db);
       let temAlteracao = false;

       recSnap.forEach(docSnap => {
           const r = {id: docSnap.id, ...docSnap.data()};
           if (!r.ativo) return;
           if (r.ultimoProcessamento !== mesAtualStr) {
               const dataVenc = new Date(yyyy, agora.getMonth(), Number(r.diaVencimento), 12, 0, 0);

               const transRef = doc(collection(db, `users/${uid}/transacoes`));
               batch.set(transRef, {
                   tipo: r.tipo || "saida",
                   valor: r.valor,
                   descricao: `Rec.: ${r.nome}`,
                   categoria: r.categoriaNome || "Assinaturas",
                   categoriaId: r.categoriaId || null,
                   data: dataVenc,
                   isRecorrente: true,
                   createdAt: serverTimestamp()
               });

               const orcAssoc = orcamentosArray.find(o => o.categoriaId === r.categoriaId || o.categoriaNome === r.categoriaNome);
               if (orcAssoc) {
                   batch.update(doc(db, `users/${uid}/orcamentos`, orcAssoc.id), {
                       valorGasto: increment(Number(r.valor))
                   });
               }

               batch.update(docSnap.ref, { ultimoProcessamento: mesAtualStr });
               temAlteracao = true;
           }
       });
       if (temAlteracao) await batch.commit();
    };

    initCategorias(uid).catch(console.error);
    processarRecorrentesGlobal(uid).catch(console.error);

    const unSubs = [
      onSnapshot(query(collection(db, `users/${uid}/transacoes`)), snap => {
        setTransacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/orcamentos`)), snap => {
        setOrcamentos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/tarefas`)), snap => {
        setTarefas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/lista_compras`)), snap => {
        setListaCompras(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/metas_financeiras`)), snap => {
        setMetas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/dieta`)), snap => {
        setDieta(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/eventos`)), snap => {
        setEventos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/categorias`)), snap => {
        setCategorias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/recorrentes`)), snap => {
        setRecorrentes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/brainstorm`)), snap => {
        setBrainstorm(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/wishlist`)), snap => {
        setWishlist(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/treinos`)), snap => {
        setTreinos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/peso_logs`)), snap => {
        setPesoLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(db, `users/${uid}/habitos`)), snap => {
        setHabitos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(doc(db, `users/${uid}/saude/perfil`), snap => {
        if (snap.exists()) setSaudePerfil({ id: snap.id, ...snap.data() });
        else setSaudePerfil(null);
      })
    ];

    return () => unSubs.forEach(unsub => unsub());
  }, [user]);

  const adicionarTransacao = async (dados) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const batch = writeBatch(db);
      
      const transacaoRef = doc(collection(db, `users/${uid}/transacoes`));
      batch.set(transacaoRef, {
        ...dados,
        createdAt: serverTimestamp()
      });

      if (dados.tipo === 'saida' && dados.categoria) {
         const orcAssoc = orcamentos.find(o => o.categoriaNome === dados.categoria);
         if (orcAssoc) {
             const orcRef = doc(db, `users/${uid}/orcamentos`, orcAssoc.id);
             batch.update(orcRef, { valorGasto: increment(Number(dados.valor)) });
         }
      }

      await batch.commit();
    } catch (error) { 
      console.error("Erro em adicionarTransacao:", error);
      throw error; 
    }
  };

  const adicionarOrcamento = async (dados) => {
    if (!user) return;
    try {
      const nomeLimpo = (dados.categoriaNome || "orcamento").replace(/\s+/g,'');
      const id = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}_${nomeLimpo}`;
      await setDoc(doc(db, `users/${user.uid}/orcamentos`, id), {
        ...dados,
        valorGasto: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) { 
      console.error("Erro em adicionarOrcamento:", error);
      throw error; 
    }
  };

  const adicionarRecorrente = async (dados) => {
    if (!user) return;
    try {
       await addDoc(collection(db, `users/${user.uid}/recorrentes`), {
         ...dados,
         ativo: true,
         createdAt: serverTimestamp(),
         ultimoProcessamento: null // garante que o processador pode agir
       });
    } catch(err) { console.error("Erro addRecorrente", err); throw err; }
  };

  const toggleRecorrenteAtivo = async (id, estadoAtual) => {
    if (!user) return;
    try {
       await updateDoc(doc(db, `users/${user.uid}/recorrentes`, id), {
          ativo: !estadoAtual,
          updatedAt: serverTimestamp()
       });
    } catch(err) { console.error(err); throw err; }
  };

  const excluirRecorrente = async (id) => {
    if (!user) return;
    try {
       await deleteDoc(doc(db, `users/${user.uid}/recorrentes`, id));
    } catch(err) { console.error(err); throw err; }
  };

  const adicionarCategoria = async (dados) => {
    if (!user) return;
    try {
       await addDoc(collection(db, `users/${user.uid}/categorias`), {
          ...dados,
          padrao: false,
          createdAt: serverTimestamp()
       });
    } catch(err) { console.error(err); throw err; }
  };

  const adicionarEvento = async (dados) => {
    if (!user) return;
    try {
       await addDoc(collection(db, `users/${user.uid}/eventos`), {
        ...dados,
        createdAt: serverTimestamp()
      });
    } catch (error) { 
        console.error("Erro em adicionarEvento:", error);
        throw error; 
    }
  };

  const adicionarTarefa = async (dados) => {
    if (!user) return;
    try {
       await addDoc(collection(db, `users/${user.uid}/tarefas`), {
        ...dados,
        status: "a_fazer",
        createdAt: serverTimestamp()
      });
    } catch (error) { 
        console.error("Erro em adicionarTarefa:", error);
        throw error; 
    }
  };

  const adicionarItemLista = async (dadosDoItem) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/lista_compras`), {
        ...dadosDoItem,
        status: "pendente",
        createdAt: serverTimestamp()
      });
    } catch (error) { 
        console.error("Erro em adicionarItemLista:", error);
        throw error; 
    }
  };

  const comprarItem = async (item) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const batch = writeBatch(db);

      const itemRef = doc(db, `users/${uid}/lista_compras`, item.id);
      batch.update(itemRef, { status: "comprado" });

      const valorSaida = Number(item.custoEstimado) || 0;
      const transacaoRef = doc(collection(db, `users/${uid}/transacoes`));
      batch.set(transacaoRef, {
        tipo: "saida",
        valor: valorSaida,
        data: serverTimestamp(),
        descricao: `Compras: ${item.nome}`
      });

      if (item.orcamentoId) {
        const orcamentoRef = doc(db, `users/${uid}/orcamentos`, item.orcamentoId);
        batch.update(orcamentoRef, { valorGasto: increment(valorSaida) });
      }

      await batch.commit();
    } catch (error) { 
        console.error("Erro em comprarItem:", error);
        throw error; 
    }
  };

  const concluirTarefa = async (tarefa) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const taskRef = doc(db, `users/${uid}/tarefas`, tarefa.id);

      if (!tarefa.metaId) {
        const tempBatch = writeBatch(db);
        tempBatch.update(taskRef, { status: "feito" });
        await tempBatch.commit();
        return;
      }

      const metaRef = doc(db, `users/${uid}/metas_financeiras`, tarefa.metaId);
      const metaSnap = await getDoc(metaRef);
      if (!metaSnap.exists()) return;

      const saldoMeta = metaSnap.data().valorAcumulado || 0;
      const custo = Number(tarefa.custo) || 0;

      if (saldoMeta >= custo) {
        const batch = writeBatch(db);
        
        batch.update(taskRef, { status: "feito" });
        batch.update(metaRef, { valorAcumulado: increment(-custo) });

        const transacaoRef = doc(collection(db, `users/${uid}/transacoes`));
        batch.set(transacaoRef, {
            tipo: "saida",
            valor: custo,
            descricao: `Tarefa Executada: ${tarefa.titulo}`,
            metaId: tarefa.metaId,
            data: serverTimestamp()
        });

        await batch.commit();
      } else {
        throw new Error("Saldo Insuficiente na Meta.");
      }
    } catch (error) { 
        console.error("Erro em concluirTarefa:", error);
        throw error; 
    }
  };

  const getTodayDiet = () => {
     const tzoffset = (new Date()).getTimezoneOffset() * 60000;
     const todayStr = new Date(Date.now() - tzoffset).toISOString().split('T')[0];
     return dieta.find(d => d.id === todayStr) || null;
  };

  const saveDiet = async (dietData) => {
     if (!user) return;
     try {
       const tzoffset = (new Date()).getTimezoneOffset() * 60000;
       const todayStr = new Date(Date.now() - tzoffset).toISOString().split('T')[0];
       await setDoc(doc(db, `users/${user.uid}/dieta`, todayStr), {
         ...dietData,
         updatedAt: serverTimestamp()
       }, { merge: true });
     } catch (error) {
       console.error("Erro em saveDiet:", error);
       throw error;
     }
  };

  const addBrainstorm = async (dados) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/brainstorm`), {
        ...dados,
        status: "pendente",
        createdAt: serverTimestamp()
      });
    } catch (error) { 
        console.error("Erro em addBrainstorm:", error);
        throw error; 
    }
  };

  const convertBrainstormToTask = async (ideia) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const batch = writeBatch(db);
      
      const novaTarefaRef = doc(collection(db, `users/${uid}/tarefas`));
      batch.set(novaTarefaRef, {
         titulo: ideia.titulo,
         status: "a_fazer",
         prioridade: "3",
         createdAt: serverTimestamp()
      });

      const brainRef = doc(db, `users/${uid}/brainstorm`, ideia.id);
      batch.update(brainRef, { status: "convertido" });

      await batch.commit();
    } catch (error) { 
        console.error("Erro em convertBrainstormToTask:", error);
        throw error; 
    }
  };

  const addWishlistItem = async (dados) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/wishlist`), {
        ...dados,
        status: "pendente",
        createdAt: serverTimestamp()
      });
    } catch (error) { 
        console.error("Erro em addWishlistItem:", error);
        throw error; 
    }
  };

  const buyWishlistItem = async (item, orcamentoId) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const batch = writeBatch(db);

      const itemRef = doc(db, `users/${uid}/wishlist`, item.id);
      batch.update(itemRef, { status: "comprado" });

      const valorSaida = Number(item.valorEstimado) || 0;
      const transacaoRef = doc(collection(db, `users/${uid}/transacoes`));
      batch.set(transacaoRef, {
        tipo: "saida",
        valor: valorSaida,
        data: serverTimestamp(),
        descricao: `Wishlist: ${item.nome}`
      });

      if (orcamentoId) {
        const orcamentoRef = doc(db, `users/${uid}/orcamentos`, orcamentoId);
        batch.update(orcamentoRef, { valorGasto: increment(valorSaida) });
      }

      await batch.commit();
    } catch (error) { 
        console.error("Erro em buyWishlistItem:", error);
        throw error; 
    }
  };

  const addHealthProfile = async (dados) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/saude/perfil`), {
        ...dados,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) { 
        console.error("Erro em addHealthProfile:", error);
        throw error; 
    }
  };

  const updateWeight = async (peso) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const batch = writeBatch(db);

      const pesoLogRef = doc(collection(db, `users/${uid}/peso_logs`));
      batch.set(pesoLogRef, {
        peso: Number(peso),
        data: serverTimestamp()
      });

      const perfilRef = doc(db, `users/${uid}/saude/perfil`);
      batch.set(perfilRef, { pesoAtual: Number(peso), updatedAt: serverTimestamp() }, { merge: true });

      await batch.commit();
    } catch (error) { 
        console.error("Erro em updateWeight:", error);
        throw error; 
    }
  };

  const addWorkout = async (dados) => {
    if (!user) return;
    try {
      const uid = user.uid;
      const batch = writeBatch(db);

      const treinoRef = doc(collection(db, `users/${uid}/treinos`));
      batch.set(treinoRef, {
        ...dados,
        data: serverTimestamp()
      });

      const habitoTreinar = habitos.find(h => h.nome.toLowerCase() === "treinar");
      if (habitoTreinar) {
          const novoStreak = (habitoTreinar.streakAtual || 0) + 1;
          const maiorStreak = Math.max(novoStreak, habitoTreinar.streakMaior || 0);
          const habitoRef = doc(db, `users/${uid}/habitos`, habitoTreinar.id);
          batch.update(habitoRef, {
             streakAtual: novoStreak,
             streakMaior: maiorStreak
          });
      } else {
          const novoHabitoRef = doc(collection(db, `users/${uid}/habitos`));
          batch.set(novoHabitoRef, {
             nome: "Treinar",
             streakAtual: 1,
             streakMaior: 1,
             createdAt: serverTimestamp()
          });
      }

      await batch.commit();
    } catch (error) { 
        console.error("Erro em addWorkout:", error);
        throw error; 
    }
  };

  const value = {
    user,
    transacoes,
    orcamentos,
    tarefas,
    listaCompras,
    metas,
    dieta,
    eventos,
    categorias,
    recorrentes,
    brainstorm,
    wishlist,
    saudePerfil,
    pesoLogs,
    treinos,
    habitos,
    adicionarTransacao,
    adicionarOrcamento,
    adicionarEvento,
    adicionarTarefa,
    comprarItem,
    concluirTarefa,
    adicionarItemLista,
    adicionarRecorrente,
    toggleRecorrenteAtivo,
    excluirRecorrente,
    adicionarCategoria,
    getTodayDiet,
    saveDiet,
    addBrainstorm,
    convertBrainstormToTask,
    addWishlistItem,
    buyWishlistItem,
    addHealthProfile,
    updateWeight,
    addWorkout
  };

  return (
    <DbContext.Provider value={value}>
      {children}
    </DbContext.Provider>
  );
}
