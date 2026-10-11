import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, ShieldAlert, AlertTriangle, Clock, Gavel, UserX, AlertCircle, Ban } from "lucide-react";
import { Button } from "../../components/Button";
import { Input, Select, Textarea } from "../../components/Input";
import { Table, Thead } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { Modal } from "../../components/Modal";
import { penaltyService } from "../../services/penalty.service";
import { userService } from "../../services/user.service";
import { Penalty, User } from "../../types";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

const reasonLabels: Record<string, string> = {
  NO_SHOW: "No-show (Não compareceu)",
  CANCELAMENTO_TARDIO: "Cancelamento Tardio",
  DANO: "Dano ao Património",
  INCIDENTE: "Incidente",
  OUTRO: "Outro",
};

// Função para extrair iniciais do nome
const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// Função para gerar o crachá (badge) do motivo da penalidade
const getReasonBadge = (reason: string) => {
  switch (reason) {
    case "NO_SHOW":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          <UserX className="h-3 w-3" /> No-show
        </span>
      );
    case "CANCELAMENTO_TARDIO":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="h-3 w-3" /> Atraso/Tardio
        </span>
      );
    case "DANO":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="h-3 w-3" /> Dano
        </span>
      );
    case "INCIDENTE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
          <AlertCircle className="h-3 w-3" /> Incidente
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Gavel className="h-3 w-3" /> Outro
        </span>
      );
  }
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
      toast.error("Por favor, selecione o utilizador.");
      return;
    }
    setSaving(true);
    try {
      await penaltyService.create(form);
      toast.success("Penalidade aplicada com sucesso.");
      setModalOpen(false);
      setForm({ userId: "", reason: "NO_SHOW", description: "", blockedUntil: "" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Cabeçalho Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Penalidades</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gira infrações e bloqueios temporários de utilizadores no sistema.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl py-2.5 px-5 transition-all shadow-md"
        >
          <Gavel className="h-4 w-4" /> Aplicar Penalidade
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : penalties.length === 0 ? (
        /* Empty State Premium */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
            <ShieldAlert className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma penalidade registada</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            Excelente! Todos os utilizadores estão a cumprir as regras de utilização dos espaços.
          </p>
        </div>
      ) : (
        /* Tabela Premium */
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Utilizador</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Motivo</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Detalhes</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Período de Bloqueio</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Data do Registo</th>
              </tr>
            </Thead>
            <tbody className="divide-y divide-slate-100">
              {penalties.map((p) => {
                const isBlocked = p.blockedUntil && new Date(p.blockedUntil) > new Date();
                
                return (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    
                    {/* Utilizador (Avatar + Nome) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
                          {getInitials(p.user?.name)}
                        </div>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {p.user?.name || "Desconhecido"}
                        </span>
                      </div>
                    </td>
                    
                    {/* Motivo (Crachá) */}
                    <td className="py-4 px-6">
                      {getReasonBadge(p.reason)}
                    </td>

                    {/* Descrição */}
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-slate-600 max-w-[200px] truncate" title={p.description}>
                        {p.description || "-"}
                      </p>
                    </td>
                    
                    {/* Bloqueado Até */}
                    <td className="py-4 px-6">
                      {p.blockedUntil ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border
                          ${isBlocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'}
                        `}>
                          {isBlocked ? <Ban className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {formatDateTime(p.blockedUntil)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">Sem bloqueio</span>
                      )}
                    </td>
                    
                    {/* Data Registo */}
                    <td className="py-4 px-6 text-right text-sm font-medium text-slate-500">
                      {formatDateTime(p.createdAt)}
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal Premium */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Aplicar Nova Penalidade"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleCreate} className="bg-rose-600 hover:bg-rose-700 text-white">
              Confirmar Penalidade
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 mt-2">
          
          {/* Aviso Visual */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-900">Atenção</p>
              <p className="text-xs text-rose-700 mt-0.5">Aplicar um bloqueio impedirá o utilizador de fazer novas reservas até à data especificada.</p>
            </div>
          </div>

          <Select 
            label="Utilizador Infrator" 
            value={form.userId} 
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Selecione o utilizador...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </Select>
          
          <Select 
            label="Motivo da Penalidade" 
            value={form.reason} 
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            {Object.entries(reasonLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          
          <Input
            type="datetime-local"
            label="Bloquear reservas até (Opcional)"
            value={form.blockedUntil}
            onChange={(e) => setForm({ ...form, blockedUntil: e.target.value })}
            className="bg-white"
          />
          
          <Textarea 
            label="Descrição / Observações" 
            rows={3} 
            placeholder="Descreva o que aconteceu em detalhe..."
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
          />
        </div>
      </Modal>
    </div>
  );
}