import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { LoadingState } from "../components/LoadingState";
import { reportService } from "../services/report.service";
import { ReportOverview } from "../types";
import { getErrorMessage } from "../services/api";
import { statusLabels } from "../utils/format";
import { 
  CalendarCheck, Building2, BarChart3, AlertTriangle, 
  Download, TrendingUp, Minus, Ban, XCircle, History 
} from "lucide-react";

// Cores premium baseadas na paleta do Tailwind (Emerald, Amber, Rose, Indigo, Violet, Sky)
const COLORS = ["#10b981", "#f59e0b", "#f43f5e", "#6366f1", "#8b5cf6", "#0ea5e9"];

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

  const statusData = overview.byStatus.map((s) => ({ 
    name: statusLabels[s.status] || s.status, 
    total: s.total 
  }));
  
  const environmentData = overview.mostUsedEnvironments
    .filter((e) => e.environment)
    .map((e) => ({ name: e.environment!.name, total: e.total }));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Cabeçalho Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Relatórios e Métricas</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Análise detalhada do uso dos ambientes e status das reservas.</p>
        </div>
        <button className="flex items-center gap-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm">
          <Download className="h-4 w-4" /> Exportar PDF
        </button>
      </div>

      {/* Grid Superior de Métricas Principais */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reservas */}
        <div className="p-5 rounded-2xl border border-indigo-200 bg-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Total de reservas</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.totalReservations}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <CalendarCheck className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
            <TrendingUp className="h-3 w-3" /> <span>Crescimento estável</span>
          </div>
        </div>

        {/* Taxa de Ocupação */}
        <div className="p-5 rounded-2xl border border-emerald-200 bg-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Taxa de ocupação</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.occupancyRate}%</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-2">
            <Minus className="h-3 w-3" /> <span>Dentro da média</span>
          </div>
        </div>

        {/* Ambientes Ativos */}
        <div className="p-5 rounded-2xl border border-blue-200 bg-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">Ambientes ativos</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.activeEnvironments}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
            <TrendingUp className="h-3 w-3" /> <span>Total operacional</span>
          </div>
        </div>

        {/* No-show */}
        <div className="p-5 rounded-2xl border border-rose-200 bg-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-700">No-show</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.noShow}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-2">
            <Minus className="h-3 w-3" /> <span>Requer atenção</span>
          </div>
        </div>
      </div>

      {/* Secção de Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Donut */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6 flex flex-col">
          <h2 className="mb-6 text-lg font-bold text-slate-900 tracking-tight">Distribuição por Status</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  dataKey="total" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70}
                  outerRadius={100} 
                  paddingAngle={5}
                  stroke="none"
                >
                  {statusData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} className="drop-shadow-sm outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '500', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6 flex flex-col">
          <h2 className="mb-6 text-lg font-bold text-slate-900 tracking-tight">Ambientes mais solicitados</h2>
          <div className="flex-1 min-h-[300px]">
            {environmentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BarChart3 className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">Sem dados suficientes para gerar o gráfico.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={environmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid Inferior de Alertas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Cancelamentos */}
        <div className="p-5 rounded-2xl border border-amber-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Cancelamentos</p>
            <p className="text-2xl font-black text-slate-900">{overview.cancelled}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Ban className="h-6 w-6 text-amber-500" />
          </div>
        </div>

        {/* Recusas */}
        <div className="p-5 rounded-2xl border border-rose-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Recusas</p>
            <p className="text-2xl font-black text-slate-900">{overview.rejected}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-rose-500" />
          </div>
        </div>

        {/* Ocorrências */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Ocorrências registadas</p>
            <p className="text-2xl font-black text-slate-900">{overview.occurrencesCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <History className="h-6 w-6 text-slate-600" />
          </div>
        </div>
      </div>

    </div>
  );
}