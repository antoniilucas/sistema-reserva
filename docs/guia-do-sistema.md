# Guia do sistema

Esta página reúne os principais fluxos, regras e rotas da API do Sistema de Reserva.

## Funcionalidades

- Cadastro de solicitantes, login e controle de acesso por perfil.
- Consulta de disponibilidade e criação de reservas simples, recorrentes ou vinculadas a um evento.
- Aprovação por gestores e análise técnica quando exigida pelas regras do ambiente.
- Check-in e check-out de reservas.
- Administração de ambientes, recursos e bloqueios de agenda.
- Registro de ocorrências, penalidades, solicitações de suporte e auditoria.
- Painel e relatórios de reservas e ocupação.

## Perfis de acesso

| Perfil | Uso principal |
|---|---|
| `SOLICITANTE` | Consultar ambientes e solicitar reservas. |
| `GESTOR` | Analisar e decidir solicitações que exigem aprovação; consultar relatórios. |
| `RESPONSAVEL_TECNICO` | Fazer análise técnica de solicitações encaminhadas. |
| `SUPORTE` | Atender solicitações de suporte. |
| `ADMINISTRADOR` | Administrar usuários e configurações do sistema. |

O cadastro público cria somente usuários com o perfil `SOLICITANTE`. A atribuição dos demais perfis é feita por administração.

## Fluxo de reserva

1. O solicitante consulta a disponibilidade do ambiente para a data e o horário desejados.
2. Informa finalidade, participantes e recursos e aceita os termos da reserva.
3. A solicitação segue o fluxo definido pelas regras do ambiente: pode exigir aprovação de gestor ou análise técnica.
4. Depois de aprovada, a reserva pode receber check-in e, ao final do uso, check-out.
5. A ausência de check-in dentro da tolerância pode resultar no status `NO_SHOW`, verificado durante as interações previstas pela aplicação.

## Regras importantes

- A disponibilidade considera reservas conflitantes, bloqueios, horário de funcionamento e intervalos de preparação e limpeza configurados no ambiente.
- Alterações de reserva passam novamente pelas validações de disponibilidade e podem retornar ao fluxo de aprovação.
- Check-in e check-out são restritos a usuários autorizados pela aplicação.
- A autorização é validada também no backend; esconder uma opção no frontend não substitui essa validação.
- A extensão de uma reserva existente não está implementada; para usar o ambiente novamente, é necessário solicitar outra reserva.

## API

As rotas são servidas sob `/api`. O login e o cadastro são públicos; as demais rotas autenticadas recebem o cabeçalho:

```http
Authorization: Bearer <token>
```

### Autenticação

| Método | Rota | Acesso |
|---|---|---|
| `POST` | `/api/auth/register` | Público; cria uma conta `SOLICITANTE`. |
| `POST` | `/api/auth/login` | Público; retorna token e usuário. |
| `GET` | `/api/auth/me` | Autenticado; retorna o usuário da sessão. |

### Rotas disponíveis

| Recurso | Rotas |
|---|---|
| Usuários | `GET/POST /api/users`, `GET/PUT /api/users/:id`, `PATCH /api/users/:id/status` |
| Ambientes | `GET/POST /api/environments`, `GET/PUT/DELETE /api/environments/:id` |
| Recursos | `GET/POST /api/resources`, `PUT/DELETE /api/resources/:id`, `POST /api/resources/environments/:environmentId/link` |
| Disponibilidade | `GET /api/availability` |
| Reservas | `GET/POST /api/reservations`, `POST /api/reservations/recurring`, `POST /api/reservations/chain`, `GET/PUT /api/reservations/:id` |
| Ações de reserva | `POST /api/reservations/:id/cancel`, `/check-in`, `/check-out`, `/approve`, `/reject` |
| Aprovações | `GET /api/approvals/pending` |
| Bloqueios | `GET/POST /api/blocks`, `DELETE /api/blocks/:id` |
| Ocorrências | `GET/POST /api/occurrences`, `GET /api/occurrences/reservation/:reservationId` |
| Penalidades | `GET/POST /api/penalties`, `GET /api/penalties/user/:userId` |
| Suporte | `GET/POST /api/support`, `PATCH /api/support/:id/status` |
| Auditoria | `GET /api/audit` |
| Relatórios | `GET /api/reports/overview` |

O endpoint de disponibilidade aceita filtros como `date`, `startTime`, `endTime` e `environmentType`. Os demais parâmetros e formatos de entrada são definidos pelos validadores da API em `backend/src/validators/`.
