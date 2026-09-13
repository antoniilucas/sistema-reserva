import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewReservation from "./pages/NewReservation";
import MyReservations from "./pages/MyReservations";
import Availability from "./pages/Availability";
import History from "./pages/History";
import Approvals from "./pages/Approvals";
import Support from "./pages/Support";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import EnvironmentsAdmin from "./pages/admin/Environments";
import UsersAdmin from "./pages/admin/Users";
import ResourcesAdmin from "./pages/admin/Resources";
import BlocksAdmin from "./pages/admin/Blocks";
import AuditAdmin from "./pages/admin/Audit";
import PenaltiesAdmin from "./pages/admin/Penalties";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reservas" element={<MyReservations />} />
          <Route path="/historico" element={<History />} />
          <Route path="/disponibilidade" element={<Availability />} />
          <Route path="/suporte" element={<Support />} />
          <Route path="/perfil" element={<Profile />} />

          <Route element={<ProtectedRoute allowedRoles={["SOLICITANTE", "ADMINISTRADOR"]} />}>
            <Route path="/reservas/nova" element={<NewReservation />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["GESTOR", "ADMINISTRADOR", "RESPONSAVEL_TECNICO"]} />}>
            <Route path="/aprovacoes" element={<Approvals />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["GESTOR", "ADMINISTRADOR"]} />}>
            <Route path="/relatorios" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
            <Route path="/usuarios" element={<UsersAdmin />} />
            <Route path="/ambientes" element={<EnvironmentsAdmin />} />
            <Route path="/recursos" element={<ResourcesAdmin />} />
            <Route path="/bloqueios" element={<BlocksAdmin />} />
            <Route path="/penalidades" element={<PenaltiesAdmin />} />
            <Route path="/auditoria" element={<AuditAdmin />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
