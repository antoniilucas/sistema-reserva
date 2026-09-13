import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarSearch, CheckCircle2, Search } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input, Select, Textarea } from "../components/Input";
import { LoadingState } from "../components/LoadingState";
import { availabilityService } from "../services/availability.service";
import { reservationService } from "../services/reservation.service";
import { Environment } from "../types";
import { environmentTypeLabels } from "../utils/format";
import { getErrorMessage } from "../services/api";

export default function NewReservation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [environmentType, setEnvironmentType] = useState("");

  const [searching, setSearching] = useState(false);
  const [available, setAvailable] = useState<Environment[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [purpose, setPurpose] = useState("");
  const [participantsCount, setParticipantsCount] = useState(1);
  const [participantsRaw, setParticipantsRaw] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSearch() {
    if (!date || !startTime || !endTime) {
      toast.error("Preencha data, horário inicial e final.");
      return;
    }
    setSearching(true);
    setSearched(false);
    try {
      const result = await availabilityService.search({
        date,
        startTime,
        endTime,
        environmentType: environmentType || undefined,
      });
      setAvailable(result.available);
      setSuggestions(result.suggestions);
      setSearched(true);
      setStep(2);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  function selectEnvironment(env: Environment) {
    setSelectedEnvironment(env);
    setStep(3);
  }

  async function handleSubmit() {
    if (!selectedEnvironment) return;
    if (!purpose || participantsCount < 1) {
      toast.error("Preencha a finalidade e o número de participantes.");
      return;
    }
    if (participantsCount > selectedEnvironment.capacity) {
      toast.error(`Capacidade máxima do ambiente é ${selectedEnvironment.capacity} pessoas.`);
      return;
    }
    if (!termsAccepted) {
      toast.error("É necessário aceitar o termo de responsabilidade.");
      return;
    }

    setSubmitting(true);
    try {
      const participants = participantsRaw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const created = await reservationService.create({
        environmentId: selectedEnvironment.id,
        date,
        startTime,
        endTime,
        purpose,
        participantsCount,
        participants,
        resources: selectedResources.map((resourceId) => ({ resourceId })),
        termsAccepted,
      });
      toast.success(`Reserva ${created.status === "APROVADA" ? "aprovada automaticamente" : "solicitada"} com sucesso!`);
      navigate("/reservas");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Nova Reserva</h1>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        {["Data/Horário", "Ambiente", "Detalhes"].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                step >= idx + 1 ? "bg-brand-600" : "bg-slate-300"
              }`}
            >
              {idx + 1}
            </span>
            <span className={step >= idx + 1 ? "text-slate-600" : ""}>{label}</span>
            {idx < 2 && <span className="mx-2">—</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input type="date" label="Data" value={date} onChange={(e) => setDate(e.target.value)} />
            <Select
              label="Tipo de ambiente (opcional)"
              value={environmentType}
              onChange={(e) => setEnvironmentType(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              {Object.entries(environmentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input type="time" label="Horário inicial" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input type="time" label="Horário final" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch} loading={searching}>
              <Search className="h-4 w-4" /> Consultar disponibilidade
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Ambientes disponíveis</h2>
            <Button variant="ghost" onClick={() => setStep(1)}>
              Alterar busca
            </Button>
          </div>
          {searching ? (
            <LoadingState />
          ) : available.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CalendarSearch className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Nenhum ambiente disponível para o horário informado.</p>
              {suggestions.length > 0 && (
                <div className="mt-4 w-full text-left">
                  <p className="mb-2 text-sm font-medium text-slate-600">Sugestões de horários alternativos:</p>
                  <ul className="flex flex-col gap-2">
                    {suggestions.map((s, idx) => (
                      <li key={idx} className="rounded-lg border border-slate-100 p-3 text-sm">
                        <span className="font-medium">{s.environment.name}</span> ·{" "}
                        {new Date(s.startTime).toLocaleString("pt-BR")} até {new Date(s.endTime).toLocaleTimeString("pt-BR")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {available.map((env) => (
                <button
                  key={env.id}
                  onClick={() => selectEnvironment(env)}
                  className="flex flex-col gap-1 rounded-xl border border-slate-100 p-4 text-left transition hover:border-brand-400 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{env.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {environmentTypeLabels[env.type]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {env.building} · {env.floor} · Capacidade: {env.capacity}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {step === 3 && selectedEnvironment && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Detalhes da reserva</h2>
            <Button variant="ghost" onClick={() => setStep(2)}>
              Trocar ambiente
            </Button>
          </div>

          <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-700">{selectedEnvironment.name}</p>
            <p className="text-slate-400">
              {date} · {startTime} - {endTime} · Capacidade máxima: {selectedEnvironment.capacity}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Textarea
              label="Finalidade"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Descreva o objetivo da reserva"
            />
            <Input
              type="number"
              min={1}
              label="Número de participantes"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(Number(e.target.value))}
            />
            <Input
              label="Participantes (nomes separados por vírgula, opcional)"
              value={participantsRaw}
              onChange={(e) => setParticipantsRaw(e.target.value)}
              placeholder="Ex: João Silva, Maria Souza"
            />

            {selectedEnvironment.resources.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">Recursos</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEnvironment.resources.map(({ resource, mandatory }) => {
                    const checked = selectedResources.includes(resource.id) || mandatory;
                    return (
                      <label
                        key={resource.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          checked ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={mandatory}
                          onChange={() =>
                            setSelectedResources((prev) =>
                              prev.includes(resource.id) ? prev.filter((id) => id !== resource.id) : [...prev, resource.id]
                            )
                          }
                        />
                        {resource.name} {mandatory && <span className="text-xs">(obrigatório)</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1" />
              Declaro estar ciente das normas de uso do ambiente e assumo responsabilidade pela reserva.
            </label>

            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              Status esperado:{" "}
              {selectedEnvironment.rules[0]?.requiresTechnicalReview
                ? "Pendente de análise técnica"
                : selectedEnvironment.rules[0]?.requiresApproval
                ? "Pendente de aprovação"
                : "Aprovação automática"}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} loading={submitting}>
                <CheckCircle2 className="h-4 w-4" /> Confirmar reserva
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
