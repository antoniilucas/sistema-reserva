import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, XCircle, LogIn, LogOut, CalendarX, CalendarClock, MapPin, Clock, FileText, Users, Tag } from "lucide-react";
import { Button } from "../components/Button";
import { Input, Select, Textarea } from "../components/Input";
import { Table } from "../components/Table";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
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
      toast.success("Reserva cancelada com sucesso.");
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
      toast.success("Check-in realizado com sucesso!");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCheckOut(r: Reservation) {
    try {
      await reservationService.checkOut(r.id);
      toast.success("Check-out realizado com sucesso!");
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
      toast.success("Ocorrência registada com sucesso.");
      setOccurrenceDescription("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingOccurrence(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Cabeçalho Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {historyMode ? "Histórico de Reservas" : "Minhas Reservas"}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {historyMode ? "Consulte o registo das suas utilizações anteriores." : "Acompanhe e gira as suas próximas utilizações de espaços."}
          </p>
        </div>
        {!historyMode && (
          <div className="w-full sm:w-64">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full shadow-sm bg-slate-50 border-slate-200 focus:ring-indigo-600 focus:border-indigo-600">
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
          </div>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : reservations.length === 0 ? (
        /* Empty State Premium */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <CalendarX className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma reserva encontrada</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            Ainda não existem reservas com os critérios selecionados. As suas marcações aparecerão aqui.
          </p>
        </div>
      ) : (
        /* Tabela Premium */
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ambiente</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Horário</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((r) => (
                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{r.environment.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{environmentTypeLabels[r.environment.type] || r.environment.type}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CalendarClock className="h-4 w-4 text-slate-400" />
                      {formatDate(r.date)}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">
                    {formatTime(r.startTime)} às {formatTime(r.endTime)}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button title="Ver detalhes" onClick={() => setSelected(r)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {EDITABLE.includes(r.status) && canCheckInOut(r) && (
                        <>
                          {r.status === "APROVADA" && (
                            <button title="Fazer Check-in" onClick={() => handleCheckIn(r)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm">
                              <LogIn className="h-4 w-4" />
                            </button>
                          )}
                          {r.status === "EM_USO" && (
                            <button title="Fazer Check-out" onClick={() => handleCheckOut(r)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      
                      {CANCELABLE.includes(r.status) && (
                        <button title="Cancelar Reserva" onClick={() => setCancelTarget(r)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal de Detalhes (Estilo Recibo Premium) */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes da Reserva">
        {selected && (
          <div className="flex flex-col gap-4 mt-2">
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200/60 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Ambiente</h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span className="text-base font-bold text-slate-900">{selected.environment.name}</span>
                  </div>
                </div>
                <div className="scale-90 origin-top-right">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Data</h4>
                  <p className="text-sm font-medium text-slate-800">{formatDate(selected.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Horário</h4>
                  <p className="text-sm font-medium text-slate-800">{formatTime(selected.startTime)} às {formatTime(selected.endTime)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="col-span-2">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Finalidade</h4>
                  <p className="text-sm font-medium text-slate-800 bg-white p-3 rounded-xl border border-slate-200">{selected.purpose}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Participantes</h4>
                  <p className="text-sm font-medium text-slate-800">{selected.participantsCount} pessoas</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Responsável</h4>
                  <p className="text-sm font-medium text-slate-800">{selected.responsible.name}</p>
                </div>
              </div>
            </div>

            {selected.rejectionReason && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Motivo da Recusa</h4>
                <p className="text-sm font-medium text-rose-800">{selected.rejectionReason}</p>
              </div>
            )}
            
            {selected.cancellationReason && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Motivo do Cancelamento</h4>
                <p className="text-sm font-medium text-amber-800">{selected.cancellationReason}</p>
              </div>
            )}

            {canCheckInOut(selected) && ["EM_USO", "ENCERRADA"].includes(selected.status) && (
              <div className="mt-2 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5">
                <p className="mb-3 text-sm font-bold text-indigo-900">Registar Ocorrência</p>
                <div className="flex flex-col gap-3">
                  <Select value={occurrenceType} onChange={(e) => setOccurrenceType(e.target.value)} className="bg-white">
                    <option value="DANO">Dano ao Equipamento</option>
                    <option value="INCIDENTE">Incidente</option>
                    <option value="ATRASO">Atraso na Entrega</option>
                    <option value="FALHA_TECNICA">Falha Técnica</option>
                    <option value="LIMPEZA">Problema de Limpeza</option>
                    <option value="OUTRO">Outro</option>
                  </Select>
                  <Textarea
                    rows={2}
                    placeholder="Descreva o que aconteceu..."
                    value={occurrenceDescription}
                    onChange={(e) => setOccurrenceDescription(e.target.value)}
                    className="bg-white"
                  />
                  <Button loading={savingOccurrence} onClick={handleReportOccurrence} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                    Registar Ocorrência
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancelar Reserva"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button loading={cancelling} onClick={handleCancel} className="bg-rose-600 hover:bg-rose-700 text-white">
              Confirmar Cancelamento
            </Button>
          </div>
        }
      >
        <div className="mt-3">
          <p className="text-sm text-slate-500 mb-4">Tem a certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.</p>
          <Textarea
            label="Motivo do cancelamento (obrigatório)"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Explique brevemente por que está a cancelar..."
          />
        </div>
      </Modal>
    </div>
  );
}