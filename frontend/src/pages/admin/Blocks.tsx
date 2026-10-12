import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Trash2, CalendarOff, Wrench, Sparkles, CalendarDays, GraduationCap, AlertCircle, MapPin, ArrowRight } from "lucide-react";
import { Button } from "../../components/Button";
import { Input, Select, Textarea } from "../../components/Input";
import { Table, Thead } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
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

// Função para gerar o crachá (badge) premium do motivo
const getReasonBadge = (reason: string) => {
  switch (reason) {
    case "MANUTENCAO":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          <Wrench className="h-3 w-3" /> Manutenção
        </span>
      );
    case "LIMPEZA":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
          <Sparkles className="h-3 w-3" /> Limpeza
        </span>
      );
    case "EVENTO_INSTITUCIONAL":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
          <CalendarDays className="h-3 w-3" /> Evento
        </span>
      );
    case "AULA_FIXA":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <GraduationCap className="h-3 w-3" /> Aula Fixa
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-700 border border-slate-200">
          <AlertCircle className="h-3 w-3" /> Outro
        </span>
      );
  }
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
      toast.error("Preencha o ambiente, início e fim do bloqueio.");
      return;
    }
    setSaving(true);
    try {
      await blockService.create(form);
      toast.success("Bloqueio criado com sucesso.");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Tem a certeza que deseja remover este bloqueio da agenda?")) return;
    try {
      await blockService.remove(id);
      toast.success("Bloqueio removido com sucesso.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Cabeçalho Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bloqueios de Agenda</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Interdite espaços para manutenção, limpeza ou eventos fechados.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 px-5 transition-all shadow-md"
        >
          <Lock className="h-4 w-4" /> Novo Bloqueio
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : blocks.length === 0 ? (
        /* Empty State Premium */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <CalendarOff className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum bloqueio registado</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            Todos os espaços estão disponíveis para reserva. Clique em "Novo Bloqueio" se precisar de interditar algum ambiente.
          </p>
        </div>
      ) : (
        /* Tabela Premium */
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ambiente Bloqueado</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Motivo</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Período de Indisponibilidade</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </Thead>
            <tbody className="divide-y divide-slate-100">
              {blocks.map((b) => (
                <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                  
                  {/* Ambiente */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <MapPin className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {b.environment?.name || "Ambiente Desconhecido"}
                      </span>
                    </div>
                  </td>
                  
                  {/* Motivo (Crachá) */}
                  <td className="py-4 px-6">
                    {getReasonBadge(b.reason)}
                  </td>
                  
                  {/* Período */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span>{formatDateTime(b.startDateTime)}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{formatDateTime(b.endDateTime)}</span>
                    </div>
                  </td>
                  
                  {/* Ações */}
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleRemove(b.id)} 
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                      title="Remover Bloqueio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal Premium */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registar Novo Bloqueio"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Confirmar Bloqueio
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 mt-2">
          
          <Select 
            label="Ambiente a Bloquear" 
            value={form.environmentId} 
            onChange={(e) => setForm({ ...form, environmentId: e.target.value })}
          >
            <option value="">Selecione o espaço...</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </Select>
          
          <Select 
            label="Motivo da Interdição" 
            value={form.reason} 
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            {Object.entries(reasonLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label as React.ReactNode}
              </option>
            ))}
          </Select>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Input
              type="datetime-local"
              label="Data e Hora de Início"
              value={form.startDateTime}
              onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
              className="bg-white"
            />
            <Input
              type="datetime-local"
              label="Data e Hora de Fim"
              value={form.endDateTime}
              onChange={(e) => setForm({ ...form, endDateTime: e.target.value })}
              className="bg-white"
            />
          </div>
          
          <Textarea 
            label="Descrição ou Detalhes (Opcional)" 
            rows={2} 
            placeholder="Ex: Manutenção preventiva do ar condicionado..."
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
          />
        </div>
      </Modal>
    </div>
  );
}