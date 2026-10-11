# Backend

API REST em Node.js, Express, TypeScript, Prisma e PostgreSQL.

Siga o [guia de configuração da raiz](../README.md#configuração-e-execução) para iniciar o banco, criar `backend/.env`, instalar dependências e iniciar a aplicação. A referência de fluxos e endpoints está no [guia do sistema](../docs/guia-do-sistema.md).

Comandos usados dentro desta pasta:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

A API fica em `http://localhost:3000`; o health check é `GET /health` e as rotas da API usam o prefixo `/api`.
