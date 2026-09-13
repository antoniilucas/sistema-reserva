import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Textarea } from "../components/Input";
import { Table, Thead, Th, Tr, Td } from "../components/Table";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { reservationService } from "../services/reservation.service";
import { Reservation } from "../types";
import { formatDate, formatTime } from "../utils/format";
import { getErrorMessage } from "../services/api";

export default function Approvals() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Reservation | null>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await reservationService.pendingApprovals();
      setReservations(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(r: Reservation) {
    setProcessing(true);
    try {
      await reservationService.approve(r.id);
      toast.success("Reserva aprovada.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget || !reason) {
      toast.error("Informe o motivo da recusa.");
      return;
    }
    setProcessing(true);
    try {
      await reservationService.reject(rejectTarget.id, reason);
      toast.success("Reserva recusada.");
      setRejectTarget(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Solicitações Pendentes</h1>

      {loading ? (
        <LoadingState />
      ) : reservations.length === 0 ? (
        <EmptyState title="Nenhuma solicitação pendente" description="Novas solicitações aparecerão aqui." />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Solicitante</Th>
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
                  <Td>{r.requestedBy.name}</Td>
                  <Td>{r.environment.name}</Td>
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
                      <button
                        title="Aprovar"
                        disabled={processing}
                        onClick={() => handleApprove(r)}
                        className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button title="Recusar" onClick={() => setRejectTarget(r)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes da Solicitação" maxWidth="max-w-2xl">
        {selected && (
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <p><span className="font-medium">Solicitante:</span> {selected.requestedBy.name} ({selected.requestedBy.email})</p>
            <p><span className="font-medium">Ambiente:</span> {selected.environment.name}</p>
            <p><span className="font-medium">Data:</span> {formatDate(selected.date)}</p>
            <p><span className="font-medium">Horário:</span> {formatTime(selected.startTime)} - {formatTime(selected.endTime)}</p>
            <p><span className="font-medium">Finalidade:</span> {selected.purpose}</p>
            <p><span className="font-medium">Participantes:</span> {selected.participantsCount} / capacidade {selected.environment.capacity}</p>
            <p><span className="font-medium">Responsável:</span> {selected.responsible.name}</p>
            {selected.resources && selected.resources.length > 0 && (
              <p>
                <span className="font-medium">Recursos:</span> {selected.resources.map((r) => r.resource.name).join(", ")}
              </p>
            )}
            {selected.environment.requiresTechnicalResponsible && (
              <p className="rounded bg-amber-50 p-2 text-xs text-amber-700">
                Este ambiente exige validação técnica antes da aprovação final.
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Recusar Solicitação"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" loading={processing} onClick={handleReject}>
              Confirmar recusa
            </Button>
          </>
        }
      >
        <Textarea label="Motivo da recusa (obrigatório)" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </div>
  );
}
