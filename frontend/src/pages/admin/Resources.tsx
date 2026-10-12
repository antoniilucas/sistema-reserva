import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Ban, Monitor, Mic, Projector, Box, Package } from "lucide-react";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Thead } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { resourceService } from "../../services/resource.service";
import { Resource } from "../../types";
import { getErrorMessage } from "../../services/api";

// Função para escolher o ícone baseado no nome do recurso
const getResourceIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("computador") || lowerName.includes("notebook")) {
    return <Monitor className="h-5 w-5 text-blue-600" />;
  }
  if (lowerName.includes("áudio") || lowerName.includes("audio") || lowerName.includes("microfone") || lowerName.includes("caixa")) {
    return <Mic className="h-5 w-5 text-purple-600" />;
  }
  if (lowerName.includes("projetor") || lowerName.includes("datashow") || lowerName.includes("tela")) {
    return <Projector className="h-5 w-5 text-emerald-600" />;
  }
  return <Box className="h-5 w-5 text-slate-600" />;
};

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
      toast.success("Recurso criado com sucesso.");
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
    if (!confirm(`Tem certeza que deseja desativar o recurso ${r.name}?`)) return;
    try {
      await resourceService.deactivate(r.id);
      toast.success("Recurso desativado com sucesso.");
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recursos e Equipamentos</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Faça a gestão dos equipamentos disponíveis para as reservas.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 px-5 transition-all shadow-md"
        >
          <PlusCircle className="h-4 w-4" /> Novo Recurso
        </button>
      </div>

      {/* Tabela de Recursos */}
      {loading ? (
        <LoadingState />
      ) : resources.length === 0 ? (
        <EmptyState title="Nenhum recurso cadastrado" />
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Recurso</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Alocação</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Quantidade</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </Thead>
            <tbody className="divide-y divide-slate-100">
              {resources.map((r) => (
                <tr key={r.id} className={`group hover:bg-slate-50/50 transition-colors ${!r.active && 'opacity-60'}`}>
                  
                  {/* Nome com Ícone */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        {getResourceIcon(r.name)}
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{r.name}</span>
                    </div>
                  </td>
                  
                  {/* Tipo */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${r.kind === 'FIXO' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-purple-50 text-purple-700 border-purple-200'}
                    `}>
                      {r.kind === "FIXO" ? "Fixo" : "Opcional"}
                    </span>
                  </td>

                  {/* Quantidade */}
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-bold text-xs shadow-sm">
                      <Package className="h-3.5 w-3.5 text-slate-400" />
                      {r.quantity}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {r.active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Inativo
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.active ? (
                        <button 
                          onClick={() => handleDeactivate(r)} 
                          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                          title="Desativar"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
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
        title="Registar Novo Recurso"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleCreate}>
              Confirmar Registo
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 mt-2">
          <Input 
            label="Nome do Equipamento" 
            placeholder="Ex: Projetor Epson, Microfone de Lapela..."
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
          
          <Select 
            label="Tipo de Alocação" 
            value={form.kind} 
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          >
            <option value="OPCIONAL">Opcional (Pode ser movido entre salas)</option>
            <option value="FIXO">Fixo (Pertence a uma sala específica)</option>
          </Select>
          
          <Input
            type="number"
            label="Quantidade Disponível"
            value={form.quantity}
            min={1}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </div>
      </Modal>
    </div>
  );
}