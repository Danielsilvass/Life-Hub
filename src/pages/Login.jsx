import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      alert("Falha ao Autenticar");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6">Acesso Protegido</h1>
        <form onSubmit={handleLogin} className="space-y-4">
           <input 
             className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
             type="email" 
             placeholder="E-mail"
             onChange={e => setEmail(e.target.value)}
           />
           <input 
             className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
             type="password" 
             placeholder="Senha"
             onChange={e => setPassword(e.target.value)}
           />
           <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <LogIn size={20} /> Entrar
           </button>
        </form>
      </div>
    </div>
  );
}
