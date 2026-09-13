# Sistema de Reserva de Salas e Laboratórios

Sistema Full Stack para gerenciamento e controle de reservas de ambientes físicos (salas de aula, laboratórios, auditórios, salas de reunião e salas multiuso), desenvolvido para um trabalho acadêmico de Project Lab, com arquitetura profissional, organizada e escalável.

## Sobre o projeto

O sistema permite que usuários consultem a disponibilidade de ambientes e solicitem reservas, que podem ser aprovadas automaticamente ou passar por fluxos de aprovação/análise técnica, dependendo das regras configuradas para cada ambiente e do perfil do solicitante.

Principais capacidades:

- Consulta de disponibilidade com detecção de conflitos (reservas, buffers de setup/limpeza, bloqueios administrativos e horário de funcionamento).
- Criação de reservas simples, recorrentes (semanal/quinzenal) e em cadeia (vinculadas a um mesmo evento).
- Fluxo de aprovação/recusa por Gestores e análise técnica para laboratórios.
- Check-in / check-out com controle de tolerância e marcação automática de **NO_SHOW**.
- Cancelamento e alteração de reservas com nova validação de conflitos e auditoria.
- Registro de ocorrências, penalidades e bloqueios de agenda.
- Solicitações de suporte (TI, Audiovisual, Técnico de Laboratório).
- Auditoria completa de ações relevantes do sistema.
- Relatórios e dashboards com indicadores de ocupação, cancelamentos, recusas e no-show.

> **Observação sobre escopo:** este é um projeto acadêmico abrangente. O núcleo de regras de negócio (conflitos, aprovação, check-in/out, no-show, auditoria, permissões) está implementado de ponta a ponta. Alguns fluxos avançados (ex.: penalidades automáticas recorrentes, notificações em tempo real) foram implementados em sua forma essencial/fundacional, prontos para evolução.

## Tecnologias

### Frontend
- React + Vite + TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form + Zod
- Recharts (gráficos)
- Sonner (notificações)
- Lucide React (ícones)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- JWT (autenticação)
- bcrypt (hash de senhas)
- Zod (validação)

### Banco de Dados
- PostgreSQL (via Docker)

## Estrutura do projeto

```text
sistema-reserva/
├── frontend/           # Aplicação React (SPA)
│   └── src/
│       ├── components/ # Componentes reutilizáveis (UI)
│       ├── pages/      # Páginas / telas do sistema
│       ├── layouts/     # Layout com sidebar/navbar por perfil
│       ├── services/    # Camada de acesso à API (axios)
│       ├── hooks/        # Hooks customizados
│       ├── contexts/     # Contexto de autenticação
│       ├── routes/       # Proteção de rotas por perfil
│       ├── types/         # Tipos TypeScript compartilhados
│       └── utils/          # Formatação e utilitários
│
├── backend/             # API REST Node/Express
│   ├── prisma/
│   │   ├── schema.prisma  # Modelagem do banco de dados
│   │   └── seed.ts         # Dados iniciais (usuários, ambientes, etc.)
│   └── src/
│       ├── controllers/    # Recebem requests e retornam responses
│       ├── services/        # Regras de negócio (inclui conflict.service.ts, central)
│       ├── repositories/     # Acesso ao banco via Prisma
│       ├── routes/            # Definição dos endpoints
│       ├── middlewares/        # authenticate, authorize, validate, errorHandler
│       ├── validators/          # Schemas Zod de validação de entrada
│       ├── types/                 # Tipos TypeScript
│       ├── utils/                  # AppError, JWT, auditoria, datas
│       └── config/                  # Configuração de env e Prisma Client
│
├── docker-compose.yml   # PostgreSQL via Docker
├── .env.example
├── .gitignore
└── README.md
```

## Pré-requisitos

- Node.js 18+ e npm
- Docker e Docker Compose

## Como instalar

Clone ou extraia o projeto e instale as dependências de backend e frontend:

```bash
cd sistema-reserva/backend
npm install

cd ../frontend
npm install
```

## Como configurar as variáveis de ambiente

### Backend

```bash
cd backend
cp .env.example .env
```

No Windows (PowerShell):

```powershell
cd backend
copy .env.example .env
```

Conteúdo esperado de `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reserva_db?schema=public"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
CHECKIN_TOLERANCE_MINUTES=15
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

No Windows (PowerShell):

```powershell
cd frontend
copy .env.example .env
```

Conteúdo esperado de `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Como iniciar o banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe um container PostgreSQL na porta `5432`, com volume persistente (`reserva_postgres_data`).

## Como executar as migrations (Prisma)

```bash
cd backend
npx prisma migrate dev --name init
```

Esse comando cria as tabelas no banco de acordo com `prisma/schema.prisma` e gera o Prisma Client.

Caso queira apenas gerar o client sem migrar (ex.: ambiente já migrado):

```bash
npx prisma generate
```

## Como executar o seed

```bash
cd backend
npm run seed
```

O seed cria usuários de teste, ambientes (sala, laboratório, auditório, sala de reunião, sala multiuso), recursos e algumas reservas de exemplo.

## Como rodar o Backend

```bash
cd backend
npm run dev
```

A API sobe em `http://localhost:3000` (rota de verificação: `GET /health`). Todas as rotas ficam sob o prefixo `/api`.

## Como rodar o Frontend

