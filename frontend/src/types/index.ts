export type RoleName =
  | "SOLICITANTE"
  | "GESTOR"
  | "ADMINISTRADOR"
  | "RESPONSAVEL_TECNICO"
  | "SUPORTE";

export type UserStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";

export type EnvironmentType =
  | "SALA"
  | "LABORATORIO"
  | "AUDITORIO"
  | "SALA_REUNIAO"
  | "ESTUDIO"
  | "MULTIUSO";

export type Criticality = "COMUM" | "CONTROLADO" | "RESTRITO";

export type ReservationStatus =
  | "SOLICITADA"
  | "PENDENTE_APROVACAO"
  | "PENDENTE_ANALISE_TECNICA"
  | "APROVADA"
  | "RECUSADA"
  | "CANCELADA"
  | "EM_USO"
  | "ENCERRADA"
  | "NO_SHOW";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: UserStatus;
  createdAt?: string;
}

export interface EnvironmentRule {
  id: string;
  minAdvanceMinutes: number;
  maxAdvanceDays: number;
  maxDurationMinutes: number;
  requiresApproval: boolean;
  requiresTechnicalReview: boolean;
  allowedRoles: string[];
}

export interface Resource {
  id: string;
  name: string;
  kind: "FIXO" | "OPCIONAL";
  quantity: number;
  active: boolean;
}

export interface Environment {
  id: string;
  code: string;
  name: string;
  type: EnvironmentType;
  campus: string;
  building: string;
  floor: string;
  location?: string;
  capacity: number;
  criticality: Criticality;
  active: boolean;
  requiresTechnicalResponsible: boolean;
  openingTime: string;
  closingTime: string;
  setupBufferMinutes: number;
  cleanupBufferMinutes: number;
  rules: EnvironmentRule[];
  resources: { resource: Resource; mandatory: boolean }[];
}

export interface Reservation {
  id: string;
  code: string;
  environmentId: string;
  environment: Environment;
  requestedById: string;
  requestedBy: { id: string; name: string; email: string };
  responsibleId: string;
  responsible: { id: string; name: string; email: string };
  approvedById?: string;
  approvedBy?: { id: string; name: string; email: string };
  purpose: string;
  participantsCount: number;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  checkInAt?: string;
  checkOutAt?: string;
  createdAt: string;
  participants?: { id: string; name: string; email?: string }[];
  resources?: { resource: Resource; quantity: number }[];
  occurrences?: Occurrence[];
}

export interface Occurrence {
  id: string;
  reservationId: string;
  type: "DANO" | "INCIDENTE" | "ATRASO" | "FALHA_TECNICA" | "LIMPEZA" | "OUTRO";
  description: string;
  createdAt: string;
  reportedBy?: { id: string; name: string };
}

export interface Penalty {
  id: string;
  userId: string;
  user?: { id: string; name: string };
  reason: string;
  description?: string;
  blockedUntil?: string;
  createdAt: string;
}

export interface SupportRequest {
  id: string;
  reservationId: string;
  reservation?: Reservation;
  type: "TI" | "AUDIOVISUAL" | "TECNICO_LABORATORIO";
  description: string;
  status: "ABERTA" | "ACEITA" | "RECUSADA" | "EM_ANDAMENTO" | "CONCLUIDA";
  requestedBy?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  environmentId: string;
  environment?: Environment;
  reason: "MANUTENCAO" | "LIMPEZA" | "EVENTO_INSTITUCIONAL" | "AULA_FIXA" | "OUTRO";
  description?: string;
  startDateTime: string;
  endDateTime: string;
  createdBy?: { id: string; name: string };
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: { id: string; name: string; email: string };
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

export interface ReportOverview {
  totalReservations: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  noShow: number;
  inUse: number;
  closed: number;
  activeEnvironments: number;
  occurrencesCount: number;
  penaltiesCount: number;
  occupancyRate: number;
  mostUsedEnvironments: { environment?: Environment; total: number }[];
  byStatus: { status: ReservationStatus; total: number }[];
}
