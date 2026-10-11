import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Search, Database, Plus, Pencil, Trash2, Activity, Clock, UserCog, TerminalSquare } from "lucide-react";
import { Table } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { auditService } from "../../services/audit.service";
import { AuditLog } from "../../types";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

// Função para extrair iniciais do nome
const getInitials = (name?: string) => {
  if (!name || name.toLowerCase() === "sistema") return "S";
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// Função para estilizar a ação baseada no seu tipo
const getActionBadge = (action: string) => {
  const act = action.toUpperCase();
  if (act.includes("CREATE") || act.includes("INSERT") || act.includes("CRIAR") || act.includes("ADD")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Plus className="h-3 w-3" /> {action}
      </span>
    );
  }
  if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("ATUALIZAR")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
        <Pencil className="h-3 w-3" /> {action}
      </span>
    );
  }
  if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("APAGAR")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
        <Trash2 className="h-3 w-3" /> {action}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
      <Activity className="h-3 w-3" /> {action}
    </span>
  );
};

export default function AuditAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await auditService.list();
      setLogs(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Cabeçalho Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" /> Auditoria de Sistema
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Registo imutável de todas as ações e alterações na plataforma.</p>
        </div>
        <button 
          onClick={loadLogs}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl py-2.5 px-5 transition-all shadow-sm"
        >
          <Search className="h-4 w-4" /> Atualizar Registos
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        /* Empty State Premium */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <Database className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum registo de auditoria</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            As ações dos utilizadores e do sistema começarão a aparecer aqui assim que ocorrerem.
          </p>
        </div>
      ) : (
        /* Tabela Premium */
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Autor da Ação</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Operação</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Entidade Afetada</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Data e Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const isSystem = !log.user?.name || log.user?.name.toLowerCase() === "sistema";
                
                return (
                  <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                    
                    {/* Autor */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border
                          ${isSystem 
                            ? 'bg-slate-800 text-white border-slate-900' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'}
                        `}>
                          {isSystem ? <TerminalSquare className="h-4 w-4" /> : getInitials(log.user?.name)}
                        </div>
                        <span className={`text-sm font-bold transition-colors
                          ${isSystem ? 'text-slate-700' : 'text-slate-900 group-hover:text-indigo-600'}
                        `}>
                          {log.user?.name || "Sistema Automático"}
                        </span>
                      </div>
                    </td>
                    
                    {/* Ação */}
                    <td className="py-4 px-6">
                      {getActionBadge(log.action)}
                    </td>
                    
                    {/* Entidade */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 text-slate-400" />
                          {log.entity}
                        </span>
                        {log.entityId && (
                          <span className="text-[11px] font-mono font-medium text-slate-400 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded w-fit border border-slate-200">
                            ID: {log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Data */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}