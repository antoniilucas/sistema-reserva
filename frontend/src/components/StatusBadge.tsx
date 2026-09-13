import { statusColors, statusLabels } from "../utils/format";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        statusColors[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}
