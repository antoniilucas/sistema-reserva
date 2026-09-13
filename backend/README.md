# Backend — Sistema de Reserva de Salas e Laboratórios

API REST em Node.js + Express + TypeScript + Prisma + PostgreSQL.

Consulte o README na raiz do projeto para instruções completas de instalação, configuração de `.env`, migrations, seed e execução.

Resumo rápido:

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

API disponível em `http://localhost:3000` (rotas sob `/api`, health-check em `/health`).
