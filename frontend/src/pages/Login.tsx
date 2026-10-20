import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Lado Esquerdo - Imagem e Texto (Aparece apenas em telas grandes) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-[2000ms] group-hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-20 h-full w-full">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Sistema de Reserva
            </span>
          </div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Faça suas reservas <br />
              de salas e laboratórios.
            </h1>
            <p className="text-lg text-slate-300 max-w-md font-medium leading-relaxed">
              Acesse a plataforma para reservar salas e laboratórios de forma
              simples e inteligente.
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário Ultra Clean */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 relative bg-slate-50/30">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sistema de Reserva
            </h2>
          </div>

          <div className="mb-10">
            {/* Título com gradiente subtil */}
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Insira suas credenciais para acessar a plataforma.
            </p>
          </div>

          {/* Exibição de Mensagem de Erro (se houver) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600 transition-all duration-300 shadow-sm outline-none disabled:opacity-50"
                  placeholder="usuario@sistema.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Senha
                </label>
                <a
                  href="#"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600 transition-all duration-300 shadow-sm outline-none disabled:opacity-50"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botão com loading state */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-200 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Acessar Sistema
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Área de Cadastro */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Ainda não tem acesso?{" "}
              <a
                href="/cadastro"
                className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Cadastre-se
              </a>
            </p>
          </div>

          <div className="mt-10 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Credenciais para Teste
            </h4>
            <div className="text-xs text-slate-600 space-y-2 font-mono">
              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-900">Admin</span>
                <span className="text-slate-500">admin@sistema.com</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-900">Gestor</span>
                <span className="text-slate-500">gestor@sistema.com</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-900">Usuário</span>
                <span className="text-slate-500">usuario@sistema.com</span>
              </div>
              <div className="text-center mt-3 text-slate-400">
                Senha única: <span className="font-bold text-slate-600">123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
