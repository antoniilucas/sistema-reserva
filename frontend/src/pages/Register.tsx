import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Cadastro realizado! Você já pode reservar ambientes.");
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-700 via-brand-600 to-slate-900 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-brand-600 p-3 text-white"><Building2 className="h-8 w-8" /></div>
          <h1 className="text-xl font-bold text-slate-800">Criar sua conta</h1>
          <p className="text-sm text-slate-500">Cadastre-se para reservar salas e laboratórios</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-slate-600">Nome completo</label>
            <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-600">E-mail</label>
            <input id="email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@instituicao.edu.br" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-600">Senha</label>
            <input id="password" required type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-600">Confirme sua senha</label>
            <input id="confirmPassword" required type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Digite a senha novamente" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar conta
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Já tem uma conta? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
