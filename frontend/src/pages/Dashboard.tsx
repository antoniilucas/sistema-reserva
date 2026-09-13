import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, CalendarCheck, Clock, History, Building2, Users, AlertTriangle, BarChart3 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { StatCard } from "../components/Card";
import { LoadingState } from "../components/LoadingState";
import { reservationService } from "../services/reservation.service";
import { reportService } from "../services/report.service";
import { Reservation, ReportOverview } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate, formatTime } from "../utils/format";
import { Button } from "../components/Button";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "ADMINISTRADOR" || user?.role === "GESTOR") {
    return <ManagementDashboard />;
  }
  return <RequesterDashboard />;
}

function RequesterDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationService
      .list({ mine: "true" })
      .then(setReservations)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const now = new Date();
  const upcoming = reservations.filter((r) => new Date(r.startTime) >= now && r.status === "APROVADA");
  const pending = reservations.filter((r) => ["PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA", "SOLICITADA"].includes(r.status));
  const inUse = reservations.filter((r) => r.status === "EM_USO");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Meu Dashboard</h1>
        <Link to="/reservas/nova">
          <Button>
            <CalendarPlus className="h-4 w-4" /> Nova Reserva
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Próximas reservas" value={upcoming.length} icon={<CalendarCheck className="h-5 w-5" />} tone="success" />
        <StatCard label="Pendentes" value={pending.length} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <StatCard label="Em uso" value={inUse.length} icon={<Building2 className="h-5 w-5" />} tone="info" />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Próximas reservas</h2>
          <Link to="/reservas" className="text-sm text-brand-600 hover:underline">
            Ver todas
          </Link>
        </div>
        {reservations.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Você ainda não possui reservas.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {reservations.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{r.environment.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(r.date)} · {formatTime(r.startTime)} - {formatTime(r.endTime)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ManagementDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [pending, setPending] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.overview(), reservationService.pendingApprovals()])
      .then(([o, p]) => {
        setOverview(o);
        setPending(p);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !overview) return <LoadingState />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">
        {user?.role === "ADMINISTRADOR" ? "Dashboard Administrativo" : "Dashboard do Gestor"}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de reservas" value={overview.totalReservations} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard label="Pendentes de aprovação" value={overview.pending} icon={<Clock className="h-5 w-5" />} tone="warning" />
        {user?.role === "ADMINISTRADOR" && (
          <>
            <StatCard label="Ambientes ativos" value={overview.activeEnvironments} icon={<Building2 className="h-5 w-5" />} tone="info" />
            <StatCard label="Taxa de ocupação" value={`${overview.occupancyRate}%`} icon={<BarChart3 className="h-5 w-5" />} tone="success" />
          </>
        )}
        <StatCard label="Aprovadas" value={overview.approved} icon={<CalendarCheck className="h-5 w-5" />} tone="success" />
        <StatCard label="Recusadas" value={overview.rejected} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <StatCard label="No-show" value={overview.noShow} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <StatCard label="Ocorrências" value={overview.occurrencesCount} icon={<History className="h-5 w-5" />} />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Solicitações pendentes</h2>
          <Link to="/aprovacoes" className="text-sm text-brand-600 hover:underline">
            Ver todas
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Nenhuma solicitação pendente no momento.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {pending.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {r.environment.name} · {r.requestedBy.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(r.date)} · {formatTime(r.startTime)} - {formatTime(r.endTime)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
