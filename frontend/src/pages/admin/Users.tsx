import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Thead, Th, Tr, Td } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { userService } from "../../services/user.service";
import { User } from "../../types";
import { roleLabels } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "SOLICITANTE" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await userService.list(search ? { search } : undefined);
      setUsers(data);
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

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSaving(true);
    try {
      await userService.create(form);
      toast.success("Usuário criado.");
      setModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "SOLICITANTE" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: User) {
    const newStatus = user.status === "ATIVO" ? "BLOQUEADO" : "ATIVO";
    try {
      await userService.updateStatus(user.id, newStatus);
      toast.success("Status atualizado.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Usuários</h1>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {loading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário encontrado" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Perfil</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>{roleLabels[u.role]}</Td>
                  <Td>{u.status}</Td>
                  <Td>
                    <Button variant={u.status === "ATIVO" ? "danger" : "secondary"} onClick={() => toggleStatus(u)} className="!px-3 !py-1 text-xs">
                      {u.status === "ATIVO" ? "Bloquear" : "Reativar"}
                    </Button>
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
        title="Novo Usuário"
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
          <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Perfil" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
