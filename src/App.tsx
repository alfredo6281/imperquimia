// App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Sidebar } from "./pages/sidebar";
import { InventoryDashboard } from "./pages/products/inventory-dashboard";
import { AddProduct } from "./pages/products/add-product";
import { InventoryMovements } from "./pages/movements/inventory-movements";
import { MovementHistory } from "./pages/movements/movement-history";
import { Reports } from "./pages/reports";
import { QuotesHistory } from "./pages/quotes/quotes-history";
import { CustomersManagement } from "./pages/customers/customers-management";
import { NewQuote } from "./pages/quotes/new-quote";
import { SaleHistory } from "./pages/sales/sale-history";
import { NewSale } from "./pages/sales/new-sale";
import { CreditCard } from "lucide-react";

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

/**
 * Componente que contiene layout + rutas.
 * Usa useLocation/useNavigate internamente para mantener activeView sincronizado
 * y para pasar onViewChange a Sidebar en la misma forma que antes.
 */
function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  // Deriva la "vista activa" en tu app a partir de la ruta actual
  const activeView = mapPathToView(location.pathname);

  // Pasaremos a los componentes la función onViewChange que acepta tu antiguo nombre de vista
  const onViewChange = (view: string) => {
    const path = mapViewToPath(view);
    navigate(path);
  };

  return (
    <div className="h-screen bg-slate-50">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <div className="pl-72">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />

          <Route path="/inventory" element={<InventoryDashboard onViewChange={onViewChange} />} />
          <Route path="/add-product" element={<AddProduct onViewChange={onViewChange} />} />
          <Route path="/entries" element={<InventoryMovements onViewChange={onViewChange} movementType="entries" />} />
          <Route path="/exits" element={<InventoryMovements onViewChange={onViewChange} movementType="exits" />} />
          <Route path="/history" element={<MovementHistory onViewChange={onViewChange} />} />
          <Route path="/reports" element={<Reports onViewChange={onViewChange} />} />
          <Route path="/quotes" element={<QuotesHistory onViewChange={onViewChange} />} />
          <Route path="/clients" element={<CustomersManagement onViewChange={onViewChange} />} />
          <Route path="/quotes-new" element={<NewQuote onViewChange={onViewChange} />} />
          <Route path="/sales-history" element={<SaleHistory onViewChange={onViewChange} />} />
          <Route path="/sales-new" element={<NewSale onViewChange={onViewChange} />} />

          {/* Ejemplo de ruta "especial" para partes de proyecto */}
          {/*
          <Route path="/proyecto/:projectId/parte/:partId" element={<PlaceholderView title="Parte de Proyecto" onViewChange={onViewChange} />} />
          */}
          {/* fallback */}
          <Route path="*" element={<div className="p-6">Página no encontrada</div>} />
        </Routes>
      </div>
    </div>
  );
}

/* --------------------------
   Helpers para mapear vista <-> ruta
   Deja estos mappers para mantener compatibilidad con tu API actual
   -------------------------- */
function mapViewToPath(view: string) {
  switch (view) {
    case "inventory": return "/inventory";
    case "add-product": return "/add-product";
    case "entries": return "/entries";
    case "exits": return "/exits";
    case "history": return "/history";
    case "reports": return "/reports";
    case "quote-history": return "/quotes";
    case "client": return "/clients";
    case "new-quote": return "/quotes-new";
    case "sales-history": return "/sales-history";
    case "new-sale": return "/sales-new";
    case "bill": return "/bill";
    default:
      // si recibes nombres personalizados (ej. "quotes" vs "quote-history")
      if (view?.startsWith("/")) return view; // si ya envías una ruta, la devolvemos
      return "/inventory";
  }
}

function mapPathToView(pathname: string) {
  if (!pathname) return "inventory";
  const p = pathname.replace(/\/+$/, ""); // quitar slash final
  if (p === "" || p === "/inventory") return "inventory";
  if (p === "/add-product") return "add-product";
  if (p === "/entries") return "entries";
  if (p === "/exits") return "exits";
  if (p === "/history") return "history";
  if (p === "/reports") return "reports";
  if (p === "/quotes") return "quote-history";
  if (p === "/clients") return "client";
  if (p === "/quotes-new") return "new-quote";
  if (p === "/sales-history") return "sales-history";
  if (p === "/sales-new") return "new-sale";
  if (p === "/bill") return "bill";
  // rutas dinámicas ejemplo: /proyecto/:projectId/parte/:partId -> devuelve una vista genérica
  //if (p.startsWith("/proyecto/")) return "project-part";
  // por defecto
  return "inventory";
}
