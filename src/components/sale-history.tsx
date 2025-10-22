import { useState } from "react";
import { ArrowLeft, Plus, Receipt, Search, Filter, Calendar, Download, Eye, FileText, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface SalesDashboardProps {
  onViewChange: (view: string) => void;
}

export function SaleHistory({ onViewChange }: SalesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Datos mock de ventas
  const mockSales = [
    {
      id: "V-001",
      date: "2024-10-01",
      client: "Constructora ABC S.A.",
      items: "Impermeabilizante Acrílico Premium (5L) x2",
      amount: 229.98,
      paymentMethod: "Transferencia",
      status: "Pagado"
    },
    {
      id: "V-002",
      date: "2024-10-01",
      client: "Juan Pérez",
      items: "Sellador Elastomérico Ultra (1L) x3",
      amount: 149.97,
      paymentMethod: "Efectivo",
      status: "Pagado"
    },
    {
      id: "V-003",
      date: "2024-10-02",
      client: "Inmobiliaria XYZ",
      items: "Membrana Prefabricada SBS (10m²) x1",
      amount: 89.99,
      paymentMethod: "Tarjeta",
      status: "Pendiente"
    },
    {
      id: "V-004",
      date: "2024-10-02",
      client: "Reparaciones DEF",
      items: "Primer Acrílico Base Agua (2L) x2",
      amount: 79.98,
      paymentMethod: "Transferencia",
      status: "Pagado"
    },
    {
      id: "V-005",
      date: "2024-10-03",
      client: "María González",
      items: "Fibra de Vidrio Malla (5m) x4",
      amount: 39.96,
      paymentMethod: "Efectivo",
      status: "Pagado"
    }
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-slate-400" />;
    }
    return sortDirection === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1 text-emerald-600" />
      : <ArrowDown className="h-3 w-3 ml-1 text-emerald-600" />;
  };

  const filteredSales = mockSales.filter(sale => {
    const matchesSearch = sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || sale.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = a[sortColumn as keyof typeof a];
    let bValue: any = b[sortColumn as keyof typeof b];

    if (sortColumn === "amount") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (sortColumn === "date") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pagado":
        return "bg-green-100 text-green-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Efectivo":
        return "bg-blue-100 text-blue-800";
      case "Transferencia":
        return "bg-purple-100 text-purple-800";
      case "Tarjeta":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">Administración de Ventas</h2>
          </div>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Button
          onClick={() => onViewChange('new-sale')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Generando reporte de ventas...")}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Ventas
        </Button>
        {/* Búsqueda */}

        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente o ID de venta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg border-slate-300"
          />
        </div>

        {/* Filtro de estado */}
        <div className="w-52">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="rounded-lg border-slate-300">
              <SelectValue placeholder="Estado de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de ventas */}
      <Card className="border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Historial de Ventas</CardTitle>
          <CardDescription className="text-slate-600">
            Lista completa de transacciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    ID Venta
                    {getSortIcon("id")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Fecha
                    {getSortIcon("date")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("client")}
                >
                  <div className="flex items-center">
                    Cliente
                    {getSortIcon("client")}
                  </div>
                </TableHead>
                <TableHead>Productos</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center">
                    Monto
                    {getSortIcon("amount")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("paymentMethod")}
                >
                  <div className="flex items-center">
                    Método de Pago
                    {getSortIcon("paymentMethod")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Estado
                    {getSortIcon("status")}
                  </div>
                </TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.client}</TableCell>
                  <TableCell className="max-w-xs truncate" title={sale.items}>
                    {sale.items}
                  </TableCell>
                  <TableCell className="font-semibold">${sale.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentMethodColor(sale.paymentMethod)}>
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sale.status)}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success("Abriendo detalle de venta...")}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success("Generando recibo...")}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded"
                      >
                        <Receipt className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}