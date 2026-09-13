import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  ListChecks,
  CalendarSearch,
  History,
  LifeBuoy,
  User as UserIcon,
  ClipboardCheck,
  BarChart3,
  Users,
  Building2,
  Boxes,
  Ban,
  Settings,
  ShieldAlert,
  ScrollText,
  LogOut,
  Building,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { roleLabels } from "../utils/format";

const solicitanteMenu = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reservas/nova", label: "Nova Reserva", icon: CalendarPlus },
  { to: "/reservas", label: "Minhas Reservas", icon: ListChecks },
  { to: "/disponibilidade", label: "Disponibilidade", icon: CalendarSearch },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/suporte", label: "Suporte", icon: LifeBuoy },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
];

const gestorMenu = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/aprovacoes", label: "Solicitações Pendentes", icon: ClipboardCheck },
  { to: "/reservas", label: "Reservas", icon: ListChecks },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
];

const adminMenu = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/usuarios", label: "Usuários", icon: Users },
  { to: "/ambientes", label: "Ambientes", icon: Building2 },
  { to: "/recursos", label: "Recursos", icon: Boxes },
  { to: "/reservas", label: "Reservas", icon: ListChecks },
  { to: "/bloqueios", label: "Bloqueios", icon: Ban },
  { to: "/penalidades", label: "Penalidades", icon: ShieldAlert },
  { to: "/auditoria", label: "Auditoria", icon: ScrollText },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
];

const tecnicoMenu = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/aprovacoes", label: "Análises Pendentes", icon: ClipboardCheck },
  { to: "/reservas", label: "Reservas", icon: ListChecks },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
];

const suporteMenu = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/suporte", label: "Solicitações de Suporte", icon: LifeBuoy },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
];

function menuForRole(role?: string) {
  switch (role) {
    case "ADMINISTRADOR":
      return adminMenu;
    case "GESTOR":
      return gestorMenu;
    case "RESPONSAVEL_TECNICO":
      return tecnicoMenu;
    case "SUPORTE":
      return suporteMenu;
    default:
      return solicitanteMenu;
  }
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const menu = menuForRole(user?.role);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="rounded-lg bg-brand-600 p-2 text-white">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-800">Sistema de Reserva</p>
            <p className="text-xs text-slate-400">Salas e Laboratórios</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 text-slate-500 md:hidden">
            <Building className="h-5 w-5 text-brand-600" />
            <span className="text-sm font-semibold text-slate-800">Sistema de Reserva</span>
          </div>
          <div className="hidden text-sm text-slate-400 md:block">
            Bem-vindo(a) de volta,&nbsp;
            <span className="font-medium text-slate-700">{user?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-400">{roleLabels[user?.role || ""]}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-100 bg-white py-2 md:hidden">
        {menu.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 text-[10px] ${isActive ? "text-brand-600" : "text-slate-400"}`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
