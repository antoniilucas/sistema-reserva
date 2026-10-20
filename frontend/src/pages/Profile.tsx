import { FormEvent, useState } from "react";
import { Mail, Shield, CheckCircle2, XCircle, Pencil, Check, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { roleLabels } from "../utils/format";
import { toast } from "sonner";
import { getErrorMessage } from "../services/api";

// Função para extrair iniciais do nome (ex: "Pedro Teixeira" -> "PT")
const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function Profile() {
  const { user, updateName } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  async function handleSaveName(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("O nome deve ter pelo menos 2 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await updateName(name.trim());
      setEditingName(false);
      toast.success("Nome atualizado.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-4xl mx-auto w-full">
      
      {/* Cabeçalho Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Meu Perfil</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Consulte os dados da sua conta e o seu nível de acesso.</p>
        </div>
      </div>

      {/* Cartão de Perfil Principal */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
        
        {/* Banner de Fundo Sóbrio (Enterprise Dark) */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-slate-800 to-slate-900 w-full relative border-b border-slate-800">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/20"></div>
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">
          
          {/* Avatar e Nome (Sobrepostos ao Banner) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar Minimalista */}
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white p-1.5 shadow-md relative z-10">
                <div className="h-full w-full rounded-full bg-slate-50 flex items-center justify-center text-slate-800 text-3xl sm:text-4xl font-black tracking-tight border border-slate-200">
                  {getInitials(user?.name)}
                </div>
              </div>
              <div className="pb-2 mt-2 sm:mt-0">
                {editingName ? (
                  <form onSubmit={handleSaveName} className="flex flex-wrap items-center gap-2">
                    <input autoFocus value={name} onChange={(event) => setName(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-lg font-bold outline-none focus:border-blue-500" aria-label="Nome completo" />
                    <button disabled={saving} type="submit" className="rounded-lg bg-emerald-600 p-2 text-white disabled:opacity-50" aria-label="Salvar nome"><Check className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { setName(user?.name || ""); setEditingName(false); }} className="rounded-lg border border-slate-200 p-2 text-slate-500" aria-label="Cancelar edição"><X className="h-4 w-4" /></button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name || "Usuário"}</h2>
                    <button type="button" onClick={() => { setName(user?.name || ""); setEditingName(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" aria-label="Editar meu nome"><Pencil className="h-4 w-4" /></button>
                  </div>
                )}
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{roleLabels[user?.role || ""] || "Perfil não definido"}</p>
              </div>
            </div>
          </div>

          {/* Secção de Detalhes da Conta */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Informações de Contacto e Segurança</h3>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
              <ul className="flex flex-col divide-y divide-slate-100">
                
                {/* E-mail */}
                <li className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Endereço de E-mail</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                </li>

                {/* Perfil/Role */}
                <li className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nível de Permissão</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{roleLabels[user?.role || ""]}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm
                      ${user?.role === 'ADMINISTRADOR' ? 'bg-slate-800 text-white border-slate-700' : 
                        user?.role === 'GESTOR' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-slate-100 text-slate-600 border-slate-200'}
                    `}>
                      {user?.role}
                    </span>
                  </div>
                </li>

                {/* Status */}
                <li className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status da Conta</p>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">
                        {user?.status === "ATIVO" ? "A sua conta está ativa e em conformidade." : "A sua conta encontra-se suspensa."}
                      </p>
                    </div>
                  </div>
                  <div>
                    {user?.status === "ATIVO" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Conta Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                        <XCircle className="h-3.5 w-3.5" />
                        Bloqueada
                      </span>
                    )}
                  </div>
                </li>

              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
