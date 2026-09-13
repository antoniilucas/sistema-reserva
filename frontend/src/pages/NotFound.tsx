import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-slate-500">
      <h1 className="text-4xl font-bold text-slate-700">404</h1>
      <p>Página não encontrada.</p>
      <Link to="/dashboard" className="text-brand-600 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
