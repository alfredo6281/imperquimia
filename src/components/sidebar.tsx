import { useState } from "react";
import { Package, FileBarChart, FileText, Users, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'quote-history', label: 'Cotización', icon: FileText},
    { id: 'client', label: 'Clientes', icon: Users},
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
  ];

  const [currentUser] = useState({
    name: "Juan Pérez",
    role: "Administrador"
  });

  const handleLogout = () => {
    toast.success("Cerrando sesión...");
    // Aquí implementarías la lógica de cierre de sesión
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <img 
          src="./src/img/marca.png"
        />
        {/*
        <h1 className="text-blue-800 font-semibold text-lg">Control de Inventario</h1>
        <p className="text-slate-600 text-sm">Impermeabilizantes</p>
        */}
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-11 ${
                  activeView === item.id 
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
      
      {/* Footer del sidebar - Usuario y Cerrar Sesión */}
      <div className="p-4 border-t border-slate-200 space-y-3 bg-white">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white flex-shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser.role}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}