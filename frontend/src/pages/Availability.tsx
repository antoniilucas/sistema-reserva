import { useState } from "react";
import { toast } from "sonner";
import { Search, CalendarSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input, Select } from "../components/Input";
import { LoadingState } from "../components/LoadingState";
import { availabilityService } from "../services/availability.service";
import { Environment } from "../types";
import { environmentTypeLabels } from "../utils/format";
import { getErrorMessage } from "../services/api";

export default function Availability() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [environmentType, setEnvironmentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<Environment[]>([]);
  const [unavailable, setUnavailable] = useState<{ environment: Environment; reason?: string }[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!date || !startTime || !endTime) {
      toast.error("Preencha data, horário inicial e final.");
      return;
    }
    setLoading(true);
    try {
      const result = await availabilityService.search({ date, startTime, endTime, environmentType: environmentType || undefined });
      setAvailable(result.available);
      setUnavailable(result.unavailable);
      setSearched(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Consultar Disponibilidade</h1>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input type="date" label="Data" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="time" label="Horário inicial" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input type="time" label="Horário final" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <Select label="Tipo de ambiente" value={environmentType} onChange={(e) => setEnvironmentType(e.target.value)}>
            <option value="">Todos os tipos</option>
            {Object.entries(environmentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSearch} loading={loading}>
            <Search className="h-4 w-4" /> Consultar
          </Button>
        </div>
      </Card>

      {loading && <LoadingState />}

      {searched && !loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-semibold text-emerald-700">Disponíveis ({available.length})</h2>
            {available.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum ambiente disponível.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {available.map((env) => (
                  <li key={env.id} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm">
                    <p className="font-medium text-slate-700">{env.name}</p>
                    <p className="text-xs text-slate-400">
                      {environmentTypeLabels[env.type]} · Capacidade: {env.capacity}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {available.length > 0 && (
              <Button className="mt-4 w-full" onClick={() => navigate("/reservas/nova")}>
                <CalendarSearch className="h-4 w-4" /> Fazer uma reserva
              </Button>
            )}
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold text-red-700">Indisponíveis ({unavailable.length})</h2>
            {unavailable.length === 0 ? (
              <p className="text-sm text-slate-400">Todos os ambientes filtrados estão disponíveis.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {unavailable.map(({ environment, reason }) => (
                  <li key={environment.id} className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-sm">
                    <p className="font-medium text-slate-700">{environment.name}</p>
                    <p className="text-xs text-red-500">{reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
