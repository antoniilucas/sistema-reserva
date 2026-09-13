import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Pencil, Ban } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Thead, Th, Tr, Td } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { environmentService } from "../../services/environment.service";
import { Environment } from "../../types";
import { environmentTypeLabels } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

const emptyForm = {
  code: "",
  name: "",
  type: "SALA",
  campus: "",
  building: "",
  floor: "",
  capacity: 10,
  criticality: "COMUM",
  openingTime: "07:00",
  closingTime: "22:00",
  requiresTechnicalResponsible: false,
};

export default function EnvironmentsAdmin() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Environment | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await environmentService.list(search ? { search } : undefined);
      setEnvironments(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(env: Environment) {
    setEditing(env);
    setForm({
      code: env.code,
      name: env.name,
      type: env.type,
      campus: env.campus,
      building: env.building,
      floor: env.floor,
      capacity: env.capacity,
      criticality: env.criticality,
      openingTime: env.openingTime,
      closingTime: env.closingTime,
      requiresTechnicalResponsible: env.requiresTechnicalResponsible,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await environmentService.update(editing.id, form);
        toast.success("Ambiente atualizado.");
      } else {
        await environmentService.create({
          ...form,
          rule: { requiresApproval: true },
        });
        toast.success("Ambiente criado.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(env: Environment) {
    if (!confirm(`Desativar o ambiente ${env.name}?`)) return;
    try {
      await environmentService.deactivate(env.id);
      toast.success("Ambiente desativado.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Ambientes</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4" /> Novo Ambiente
        </Button>
      </div>

      <Input placeholder="Buscar por nome ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {loading ? (
        <LoadingState />
      ) : environments.length === 0 ? (
        <EmptyState title="Nenhum ambiente cadastrado" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Código</Th>
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th>Local</Th>
                <Th>Capacidade</Th>
                <Th>Criticidade</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {environments.map((env) => (
                <Tr key={env.id}>
                  <Td>{env.code}</Td>
                  <Td>{env.name}</Td>
                  <Td>{environmentTypeLabels[env.type]}</Td>
                  <Td>
                    {env.building} · {env.floor}
                  </Td>
                  <Td>{env.capacity}</Td>
                  <Td>{env.criticality}</Td>
                  <Td>{env.active ? "Ativo" : "Inativo"}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(env)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {env.active && (
                        <button onClick={() => handleDeactivate(env)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                          <Ban className="h-4 w-4" />
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Ambiente" : "Novo Ambiente"}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleSave}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(environmentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select label="Criticidade" value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value })}>
            <option value="COMUM">Comum</option>
            <option value="CONTROLADO">Controlado</option>
            <option value="RESTRITO">Restrito</option>
          </Select>
          <Input label="Campus" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} />
          <Input label="Prédio" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
          <Input label="Andar" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          <Input
            type="number"
            label="Capacidade"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
          <Input type="time" label="Abertura" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
          <Input type="time" label="Fechamento" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.requiresTechnicalResponsible}
              onChange={(e) => setForm({ ...form, requiresTechnicalResponsible: e.target.checked })}
            />
            Exige responsável técnico (laboratórios)
          </label>
        </div>
      </Modal>
    </div>
  );
}
