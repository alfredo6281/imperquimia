import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Sidebar } from "./components/sidebar";
import { InventoryDashboard } from "./components/inventory-dashboard";
import { AddProduct } from "./components/add-product";
import { InventoryMovements } from "./components/inventory-movements";
import { Reports } from "./components/reports";
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
      case 'reports':
        return <Reports onViewChange={setActiveView} />;
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

//export default App
