import { useState } from "react";
import { Package, ArrowDownToLine, ArrowUpFromLine, FileBarChart, History, ChevronDown, ChevronRight, Plus, Edit3, Settings, Users, ShoppingCart, CreditCard, BarChart3, Bell, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(true);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [currentUser] = useState({
    name: "Juan Pérez",
    role: "Administrador"
  });

  const inventorySubItems = [
    { id: 'inventory', label: 'Dashboard', icon: Package, description: 'Vista general del inventario' },
    { id: 'add-product', label: 'Agregar Producto', icon: Plus, description: 'Registrar productos y servicios' },
    { id: 'edit-product', label: 'Editar Producto', icon: Edit3, description: 'Modificar productos existentes' },
    { id: 'entries', label: 'Entradas', icon: ArrowDownToLine, description: 'Registro de ingresos' },
    { id: 'exits', label: 'Salidas', icon: ArrowUpFromLine, description: 'Registro de egresos' },
    { id: 'history', label: 'Historial', icon: History, description: 'Consultar movimientos' },
  ];

  const adminSubItems = [
    { id: 'sales', label: 'Ventas', icon: ShoppingCart, description: 'Registro y gestión de ventas' },
    { id: 'customers', label: 'Clientes', icon: Users, description: 'Base de datos de clientes' },
    { id: 'suppliers', label: 'Proveedores', icon: Package, description: 'Gestión de proveedores' },
    { id: 'projects', label: 'Proyectos', icon: FileBarChart, description: 'Control de obras y cotizaciones' },
    { id: 'finances', label: 'Finanzas', icon: CreditCard, description: 'Flujo de caja y reportes' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, description: 'Análisis y estadísticas' },
    { id: 'settings', label: 'Configuración', icon: Settings, description: 'Configuración del sistema' },
  ];

  const isInventoryViewActive = inventorySubItems.some(item => item.id === activeView);
  const isAdminViewActive = adminSubItems.some(item => item.id === activeView);

  const toggleInventoryExpanded = () => {
    const newState = !isInventoryExpanded;
    setIsInventoryExpanded(newState);
    // Si se abre Inventario, cerrar Gestión
    if (newState) {
      setIsAdminExpanded(false);
    }
  };

  const toggleAdminExpanded = () => {
    const newState = !isAdminExpanded;
    setIsAdminExpanded(newState);
    // Si se abre Gestión, cerrar Inventario
    if (newState) {
      setIsInventoryExpanded(false);
    }
  };

  const handleLogout = () => {
    toast.success("Cerrando sesión...");
    // Aquí implementarías la lógica de cierre de sesión
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <img 
          src="./src/img/marca.jpg"
        />
        <h1 className="text-blue-800 font-semibold text-lg">Control de Inventario</h1>
        <p className="text-slate-600 text-sm">Impermeabilizantes Professional</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-3">
          {/* Menú principal de Inventario */}
          <div>
            <Button
              variant={isInventoryViewActive ? "default" : "ghost"}
              className={`w-full justify-between h-11 ${
                isInventoryViewActive 
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              onClick={toggleInventoryExpanded}
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4" />
                <span className="font-medium">Inventario</span>
              </div>
              {isInventoryExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Submenú desplegable de Inventario */}
            {isInventoryExpanded && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 pl-4">
                {inventorySubItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-10 text-sm ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 -ml-6 pl-6"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                      onClick={() => onViewChange(item.id)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <div className="text-left flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 leading-tight">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Separador visual */}
          <div className="border-t border-slate-200 pt-3">
            {/* Menú principal de Gestión */}
            <div>
              <Button
                variant={isAdminViewActive ? "default" : "ghost"}
                className={`w-full justify-between h-11 ${
                  isAdminViewActive 
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={toggleAdminExpanded}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Gestión</span>
                </div>
                {isAdminExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              {/* Submenú desplegable de Gestión */}
              {isAdminExpanded && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 pl-4">
                  {adminSubItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-10 text-sm ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 -ml-6 pl-6"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                        onClick={() => onViewChange(item.id)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <div className="text-left flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-500 leading-tight">
                            {item.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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