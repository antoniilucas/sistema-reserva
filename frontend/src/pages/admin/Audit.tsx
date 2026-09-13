import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "../../components/Card";
import { Table, Thead, Th, Tr, Td } from "../../components/Table";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { auditService } from "../../services/audit.service";
import { AuditLog } from "../../types";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

export default function AuditAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditService
      .list()
      .then(setLogs)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Auditoria</h1>

      {loading ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState title="Nenhum registro de auditoria" />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Usuário</Th>
                <Th>Ação</Th>
                <Th>Entidade</Th>
                <Th>Data</Th>
              </tr>
            </Thead>
            <tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td>{log.user?.name || "Sistema"}</Td>
                  <Td>{log.action}</Td>
                  <Td>
                    {log.entity} {log.entityId && <span className="text-xs text-slate-400">({log.entityId.slice(0, 8)})</span>}
                  </Td>
                  <Td>{formatDateTime(log.createdAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
