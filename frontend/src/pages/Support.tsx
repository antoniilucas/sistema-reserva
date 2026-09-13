import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input, Select, Textarea } from "../components/Input";
import { Table, Thead, Th, Tr, Td } from "../components/Table";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { supportService } from "../services/support.service";
import { reservationService } from "../services/reservation.service";
import { SupportRequest, Reservation } from "../types";
import { formatDateTime } from "../utils/format";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const statusLabel: Record<string, string> = {
  ABERTA: "Aberta",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
};

export default function Support() {
  const { user } = useAuth();
  const isTeam = user?.role === "SUPORTE" || user?.role === "ADMINISTRADOR";
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationId, setReservationId] = useState("");
  const [type, setType] = useState<"TI" | "AUDIOVISUAL" | "TECNICO_LABORATORIO">("TI");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = isTeam ? {} : { mine: "true" };
      const data = await supportService.list(params);
      setRequests(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (!isTeam) {
      reservationService.list({ mine: "true" }).then(setReservations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    if (!reservationId || !description) {
      toast.error("Selecione a reserva e descreva o problema.");
      return;
    }
    setSubmitting(true);
    try {
      await supportService.create({ reservationId, type, description });
      toast.success("Solicitação de suporte enviada.");
      setModalOpen(false);
      setDescription("");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await supportService.updateStatus(id, status);
      toast.success("Status atualizado.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">{isTeam ? "Solicitações de Suporte" : "Suporte"}</h1>
        {!isTeam && (
          <Button onClick={() => setModalOpen(true)}>
            <PlusCircle className="h-4 w-4" /> Nova solicitação
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <EmptyState title="Nenhuma solicitação de suporte" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Reserva</Th>
                <Th>Tipo</Th>
                <Th>Descrição</Th>
                <Th>Status</Th>
                <Th>Data</Th>
                {isTeam && <Th>Ações</Th>}
              </tr>
            </Thead>
            <tbody>
              {requests.map((s) => (
                <Tr key={s.id}>
                  <Td>{s.reservation?.environment?.name || "-"}</Td>
                  <Td>{s.type}</Td>
                  <Td className="max-w-xs truncate">{s.description}</Td>
                  <Td>{statusLabel[s.status]}</Td>
                  <Td>{formatDateTime(s.createdAt)}</Td>
                  {isTeam && (
                    <Td>
                      <Select
                        value={s.status}
                        onChange={(e) => updateStatus(s.id, e.target.value)}
                        className="w-40"
                      >
                        {Object.entries(statusLabel).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </Td>
                  )}
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Solicitação de Suporte"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={submitting} onClick={handleCreate}>
              Enviar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select label="Reserva relacionada" value={reservationId} onChange={(e) => setReservationId(e.target.value)}>
            <option value="">Selecione...</option>
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.environment.name} — {new Date(r.date).toLocaleDateString("pt-BR")}
              </option>
            ))}
          </Select>
          <Select label="Tipo de suporte" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="TI">TI</option>
            <option value="AUDIOVISUAL">Audiovisual</option>
            <option value="TECNICO_LABORATORIO">Técnico de Laboratório</option>
          </Select>
          <Textarea label="Descrição do problema" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
