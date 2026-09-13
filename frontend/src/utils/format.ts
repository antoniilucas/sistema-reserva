export function formatDate(value: string | Date): string {
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string | Date): string {
  const date = new Date(value);
  return date.toLocaleString("pt-BR");
}

export function formatTime(value: string | Date): string {
  const date = new Date(value);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const statusLabels: Record<string, string> = {
  SOLICITADA: "Solicitada",
  PENDENTE_APROVACAO: "Pendente de Aprovação",
  PENDENTE_ANALISE_TECNICA: "Pendente de Análise Técnica",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
  EM_USO: "Em Uso",
  ENCERRADA: "Encerrada",
  NO_SHOW: "No-show",
};

export const statusColors: Record<string, string> = {
  SOLICITADA: "bg-slate-100 text-slate-700",
  PENDENTE_APROVACAO: "bg-amber-100 text-amber-700",
  PENDENTE_ANALISE_TECNICA: "bg-amber-100 text-amber-700",
  APROVADA: "bg-emerald-100 text-emerald-700",
  RECUSADA: "bg-red-100 text-red-700",
  CANCELADA: "bg-slate-200 text-slate-600",
  EM_USO: "bg-blue-100 text-blue-700",
  ENCERRADA: "bg-slate-100 text-slate-500",
  NO_SHOW: "bg-red-100 text-red-800",
};

export const environmentTypeLabels: Record<string, string> = {
  SALA: "Sala",
  LABORATORIO: "Laboratório",
  AUDITORIO: "Auditório",
  SALA_REUNIAO: "Sala de Reunião",
  ESTUDIO: "Estúdio",
  MULTIUSO: "Multiuso",
};

export const roleLabels: Record<string, string> = {
  SOLICITANTE: "Solicitante",
  GESTOR: "Gestor",
  ADMINISTRADOR: "Administrador",
  RESPONSAVEL_TECNICO: "Responsável Técnico",
  SUPORTE: "Equipe de Suporte",
};
