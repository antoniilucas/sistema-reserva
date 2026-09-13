import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input, Select, Textarea } from "../../components/Input";
import { Table, Thead, Th, Tr, Td } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { blockService } from "../../services/block.service";
import { environmentService } from "../../services/environment.service";
import { ScheduleBlock, Environment } from "../../types";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

const reasonLabels: Record<string, string> = {
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
  EVENTO_INSTITUCIONAL: "Evento Institucional",
  AULA_FIXA: "Aula Fixa",
  OUTRO: "Outro",
};

export default function BlocksAdmin() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    environmentId: "",
    reason: "MANUTENCAO",
    description: "",
    startDateTime: "",
    endDateTime: "",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [b, e] = await Promise.all([blockService.list(), environmentService.list()]);
      setBlocks(b);
      setEnvironments(e);
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
    if (!form.environmentId || !form.startDateTime || !form.endDateTime) {
      toast.error("Preencha ambiente, início e fim do bloqueio.");
      return;
    }
    setSaving(true);
    try {
      await blockService.create(form);
      toast.success("Bloqueio criado.");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este bloqueio?")) return;
    try {
      await blockService.remove(id);
      toast.success("Bloqueio removido.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Bloqueios de Agenda</h1>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Novo Bloqueio
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : blocks.length === 0 ? (
        <EmptyState title="Nenhum bloqueio cadastrado" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Ambiente</Th>
                <Th>Motivo</Th>
                <Th>Início</Th>
                <Th>Fim</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {blocks.map((b) => (
                <Tr key={b.id}>
                  <Td>{b.environment?.name}</Td>
                  <Td>{reasonLabels[b.reason]}</Td>
                  <Td>{formatDateTime(b.startDateTime)}</Td>
                  <Td>{formatDateTime(b.endDateTime)}</Td>
                  <Td>
                    <button onClick={() => handleRemove(b.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Bloqueio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleCreate}>
              Criar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select label="Ambiente" value={form.environmentId} onChange={(e) => setForm({ ...form, environmentId: e.target.value })}>
            <option value="">Selecione...</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
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
            label="Início"
            value={form.startDateTime}
            onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
          />
          <Input
            type="datetime-local"
            label="Fim"
            value={form.endDateTime}
            onChange={(e) => setForm({ ...form, endDateTime: e.target.value })}
          />
          <Textarea label="Descrição (opcional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
