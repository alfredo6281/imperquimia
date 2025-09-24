import { Package, ArrowDownToLine, ArrowUpFromLine, FileBarChart } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'entries', label: 'Entradas', icon: ArrowDownToLine },
    { id: 'exits', label: 'Salidas', icon: ArrowUpFromLine },
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
  ];

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex items-center gap-4">
        <img src="./src/img/logo.png" className="logo_imperquimia"/>
        <div>
          <h1 className="text-blue-800 font-semibold text-lg">Control de Inventario</h1>
          <p className="text-slate-600 text-sm">Imperquimia - Francisco Villa</p>
        </div>
        
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
    </div>
  );
}