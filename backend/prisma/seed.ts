import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sistema.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@sistema.com",
      passwordHash,
      role: "ADMINISTRADOR",
      status: "ATIVO",
    },
  });

  const gestor = await prisma.user.upsert({
    where: { email: "gestor@sistema.com" },
    update: {},
    create: {
      name: "Gestor",
      email: "gestor@sistema.com",
      passwordHash,
      role: "GESTOR",
      status: "ATIVO",
    },
  });

  const solicitante = await prisma.user.upsert({
    where: { email: "usuario@sistema.com" },
    update: {},
    create: {
      name: "Solicitante",
      email: "usuario@sistema.com",
      passwordHash,
      role: "SOLICITANTE",
      status: "ATIVO",
    },
  });

  const tecnico = await prisma.user.upsert({
    where: { email: "tecnico@sistema.com" },
    update: {},
    create: {
      name: "Responsável Técnico",
      email: "tecnico@sistema.com",
      passwordHash,
      role: "RESPONSAVEL_TECNICO",
      status: "ATIVO",
    },
  });

  const suporte = await prisma.user.upsert({
    where: { email: "suporte@sistema.com" },
    update: {},
    create: {
      name: "Equipe de Suporte",
      email: "suporte@sistema.com",
      passwordHash,
      role: "SUPORTE",
      status: "ATIVO",
    },
  });

  console.log("Usuários criados.");

  // ===== Recursos =====
  const projetor = await prisma.resource.create({
    data: { name: "Projetor", kind: "OPCIONAL", quantity: 5 },
  });
  const computador = await prisma.resource.create({
    data: { name: "Computador", kind: "FIXO", quantity: 20 },
  });
  const microfone = await prisma.resource.create({
    data: { name: "Microfone", kind: "OPCIONAL", quantity: 3 },
  });
  const kitMovel = await prisma.resource.create({
    data: { name: "Kit Móvel de Áudio", kind: "OPCIONAL", quantity: 2 },
  });

  console.log("Recursos criados.");

  // ===== Ambientes =====
  const sala101 = await prisma.environment.create({
    data: {
      code: "SALA-101",
      name: "Sala 101",
      type: "SALA",
      campus: "Campus Central",
      building: "Bloco A",
      floor: "1º andar",
      capacity: 40,
      criticality: "COMUM",
      openingTime: "07:00",
      closingTime: "22:00",
      setupBufferMinutes: 10,
      cleanupBufferMinutes: 10,
      rules: {
        create: [
          {
            minAdvanceMinutes: 30,
            maxAdvanceDays: 60,
            maxDurationMinutes: 240,
            requiresApproval: false,
          },
        ],
      },
      resources: {
        create: [{ resourceId: projetor.id, mandatory: false }],
      },
    },
  });

  const labInfo = await prisma.environment.create({
    data: {
      code: "LAB-INFO-01",
      name: "Laboratório de Informática 01",
      type: "LABORATORIO",
      campus: "Campus Central",
      building: "Bloco B",
      floor: "2º andar",
      capacity: 25,
      criticality: "CONTROLADO",
      requiresTechnicalResponsible: true,
      technicalNotes: "Necessário validação do responsável técnico antes da aprovação.",
      openingTime: "08:00",
      closingTime: "21:00",
      setupBufferMinutes: 15,
      cleanupBufferMinutes: 15,
      rules: {
        create: [
          {
            minAdvanceMinutes: 120,
            maxAdvanceDays: 30,
            maxDurationMinutes: 180,
            requiresApproval: true,
            requiresTechnicalReview: true,
          },
        ],
      },
      resources: {
        create: [
          { resourceId: computador.id, mandatory: true },
          { resourceId: projetor.id, mandatory: false },
        ],
      },
    },
  });

  const auditorio = await prisma.environment.create({
    data: {
      code: "AUD-01",
      name: "Auditório Principal",
      type: "AUDITORIO",
      campus: "Campus Central",
      building: "Bloco C",
      floor: "Térreo",
      capacity: 200,
      criticality: "RESTRITO",
      openingTime: "07:00",
      closingTime: "23:00",
      setupBufferMinutes: 30,
      cleanupBufferMinutes: 30,
      rules: {
        create: [
          {
            minAdvanceMinutes: 1440,
            maxAdvanceDays: 90,
            maxDurationMinutes: 360,
            requiresApproval: true,
            allowedRoles: ["GESTOR", "ADMINISTRADOR"],
          },
        ],
      },
      resources: {
        create: [
          { resourceId: microfone.id, mandatory: true },
          { resourceId: kitMovel.id, mandatory: false },
        ],
      },
    },
  });

  const salaReuniao = await prisma.environment.create({
    data: {
      code: "SR-01",
      name: "Sala de Reunião Executiva",
      type: "SALA_REUNIAO",
      campus: "Campus Central",
      building: "Bloco A",
      floor: "3º andar",
      capacity: 12,
      criticality: "COMUM",
      openingTime: "08:00",
      closingTime: "20:00",
      rules: {
        create: [
          {
            minAdvanceMinutes: 30,
            maxAdvanceDays: 45,
            maxDurationMinutes: 120,
            requiresApproval: false,
          },
        ],
      },
    },
  });

  await prisma.environment.create({
    data: {
      code: "MULTI-01",
      name: "Sala Multiuso 01",
      type: "MULTIUSO",
      campus: "Campus Central",
      building: "Bloco D",
      floor: "1º andar",
      capacity: 60,
      criticality: "COMUM",
      openingTime: "07:00",
      closingTime: "22:00",
      rules: {
        create: [
          {
            minAdvanceMinutes: 60,
            maxAdvanceDays: 60,
            maxDurationMinutes: 300,
            requiresApproval: true,
          },
        ],
      },
    },
  });

  console.log("Ambientes criados.");

  // ===== Reservas de exemplo =====
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const start1 = new Date(tomorrow);
  start1.setHours(10, 0, 0, 0);
  const end1 = new Date(tomorrow);
  end1.setHours(12, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      environmentId: sala101.id,
      requestedById: solicitante.id,
      responsibleId: solicitante.id,
      purpose: "Aula de reforço de Matemática",
      participantsCount: 30,
      date: tomorrow,
      startTime: start1,
      endTime: end1,
      status: "APROVADA",
      termsAccepted: true,
      approvedById: gestor.id,
    },
  });

  const start2 = new Date(tomorrow);
  start2.setHours(14, 0, 0, 0);
  const end2 = new Date(tomorrow);
  end2.setHours(16, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      environmentId: labInfo.id,
      requestedById: solicitante.id,
      responsibleId: tecnico.id,
      purpose: "Prática de programação",
      participantsCount: 20,
      date: tomorrow,
      startTime: start2,
      endTime: end2,
      status: "PENDENTE_ANALISE_TECNICA",
      termsAccepted: true,
    },
  });

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const start3 = new Date(dayAfter);
  start3.setHours(9, 0, 0, 0);
  const end3 = new Date(dayAfter);
  end3.setHours(11, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      environmentId: salaReuniao.id,
      requestedById: solicitante.id,
      responsibleId: solicitante.id,
      purpose: "Reunião de planejamento do projeto",
      participantsCount: 8,
      date: dayAfter,
      startTime: start3,
      endTime: end3,
      status: "PENDENTE_APROVACAO",
      termsAccepted: true,
    },
  });

  console.log("Reservas de exemplo criadas.");
  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