```bash
cd frontend
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Credenciais de teste

> Senhas de desenvolvimento — utilize apenas em ambiente local.

| Perfil                | E-mail                    | Senha  |
|------------------------|----------------------------|--------|
| Administrador           | admin@sistema.com          | 123456 |
| Gestor                   | gestor@sistema.com          | 123456 |
| Solicitante               | usuario@sistema.com          | 123456 |
| Responsável Técnico         | tecnico@sistema.com            | 123456 |
| Equipe de Suporte             | suporte@sistema.com              | 123456 |

## Fluxo resumido de uso

1. Faça login com uma das credenciais de teste.
2. Como **Solicitante**, acesse "Nova Reserva" → informe data/horário → consulte disponibilidade → selecione o ambiente → preencha finalidade, participantes e recursos → aceite o termo → confirme.
3. Como **Gestor**, acesse "Solicitações Pendentes" para aprovar ou recusar (com motivo obrigatório) as reservas que exigem aprovação.
4. Reservas aprovadas podem receber **check-in** (marcando `EM_USO`) e depois **check-out** (marcando `ENCERRADA`). Se o check-in não ocorrer dentro da tolerância configurada, a reserva é automaticamente marcada como `NO_SHOW` na primeira interação subsequente com ela.
5. Como **Administrador**, gerencie usuários, ambientes, recursos, bloqueios de agenda, penalidades e consulte auditoria e relatórios.

## Principais endpoints da API

Todas as rotas (exceto `/auth/login`) exigem o header `Authorization: Bearer <token>`.

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id/status

GET    /api/environments
POST   /api/environments
GET    /api/environments/:id
PUT    /api/environments/:id
DELETE /api/environments/:id

GET    /api/resources
POST   /api/resources
PUT    /api/resources/:id
DELETE /api/resources/:id
POST   /api/resources/environments/:environmentId/link

GET    /api/availability?date=&startTime=&endTime=&environmentType=

GET    /api/reservations
POST   /api/reservations
POST   /api/reservations/recurring
POST   /api/reservations/chain
GET    /api/reservations/:id
PUT    /api/reservations/:id
POST   /api/reservations/:id/cancel
POST   /api/reservations/:id/check-in
POST   /api/reservations/:id/check-out
POST   /api/reservations/:id/approve
POST   /api/reservations/:id/reject

GET    /api/approvals/pending

GET    /api/blocks
POST   /api/blocks
DELETE /api/blocks/:id

GET    /api/occurrences
POST   /api/occurrences
GET    /api/occurrences/reservation/:reservationId

GET    /api/penalties
POST   /api/penalties
GET    /api/penalties/user/:userId

GET    /api/support
POST   /api/support
PATCH  /api/support/:id/status

GET    /api/audit

GET    /api/reports/overview
```

## Regras de negócio implementadas (resumo)

- **Conflito de reservas**: centralizado em `backend/src/services/conflict.service.ts`, considerando reservas ativas, buffers de setup/limpeza, bloqueios administrativos e horário de funcionamento. Nenhum controller duplica essa lógica.
- **Status da reserva**: `SOLICITADA → PENDENTE_APROVACAO/PENDENTE_ANALISE_TECNICA → APROVADA → EM_USO → ENCERRADA`, com desvios possíveis para `RECUSADA`, `CANCELADA` e `NO_SHOW`.
- **No-show**: reservas aprovadas não são canceladas automaticamente; permanecem `APROVADA` até o check-in ser tentado (ou uma rotina/consulta identificar o vencimento da tolerância), quando então são marcadas como `NO_SHOW`, liberando o ambiente e preservando o histórico.
- **Extensão de reserva**: **não implementada**, propositalmente, conforme especificação — para usar o ambiente novamente, uma nova reserva deve ser criada.
- **Alteração de reserva**: revalida disponibilidade, conflitos, antecedência e capacidade; reservas já aprovadas podem retornar ao fluxo de aprovação.
- **Check-in / Check-out**: restritos ao solicitante, ao responsável pela atividade ou ao administrador — nunca a participantes comuns.
- **Auditoria**: toda ação relevante (criar, aprovar, recusar, cancelar, alterar, check-in/out, aplicar penalidade, criar bloqueio) é registrada com usuário, ação, entidade, dados anteriores e posteriores.
- **Permissões**: validadas tanto no frontend (ocultando funcionalidades) quanto — de forma obrigatória — no backend (middlewares `authenticate` e `authorize`).

## Qualidade de código

- TypeScript estrito em frontend e backend.
- Separação clara de responsabilidades: controllers finos, regras de negócio nos services, acesso a dados nos repositories.
- Lógica de conflito de horário centralizada e reutilizada (não duplicada).
- Tratamento de erros centralizado (`errorHandler`) com códigos HTTP semânticos (400, 401, 403, 404, 409, 500).
- Componentes de UI reutilizáveis (botões, inputs, tabelas, modais, cards, badges de status).

## Scripts úteis

Backend (`backend/package.json`):

```bash
npm run dev              # inicia a API em modo desenvolvimento
npm run build             # compila TypeScript
npm run start               # executa a versão compilada
npm run prisma:migrate       # executa migrations em desenvolvimento
npm run prisma:studio         # abre o Prisma Studio
npm run seed                   # popula o banco com dados iniciais
```

Frontend (`frontend/package.json`):

```bash
npm run dev      # inicia o servidor de desenvolvimento (Vite)
npm run build     # gera build de produção
npm run preview    # pré-visualiza o build de produção
```
