-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('SOLICITANTE', 'GESTOR', 'ADMINISTRADOR', 'RESPONSAVEL_TECNICO', 'SUPORTE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "EnvironmentType" AS ENUM ('SALA', 'LABORATORIO', 'AUDITORIO', 'SALA_REUNIAO', 'ESTUDIO', 'MULTIUSO');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('COMUM', 'CONTROLADO', 'RESTRITO');

-- CreateEnum
CREATE TYPE "ResourceKind" AS ENUM ('FIXO', 'OPCIONAL');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('SOLICITADA', 'PENDENTE_APROVACAO', 'PENDENTE_ANALISE_TECNICA', 'APROVADA', 'RECUSADA', 'CANCELADA', 'EM_USO', 'ENCERRADA', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('SEMANAL', 'QUINZENAL');

-- CreateEnum
CREATE TYPE "BlockReason" AS ENUM ('MANUTENCAO', 'LIMPEZA', 'EVENTO_INSTITUCIONAL', 'AULA_FIXA', 'OUTRO');

-- CreateEnum
CREATE TYPE "OccurrenceType" AS ENUM ('DANO', 'INCIDENTE', 'ATRASO', 'FALHA_TECNICA', 'LIMPEZA', 'OUTRO');

-- CreateEnum
CREATE TYPE "PenaltyReason" AS ENUM ('NO_SHOW', 'CANCELAMENTO_TARDIO', 'DANO', 'INCIDENTE', 'OUTRO');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('TI', 'AUDIOVISUAL', 'TECNICO_LABORATORIO');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('ABERTA', 'ACEITA', 'RECUSADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "RoleName" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EnvironmentType" NOT NULL,
    "campus" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "location" TEXT,
    "capacity" INTEGER NOT NULL,
    "criticality" "Criticality" NOT NULL DEFAULT 'COMUM',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "requiresTechnicalResponsible" BOOLEAN NOT NULL DEFAULT false,
    "technicalNotes" TEXT,
    "openingTime" TEXT NOT NULL DEFAULT '07:00',
    "closingTime" TEXT NOT NULL DEFAULT '22:00',
    "setupBufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "cleanupBufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentRule" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "minAdvanceMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 60,
    "maxDurationMinutes" INTEGER NOT NULL DEFAULT 240,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "requiresTechnicalReview" BOOLEAN NOT NULL DEFAULT false,
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvironmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ResourceKind" NOT NULL DEFAULT 'OPCIONAL',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentResource" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EnvironmentResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationChain" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationChain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringReservation" (
    "id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "daysOfWeek" INTEGER[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,
    "approvedById" TEXT,
    "chainId" TEXT,
    "recurringId" TEXT,
    "purpose" TEXT NOT NULL,
    "participantsCount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'SOLICITADA',
    "rejectionReason" TEXT,
    "cancellationReason" TEXT,
    "cancelledById" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "checkoutChecklist" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationParticipant" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "ReservationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationResource" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ReservationResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "reason" "BlockReason" NOT NULL,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occurrence" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "type" "OccurrenceType" NOT NULL,
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penalty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reservationId" TEXT,
    "reason" "PenaltyReason" NOT NULL,
    "description" TEXT,
    "blockedUntil" TIMESTAMP(3),
    "appliedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "type" "SupportType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SupportStatus" NOT NULL DEFAULT 'ABERTA',
    "requestedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_code_key" ON "Environment"("code");

-- CreateIndex
CREATE INDEX "Environment_type_idx" ON "Environment"("type");

-- CreateIndex
CREATE INDEX "Environment_campus_building_idx" ON "Environment"("campus", "building");

-- CreateIndex
CREATE INDEX "EnvironmentRule_environmentId_idx" ON "EnvironmentRule"("environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentResource_environmentId_resourceId_key" ON "EnvironmentResource"("environmentId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_code_key" ON "Reservation"("code");

-- CreateIndex
CREATE INDEX "Reservation_environmentId_date_idx" ON "Reservation"("environmentId", "date");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_requestedById_idx" ON "Reservation"("requestedById");

-- CreateIndex
CREATE INDEX "ReservationParticipant_reservationId_idx" ON "ReservationParticipant"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationResource_reservationId_resourceId_key" ON "ReservationResource"("reservationId", "resourceId");

-- CreateIndex
CREATE INDEX "ScheduleBlock_environmentId_startDateTime_endDateTime_idx" ON "ScheduleBlock"("environmentId", "startDateTime", "endDateTime");

-- CreateIndex
CREATE INDEX "Occurrence_reservationId_idx" ON "Occurrence"("reservationId");

-- CreateIndex
CREATE INDEX "Penalty_userId_idx" ON "Penalty"("userId");

-- CreateIndex
CREATE INDEX "SupportRequest_reservationId_idx" ON "SupportRequest"("reservationId");

-- CreateIndex
CREATE INDEX "SupportRequest_status_idx" ON "SupportRequest"("status");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "EnvironmentRule" ADD CONSTRAINT "EnvironmentRule_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentResource" ADD CONSTRAINT "EnvironmentResource_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentResource" ADD CONSTRAINT "EnvironmentResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "ReservationChain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "RecurringReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationParticipant" ADD CONSTRAINT "ReservationParticipant_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationParticipant" ADD CONSTRAINT "ReservationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationResource" ADD CONSTRAINT "ReservationResource_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationResource" ADD CONSTRAINT "ReservationResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
