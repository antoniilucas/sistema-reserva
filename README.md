# Sistema de Reserva de Salas e Laboratórios

Aplicação full stack para consultar disponibilidade e reservar salas, laboratórios e outros ambientes. O sistema também oferece fluxos de aprovação, análise técnica, check-in e check-out, suporte e administração.

## Tecnologias

- **Frontend:** React, Vite, TypeScript e Tailwind CSS.
- **Backend:** Node.js, Express, TypeScript e Prisma.
- **Banco de dados:** PostgreSQL.

## Estrutura

```text
sistema-reserva/
├── backend/       # API, regras de negócio e schema/migrations Prisma
├── frontend/      # Aplicação web
├── docs/          # Documentação funcional e referência da API
├── docker-compose.yml
└── README.md
```

## Pré-requisitos

- Node.js 18 ou superior e npm.
- Docker Desktop (ou Docker Engine com Compose).

## Configuração e execução

### 1. Inicie o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d
```

O banco fica disponível em `localhost:5433`. O arquivo `.env.example` na raiz contém as variáveis usadas pelo Docker Compose.

### 2. Configure o backend

Crie `backend/.env` com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/reserva_db?schema=public"
JWT_SECRET="troque-por-uma-chave-segura"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
CHECKIN_TOLERANCE_MINUTES=15
```

Instale as dependências, aplique as migrations existentes e carregue os dados de demonstração:

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

A API ficará em `http://localhost:3000`; o health check está em `/health` e as rotas da API usam o prefixo `/api`.

### 3. Configure e inicie o frontend

Em outro terminal, crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Depois:

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará em `http://localhost:5173`.

## Acesso local

O seed cria contas para demonstração. Todas usam a senha `123456`:

| Perfil | E-mail |
|---|---|
| Administrador | `admin@sistema.com` |
| Gestor | `gestor@sistema.com` |
| Solicitante | `usuario@sistema.com` |
| Responsável técnico | `tecnico@sistema.com` |
| Suporte | `suporte@sistema.com` |

Também é possível criar uma conta de solicitante pela opção **Cadastre-se** na tela de login.

## Documentação

- [Guia funcional e regras do sistema](docs/guia-do-sistema.md): fluxos, perfis, regras e endpoints da API.
- [README do backend](backend/README.md).
- [README do frontend](frontend/README.md).

## Scripts principais

| Diretório | Comando | Descrição |
|---|---|---|
| `backend` | `npm run dev` | Inicia a API em desenvolvimento. |
| `backend` | `npm run build` | Compila o backend. |
| `backend` | `npm run seed` | Carrega dados de demonstração. |
| `backend` | `npm run prisma:studio` | Abre o Prisma Studio. |
| `frontend` | `npm run dev` | Inicia o frontend em desenvolvimento. |
| `frontend` | `npm run build` | Gera o build de produção. |
| `frontend` | `npm run preview` | Pré-visualiza o build de produção. |

> As credenciais e configurações acima são destinadas ao desenvolvimento local. Troque os segredos e as senhas antes de usar o sistema em outro ambiente.
