import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Lock, Unlock, UserPlus, Pencil } from "lucide-react";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Thead } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { userService } from "../../services/user.service";
import { User } from "../../types";
import { roleLabels } from "../../utils/format";
import { getErrorMessage } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "SOLICITANTE" });
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();

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
      toast.success("Usuário criado com sucesso.");
      setModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "SOLICITANTE" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Informe nome e e-mail.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload: Record<string, string> = { name: form.name.trim(), email: form.email.trim() };
        if (currentUser?.role === "ADMINISTRADOR") {
          payload.role = form.role;
          if (form.password) payload.password = form.password;
        }
        await userService.update(editing.id, payload);
        toast.success("Dados do usuário atualizados.");
      } else {
        await userService.create(form);
        toast.success("Usuário criado com sucesso.");
      }
      setModalOpen(false);
      setEditing(null);
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
      toast.success(`Usuário ${newStatus === "ATIVO" ? "reativado" : "bloqueado"}.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Administre acessos, perfis e credenciais da plataforma.</p>
        </div>
        {currentUser?.role === "ADMINISTRADOR" && <button
          onClick={() => { setEditing(null); setForm({ name: "", email: "", password: "", role: "SOLICITANTE" }); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 px-5 transition-all shadow-md"
        >
          <UserPlus className="h-4 w-4" /> Novo Usuário
        </button>}
      </div>

      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm shadow-sm outline-none transition-all bg-white"
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário encontrado" />
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </Thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm text-sm">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${u.role === 'ADMINISTRADOR' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                        u.role === 'GESTOR' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-slate-50 text-slate-600 border-slate-200'}
                    `}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {u.status === "ATIVO" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Bloqueado
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-lg text-xs font-bold border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    {currentUser?.role === "ADMINISTRADOR" && <button
                      onClick={() => toggleStatus(u)} 
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${u.status === "ATIVO" 
                          ? 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm' 
                          : 'bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm'}
                      `}
                    >
                      {u.status === "ATIVO" ? (
                        <><Lock className="h-3.5 w-3.5" /> Bloquear</>
                      ) : (
                        <><Unlock className="h-3.5 w-3.5" /> Reativar</>
                      )}
                    </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Usuário" : "Criar Novo Usuário"}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={editing ? handleSave : handleCreate}>
              {editing ? "Salvar Alterações" : "Confirmar Criação"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 mt-2">
          <Input 
            label="Nome Completo" 
            placeholder="Ex: João Silva"
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
          <Input 
            label="Endereço de E-mail" 
            type="email" 
            placeholder="usuario@sistema.com"
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
          />
          {!editing && <Input
            label="Senha Temporária" 
            type="password" 
            placeholder="••••••••"
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
          />}
          {(!editing || currentUser?.role === "ADMINISTRADOR") && <Select
            label="Perfil de Acesso" 
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>}
        </div>
      </Modal>
    </div>
  );
}
