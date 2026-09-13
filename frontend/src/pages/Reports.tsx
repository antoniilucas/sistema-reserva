import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, StatCard } from "../components/Card";
import { LoadingState } from "../components/LoadingState";
import { reportService } from "../services/report.service";
import { ReportOverview } from "../types";
import { getErrorMessage } from "../services/api";
import { statusLabels } from "../utils/format";
import { CalendarCheck, Building2, BarChart3, AlertTriangle } from "lucide-react";

const COLORS = ["#2563eb", "#f59e0b", "#ef4444", "#10b981", "#6366f1", "#94a3b8", "#0ea5e9", "#f97316"];

export default function Reports() {
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .overview()
      .then(setOverview)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !overview) return <LoadingState />;

  const statusData = overview.byStatus.map((s) => ({ name: statusLabels[s.status] || s.status, total: s.total }));
  const environmentData = overview.mostUsedEnvironments
    .filter((e) => e.environment)
    .map((e) => ({ name: e.environment!.name, total: e.total }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Relatórios</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de reservas" value={overview.totalReservations} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard label="Taxa de ocupação" value={`${overview.occupancyRate}%`} icon={<BarChart3 className="h-5 w-5" />} tone="success" />
        <StatCard label="Ambientes ativos" value={overview.activeEnvironments} icon={<Building2 className="h-5 w-5" />} tone="info" />
        <StatCard label="No-show" value={overview.noShow} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Reservas por status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Ambientes mais utilizados</h2>
          {environmentData.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">Sem dados suficientes ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={environmentData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Cancelamentos" value={overview.cancelled} />
        <StatCard label="Recusas" value={overview.rejected} />
        <StatCard label="Ocorrências registradas" value={overview.occurrencesCount} />
      </div>
    </div>
  );
}
