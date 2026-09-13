import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input, Select, Textarea } from "../../components/Input";
import { Table, Thead, Th, Tr, Td } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { penaltyService } from "../../services/penalty.service";
import { userService } from "../../services/user.service";
import { Penalty, User } from "../../types";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

const reasonLabels: Record<string, string> = {
  NO_SHOW: "No-show",
  CANCELAMENTO_TARDIO: "Cancelamento Tardio",
  DANO: "Dano",
  INCIDENTE: "Incidente",
  OUTRO: "Outro",
};

export default function PenaltiesAdmin() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", reason: "NO_SHOW", description: "", blockedUntil: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, u] = await Promise.all([penaltyService.listAll(), userService.list()]);
      setPenalties(p);
      setUsers(u);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!form.userId) {
      toast.error("Selecione o usuário.");
      return;
    }
    setSaving(true);
    try {
      await penaltyService.create(form);
      toast.success("Penalidade aplicada.");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Penalidades</h1>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Aplicar Penalidade
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : penalties.length === 0 ? (
        <EmptyState title="Nenhuma penalidade registrada" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Usuário</Th>
                <Th>Motivo</Th>
                <Th>Bloqueado até</Th>
                <Th>Data</Th>
              </tr>
            </Thead>
            <tbody>
              {penalties.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.user?.name}</Td>
                  <Td>{reasonLabels[p.reason] || p.reason}</Td>
                  <Td>{p.blockedUntil ? formatDateTime(p.blockedUntil) : "-"}</Td>
                  <Td>{formatDateTime(p.createdAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Aplicar Penalidade"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleCreate}>
              Aplicar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select label="Usuário" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
            <option value="">Selecione...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </Select>
          <Select label="Motivo" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
            {Object.entries(reasonLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            type="datetime-local"
            label="Bloqueado até (opcional)"
            value={form.blockedUntil}
            onChange={(e) => setForm({ ...form, blockedUntil: e.target.value })}
          />
          <Textarea label="Descrição" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
