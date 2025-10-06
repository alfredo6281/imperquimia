import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Sidebar } from "./components/sidebar";
import { InventoryDashboard } from "./components/inventory-dashboard";
import { AddProduct } from "./components/add-product";
import { InventoryMovements } from "./components/inventory-movements";
import { MovementHistory } from "./components/movement-history";
import { Reports } from "./components/reports";
import { NewQuote } from "./components/new-quote";

export default function App() {
  const [activeView, setActiveView] = useState("inventory");

  const renderView = () => {
    switch (activeView) {
      case 'inventory':
        return <InventoryDashboard onViewChange={setActiveView} />;
      case 'add-product':
        return <AddProduct onViewChange={setActiveView} />;
      case 'entries':
        return <InventoryMovements onViewChange={setActiveView} movementType="entries" />;
      case 'exits':
        return <InventoryMovements onViewChange={setActiveView} movementType="exits" />;
      case 'history':
        return <MovementHistory onViewChange={setActiveView} />;
      case 'reports':
        return <Reports onViewChange={setActiveView} />;
      case 'quote':
        return <NewQuote onViewChange={setActiveView} />;
      default:
        return <InventoryDashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      {renderView()}
      <Toaster position="top-right" />
    </div>
  );
}