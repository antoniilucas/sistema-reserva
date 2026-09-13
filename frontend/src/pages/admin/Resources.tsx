import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Ban } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Thead, Th, Tr, Td } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { resourceService } from "../../services/resource.service";
import { Resource } from "../../types";
import { getErrorMessage } from "../../services/api";

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", kind: "OPCIONAL", quantity: 1 });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setResources(await resourceService.list());
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
    if (!form.name) {
      toast.error("Informe o nome do recurso.");
      return;
    }
    setSaving(true);
    try {
      await resourceService.create(form);
      toast.success("Recurso criado.");
      setModalOpen(false);
      setForm({ name: "", kind: "OPCIONAL", quantity: 1 });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(r: Resource) {
    if (!confirm(`Desativar o recurso ${r.name}?`)) return;
    try {
      await resourceService.deactivate(r.id);
      toast.success("Recurso desativado.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Recursos</h1>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Novo Recurso
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : resources.length === 0 ? (
        <EmptyState title="Nenhum recurso cadastrado" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th>Quantidade</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {resources.map((r) => (
                <Tr key={r.id}>
                  <Td>{r.name}</Td>
                  <Td>{r.kind === "FIXO" ? "Fixo" : "Opcional"}</Td>
                  <Td>{r.quantity}</Td>
                  <Td>{r.active ? "Ativo" : "Inativo"}</Td>
                  <Td>
                    {r.active && (
                      <button onClick={() => handleDeactivate(r)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
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
        title="Novo Recurso"
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
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Tipo" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="OPCIONAL">Opcional</option>
            <option value="FIXO">Fixo</option>
          </Select>
          <Input
            type="number"
            label="Quantidade"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </div>
      </Modal>
    </div>
  );
}
