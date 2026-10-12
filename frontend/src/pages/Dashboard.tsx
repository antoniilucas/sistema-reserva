import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarPlus, CalendarCheck, Clock, History, Building2, Users, 
  AlertTriangle, BarChart3, ChevronRight, Plus, Download, TrendingUp, Minus 
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { LoadingState } from "../components/LoadingState";
import { reservationService } from "../services/reservation.service";
import { reportService } from "../services/report.service";
import { Reservation, ReportOverview } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate, formatTime } from "../utils/format";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "ADMINISTRADOR" || user?.role === "GESTOR") {
    return <ManagementDashboard />;
  }
  return <RequesterDashboard />;
}

/* =========================================
   DASHBOARD DO SOLICITANTE
========================================= */
function RequesterDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    reservationService
      .list({ mine: "true" })
      .then(setReservations)
      .catch((err) => console.error("Erro ao carregar reservas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const now = new Date();
  const upcoming = reservations.filter((r) => {
    if (r.status !== "APROVADA") return false;
    const dataBase = String(r.date).split('T')[0];
    const dataReserva = new Date(`${dataBase}T${r.startTime}`);
    return dataReserva >= now;
  });

  const pending = reservations.filter((r) => ["PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA", "SOLICITADA"].includes(r.status));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Acompanhe as suas reservas de espaços.</p>
        </div>
        <Link to="/reservas/nova" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 px-5 transition-all shadow-md">
          <CalendarPlus className="h-4 w-4" /> Nova Reserva
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Cartão Simples 1 */}
        <div className="p-5 rounded-2xl border border-emerald-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Próximas reservas</p>
            <p className="text-3xl font-black text-slate-900">{upcoming.length}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <CalendarCheck className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        {/* Cartão Simples 2 */}
        <div className="p-5 rounded-2xl border border-amber-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Pendentes</p>
            <p className="text-3xl font-black text-slate-900">{pending.length}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   DASHBOARD ADMINISTRATIVO (PREMIUM)
========================================= */
function ManagementDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [pending, setPending] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([reportService.overview(), reservationService.pendingApprovals()])
      .then(([o, p]) => {
        setOverview(o);
        setPending(p);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error || !overview) return <div className="py-20 text-center text-red-500 font-medium">Erro ao carregar dados do servidor.</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      
      {/* Banner Laranja de Alertas */}
      {pending.length > 0 && (
        <div className="bg-amber-500 rounded-xl text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium shadow-md shadow-amber-500/20">
          <AlertTriangle className="h-4 w-4" />
          <span>Você tem {pending.length} novas solicitações de reservas pendentes.</span>
          <Link to="/aprovacoes" className="underline font-bold hover:text-amber-100">Clique aqui para revisar.</Link>
        </div>
      )}

      {/* Cabeçalho de Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Administrativo
            </h1>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Aprovado</span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">Visão geral do sistema e aprovações pendentes em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition-colors">
            <Plus className="h-4 w-4" /> Novo Ambiente
          </button>
          <button className="flex items-center gap-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Exportar Relatório
          </button>
        </div>
      </div>

      {/* Grid de Cartões Premium */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-2">
        
        {/* Total Reservas */}
        <div className="p-5 rounded-2xl border border-purple-200 bg-white shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Total de reservas</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.totalReservations}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <CalendarCheck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
            <TrendingUp className="h-3 w-3" /> <span>12% vs mês passado</span>
          </div>
        </div>

        {/* Pendentes */}
        <div className="p-5 rounded-2xl border border-amber-200 bg-white shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Pendentes</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.pending}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
            <TrendingUp className="h-3 w-3" /> <span>12% vs mês passado</span>
          </div>
        </div>

        {/* Ambientes Ativos */}
        <div className="p-5 rounded-2xl border border-blue-200 bg-white shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Ambientes ativos</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.activeEnvironments || 5}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
            <TrendingUp className="h-3 w-3" /> <span>12% vs mês passado</span>
          </div>
        </div>

        {/* Ocupação */}
        <div className="p-5 rounded-2xl border border-emerald-200 bg-white shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Ocupação</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.occupancyRate || '33.3'}%</p>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-12 text-emerald-400 opacity-60" viewBox="0 0 50 20" fill="none">
                <path d="M0 15 Q 10 5, 20 10 T 40 5 L 50 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-2">
            <Minus className="h-3 w-3" /> <span>Estável</span>
          </div>
        </div>

        {/* Aprovadas */}
        <div className="p-5 rounded-2xl border border-emerald-200 bg-white shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Aprovadas</p>
              <p className="text-2xl font-black text-slate-900">{overview.approved}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> <span>12% vs mês passado</span>
          </div>
        </div>

        {/* Recusadas */}
        <div className="p-5 rounded-2xl border border-red-200 bg-white shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Recusadas</p>
              <p className="text-2xl font-black text-slate-900">{overview.rejected}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Minus className="h-3 w-3" /> <span>Estável</span>
          </div>
        </div>

        {/* No-show */}
        <div className="p-5 rounded-2xl border border-red-200 bg-white shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">No-show</p>
              <p className="text-2xl font-black text-slate-900">{overview.noShow}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Users className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Minus className="h-3 w-3" /> <span>Estável</span>
          </div>
        </div>

        {/* Ocorrências */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Ocorrências</p>
              <p className="text-2xl font-black text-slate-900">{overview.occurrencesCount}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <History className="h-4 w-4 text-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Minus className="h-3 w-3" /> <span>Estável</span>
          </div>
        </div>

      </div>

      {/* Lista de Solicitações Pendentes (Estilo Gradient) */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm mt-4">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Solicitações Pendentes</h2>
          <Link to="/aprovacoes" className="text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center">
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="p-5 space-y-3">
          {pending.length === 0 ? (
            <p className="text-center text-slate-400 py-6 text-sm">Nenhuma solicitação no momento.</p>
          ) : (
            pending.slice(0, 5).map((r, index) => (
              <div key={r.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md cursor-default
                ${index % 2 === 0 ? 'bg-gradient-to-r from-purple-50/50 to-white border-purple-100' : 'bg-gradient-to-r from-amber-50/50 to-white border-amber-100'}
              `}>
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border shadow-sm
                    ${index % 2 === 0 ? 'bg-purple-100 border-purple-200' : 'bg-amber-100 border-amber-200'}
                  `}>
                    <Clock className={`h-5 w-5 ${index % 2 === 0 ? 'text-purple-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{r.environment?.name || 'Ambiente'}</p>
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Solicitante</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {formatDate(r.date)} · {formatTime(r.startTime)} às {formatTime(r.endTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Avatares Mockados (Design Premium) */}
                  <div className="hidden sm:flex items-center -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=11" alt="" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=33" alt="" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=47" alt="" />
                  </div>
                  
                  <div className="scale-90">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}