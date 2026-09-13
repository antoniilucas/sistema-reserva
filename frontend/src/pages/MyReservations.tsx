import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, XCircle, LogIn, LogOut, Pencil } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Select, Textarea } from "../components/Input";
import { Table, Thead, Th, Tr, Td } from "../components/Table";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { reservationService } from "../services/reservation.service";
import { occurrenceService } from "../services/occurrence.service";
import { Reservation } from "../types";
import { formatDate, formatTime, environmentTypeLabels } from "../utils/format";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../hooks/useAuth";


const CANCELABLE = ["SOLICITADA", "PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA", "APROVADA"];
const EDITABLE = ["SOLICITADA", "PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA", "APROVADA"];

export default function MyReservations({ historyMode = false }: { historyMode?: boolean }) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Reservation | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [occurrenceType, setOccurrenceType] = useState("OUTRO");
  const [occurrenceDescription, setOccurrenceDescription] = useState("");
  const [savingOccurrence, setSavingOccurrence] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = { mine: "true" };
      if (statusFilter) params.status = statusFilter;
      const data = await reservationService.list(params);
      setReservations(historyMode ? data.filter((r) => ["ENCERRADA", "CANCELADA", "RECUSADA", "NO_SHOW"].includes(r.status)) : data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleCancel() {
    if (!cancelTarget || !cancelReason) {
      toast.error("Informe o motivo do cancelamento.");
      return;
    }
    setCancelling(true);
    try {
      await reservationService.cancel(cancelTarget.id, cancelReason);
      toast.success("Reserva cancelada.");
      setCancelTarget(null);
      setCancelReason("");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  async function handleCheckIn(r: Reservation) {
    try {
      await reservationService.checkIn(r.id);
      toast.success("Check-in realizado.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCheckOut(r: Reservation) {
    try {
      await reservationService.checkOut(r.id);
      toast.success("Check-out realizado.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function canCheckInOut(r: Reservation) {
    return r.requestedById === user?.id || r.responsibleId === user?.id || user?.role === "ADMINISTRADOR";
  }

  async function handleReportOccurrence() {
    if (!selected || !occurrenceDescription) {
      toast.error("Descreva a ocorrência.");
      return;
    }
    setSavingOccurrence(true);
    try {
      await occurrenceService.create({
        reservationId: selected.id,
        type: occurrenceType,
        description: occurrenceDescription,
      });
      toast.success("Ocorrência registrada.");
      setOccurrenceDescription("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingOccurrence(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">{historyMode ? "Histórico" : "Minhas Reservas"}</h1>
        {!historyMode && (
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-56">
            <option value="">Todos os status</option>
            <option value="PENDENTE_APROVACAO">Pendente de Aprovação</option>
            <option value="PENDENTE_ANALISE_TECNICA">Pendente de Análise Técnica</option>
            <option value="APROVADA">Aprovada</option>
            <option value="EM_USO">Em Uso</option>
            <option value="ENCERRADA">Encerrada</option>
            <option value="RECUSADA">Recusada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="NO_SHOW">No-show</option>
          </Select>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : reservations.length === 0 ? (
        <EmptyState title="Nenhuma reserva encontrada" description="Suas reservas aparecerão aqui." />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Ambiente</Th>
                <Th>Data</Th>
                <Th>Horário</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {reservations.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <p className="font-medium text-slate-700">{r.environment.name}</p>
                    <p className="text-xs text-slate-400">{environmentTypeLabels[r.environment.type]}</p>
                  </Td>
                  <Td>{formatDate(r.date)}</Td>
                  <Td>
                    {formatTime(r.startTime)} - {formatTime(r.endTime)}
                  </Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button title="Ver detalhes" onClick={() => setSelected(r)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                        <Eye className="h-4 w-4" />
                      </button>
                      {EDITABLE.includes(r.status) && canCheckInOut(r) && (
                        <>
                          {r.status === "APROVADA" && (
                            <button title="Check-in" onClick={() => handleCheckIn(r)} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50">
                              <LogIn className="h-4 w-4" />
                            </button>
                          )}
                          {r.status === "EM_USO" && (
                            <button title="Check-out" onClick={() => handleCheckOut(r)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50">
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      {CANCELABLE.includes(r.status) && (
                        <button title="Cancelar" onClick={() => setCancelTarget(r)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes da Reserva">
        {selected && (
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <p>
              <span className="font-medium">Ambiente:</span> {selected.environment.name}
            </p>
            <p>
              <span className="font-medium">Data:</span> {formatDate(selected.date)}
            </p>
            <p>
              <span className="font-medium">Horário:</span> {formatTime(selected.startTime)} - {formatTime(selected.endTime)}
            </p>
            <p>
              <span className="font-medium">Finalidade:</span> {selected.purpose}
            </p>
            <p>
              <span className="font-medium">Participantes:</span> {selected.participantsCount}
            </p>
            <p>
              <span className="font-medium">Responsável:</span> {selected.responsible.name}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Status:</span> <StatusBadge status={selected.status} />
            </p>
            {selected.rejectionReason && (
              <p>
                <span className="font-medium">Motivo da recusa:</span> {selected.rejectionReason}
              </p>
            )}
            {selected.cancellationReason && (
              <p>
                <span className="font-medium">Motivo do cancelamento:</span> {selected.cancellationReason}
              </p>
            )}

            {canCheckInOut(selected) && ["EM_USO", "ENCERRADA"].includes(selected.status) && (
              <div className="mt-4 rounded-lg border border-slate-100 p-3">
                <p className="mb-2 text-sm font-medium text-slate-700">Registrar ocorrência</p>
                <div className="flex flex-col gap-2">
                  <Select value={occurrenceType} onChange={(e) => setOccurrenceType(e.target.value)}>
                    <option value="DANO">Dano</option>
                    <option value="INCIDENTE">Incidente</option>
                    <option value="ATRASO">Atraso</option>
                    <option value="FALHA_TECNICA">Falha Técnica</option>
                    <option value="LIMPEZA">Limpeza</option>
                    <option value="OUTRO">Outro</option>
                  </Select>
                  <Textarea
                    rows={2}
                    placeholder="Descreva o ocorrido"
                    value={occurrenceDescription}
                    onChange={(e) => setOccurrenceDescription(e.target.value)}
                  />
                  <Button variant="secondary" loading={savingOccurrence} onClick={handleReportOccurrence}>
                    Registrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancelar Reserva"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              Confirmar cancelamento
            </Button>
          </>
        }
      >
        <Textarea
          label="Motivo do cancelamento"
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Descreva o motivo"
        />
      </Modal>
    </div>
  );
}
