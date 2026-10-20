import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Pencil, Ban, Search, Users, MapPin, Monitor, Presentation, Lightbulb } from "lucide-react";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Thead } from "../../components/Table";
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
  requiresApproval: true,
  requiresTechnicalReview: false,
};

// Função auxiliar para escolher um ícone baseado no tipo de ambiente
const getEnvironmentIcon = (type: string) => {
  switch (type) {
    case "LABORATORIO":
      return <Monitor className="h-4 w-4 text-blue-500" />;
    case "AUDITORIO":
      return <Presentation className="h-4 w-4 text-purple-500" />;
    default:
      return <Lightbulb className="h-4 w-4 text-emerald-500" />;
  }
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
      requiresApproval: env.rules[0]?.requiresApproval ?? true,
      requiresTechnicalReview: env.rules[0]?.requiresTechnicalReview ?? false,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { requiresApproval, requiresTechnicalReview, ...environmentData } = form;
      const payload = {
        ...environmentData,
        rule: { requiresApproval, requiresTechnicalReview },
      };
      if (editing) {
        await environmentService.update(editing.id, payload);
        toast.success("Ambiente atualizado com sucesso.");
      } else {
        await environmentService.create(payload);
        toast.success("Ambiente criado com sucesso.");
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
    if (!confirm(`Tem certeza que deseja desativar o ambiente ${env.name}?`)) return;
    try {
      await environmentService.deactivate(env.id);
      toast.success("Ambiente desativado com sucesso.");
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ambientes</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gira as salas, laboratórios e auditórios disponíveis para reserva.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 px-5 transition-all shadow-md"
        >
          <PlusCircle className="h-4 w-4" /> Novo Ambiente
        </button>
      </div>

      {/* Barra de Pesquisa Refinada */}
      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm shadow-sm outline-none transition-all bg-white"
        />
      </div>

      {/* Tabela de Ambientes */}
      {loading ? (
        <LoadingState />
      ) : environments.length === 0 ? (
        <EmptyState title="Nenhum ambiente encontrado" />
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ambiente</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Capacidade</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Criticidade</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </Thead>
            <tbody className="divide-y divide-slate-100">
              {environments.map((env) => (
                <tr key={env.id} className={`group hover:bg-slate-50/50 transition-colors ${!env.active && 'opacity-60'}`}>
                  
                  {/* Nome e Código */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{env.name}</span>
                      <span className="text-xs font-mono font-medium text-slate-400 mt-0.5">{env.code}</span>
                    </div>
                  </td>
                  
                  {/* Tipo (com Ícone) */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg shadow-sm border border-slate-200/60">
                        {getEnvironmentIcon(env.type)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{environmentTypeLabels[env.type] || env.type}</span>
                    </div>
                  </td>

                  {/* Localização */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {env.building}</span>
                      <span className="text-xs text-slate-400 ml-5">{env.floor}</span>
                    </div>
                  </td>

                  {/* Capacidade */}
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-bold text-xs shadow-sm">
                      <Users className="h-3.5 w-3.5" />
                      {env.capacity}
                    </div>
                  </td>

                  {/* Criticidade (Badges Coloridos) */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${env.criticality === 'RESTRITO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        env.criticality === 'CONTROLADO' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'}
                    `}>
                      {env.criticality}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(env)} 
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      
                      {env.active && (
                        <button 
                          onClick={() => handleDeactivate(env)} 
                          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                          title="Desativar"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      
                      {!env.active && (
                        <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">Desativado</span>
                      )}
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal Reestilizado */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Ambiente" : "Criar Novo Ambiente"}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? "Salvar Alterações" : "Criar Ambiente"}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mt-2">
          <Input label="Código do Ambiente" placeholder="Ex: LAB-01" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Nome Descritivo" placeholder="Ex: Laboratório de Redes" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          
          <Select label="Tipo de Espaço" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(environmentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label as React.ReactNode}
              </option>
            ))}
          </Select>
          
          <Select label="Nível de Criticidade" value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value })}>
            <option value="COMUM">Comum (Acesso Livre)</option>
            <option value="CONTROLADO">Controlado (Aprovação Simples)</option>
            <option value="RESTRITO">Restrito (Alta Segurança)</option>
          </Select>
          
          <Input label="Campus/Unidade" placeholder="Ex: Campus Central" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prédio/Bloco" placeholder="Ex: Bloco A" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
            <Input label="Andar/Piso" placeholder="Ex: 2º Andar" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          </div>
          
          <Input
            type="number"
            label="Capacidade Máxima"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Input type="time" label="Hora de Abertura" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
            <Input type="time" label="Hora de Fecho" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
          </div>
          
          <label className="col-span-1 sm:col-span-2 flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-600"
              checked={form.requiresTechnicalResponsible}
              onChange={(e) => setForm({ ...form, requiresTechnicalResponsible: e.target.checked })}
            />
            <div>
              <p className="text-sm font-bold text-slate-800">Exige Responsável Técnico</p>
              <p className="text-xs text-slate-500 mt-0.5">Obrigatório para laboratórios com equipamentos delicados.</p>
            </div>
          </label>
          <label className="col-span-1 sm:col-span-2 flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-600"
              checked={form.requiresApproval}
              onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })}
            />
            <div>
              <p className="text-sm font-bold text-slate-800">Exige aprovação de gestor</p>
              <p className="mt-0.5 text-xs text-slate-500">Desmarque para aprovar automaticamente quando não houver análise técnica.</p>
            </div>
          </label>
          <label className="col-span-1 sm:col-span-2 flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-600"
              checked={form.requiresTechnicalReview}
              onChange={(e) => setForm({ ...form, requiresTechnicalReview: e.target.checked })}
            />
            <div>
              <p className="text-sm font-bold text-slate-800">Exige análise técnica</p>
              <p className="mt-0.5 text-xs text-slate-500">Solicitações passam pelo responsável técnico antes da aprovação de gestor.</p>
            </div>
          </label>
        </div>
      </Modal>
    </div>
  );
}
