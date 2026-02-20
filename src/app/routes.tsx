import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { RoleSelection } from "./pages/RoleSelection";
import { Pricing } from "./pages/Pricing";
import { ComoFunciona } from "./pages/ComoFunciona";
import { About } from "./pages/About";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { ExportProject } from "./pages/ExportProject";
import LogoDownload from "./pages/LogoDownload";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Marketplace } from "./pages/Marketplace";
import { SalasDigitales } from "./pages/SalasDigitales";
import { SalaDetail } from "./pages/SalaDetail";
import { TaskDetail } from "./pages/TaskDetail";
import { Work } from "./pages/Work";
import { Wallet } from "./pages/Wallet";
import { Disputes } from "./pages/Disputes";
import { QRCenter } from "./pages/QRCenter";
import { Reputation } from "./pages/Reputation";
import { Settings } from "./pages/Settings";
import { PagosYHold } from "./pages/PagosYHold";
import { PerfilPublico } from "./pages/PerfilPublico";
import { CrearOferta } from "./pages/CrearOferta";
import { Aplicaciones } from "./pages/Aplicaciones";
import { Notificaciones } from "./pages/Notificaciones";
import { Reviews } from "./pages/Reviews";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/role-selection",
    Component: RoleSelection,
  },
  {
    path: "/pricing",
    Component: Pricing,
  },
  {
    path: "/como-funciona",
    Component: ComoFunciona,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/terms",
    Component: Terms,
  },
  {
    path: "/privacy",
    Component: Privacy,
  },
  {
    path: "/export",
    Component: ExportProject,
  },
  {
    path: "/logo-download",
    Component: LogoDownload,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: Dashboard,
      },
    ],
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "marketplace",
        Component: Marketplace,
      },
      {
        path: "salas",
        Component: SalasDigitales,
      },
      {
        path: "sala/:id",
        Component: SalaDetail,
      },
      {
        path: "task/:id",
        Component: TaskDetail,
      },
      {
        path: "work",
        Component: Work,
      },
      {
        path: "wallet",
        Component: Wallet,
      },
      {
        path: "pagos-y-hold",
        Component: PagosYHold,
      },
      {
        path: "disputes",
        Component: Disputes,
      },
      {
        path: "qr",
        Component: QRCenter,
      },
      {
        path: "reputation",
        Component: Reputation,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "profile/:userId",
        Component: PerfilPublico,
      },
      {
        path: "crear-oferta",
        Component: CrearOferta,
      },
      {
        path: "aplicaciones",
        Component: Aplicaciones,
      },
      {
        path: "notificaciones",
        Component: Notificaciones,
      },
      {
        path: "reviews",
        Component: Reviews,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);