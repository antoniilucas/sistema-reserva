import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";
import { roleLabels } from "../utils/format";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Meu Perfil</h1>
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-400">{roleLabels[user?.role || ""]}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">E-mail</span>
            <span className="text-slate-700">{user?.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">Perfil</span>
            <span className="text-slate-700">{roleLabels[user?.role || ""]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className="text-slate-700">{user?.status}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
