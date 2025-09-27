import { useState, useEffect } from "react";
import { ArrowLeft, User, Package, Calendar, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";

interface MovementRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  date: string;
  type: 'entries' | 'exits';
  userId: string;
  userName: string;
  userRole: string;
  observations?: string;
  timestamp: string;
}

interface MovementHistoryProps {
  onViewChange: (view: string) => void;
}

export function MovementHistory({ onViewChange }: MovementHistoryProps) {
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<MovementRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Usuarios mock
  const users = [
    { id: "1", name: "María González", role: "Supervisor de Inventario" },
    { id: "2", name: "Carlos Rodríguez", role: "Operador de Almacén" },
    { id: "3", name: "Ana López", role: "Jefe de Compras" },
    { id: "4", name: "Roberto Martínez", role: "Asistente de Almacén" },
    { id: "5", name: "Laura Silva", role: "Contador de Inventario" }
  ];

  useEffect(() => {
    // Cargar movimientos desde localStorage
    const storedMovements = JSON.parse(localStorage.getItem('inventoryMovements') || '[]');
    setMovements(storedMovements);
    setFilteredMovements(storedMovements);
  }, []);

  useEffect(() => {
    // Aplicar filtros
    let filtered = movements;

    if (searchTerm) {
      filtered = filtered.filter(movement => 
        movement.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.observations?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userFilter && userFilter !== "all") {
      filtered = filtered.filter(movement => movement.userId === userFilter);
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(movement => movement.type === typeFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(movement => movement.date === dateFilter);
    }

    // Ordenar por fecha más reciente
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredMovements(filtered);
    setCurrentPage(1); // Reset página al filtrar
  }, [movements, searchTerm, userFilter, typeFilter, dateFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovements = filteredMovements.slice(startIndex, endIndex);

  const clearFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    setTypeFilter("all");
    setDateFilter("");
  };

  const exportToCSV = () => {
    const headers = "Fecha,Tipo,Producto,Cantidad,Usuario,Rol,Observaciones\n";
    const csvData = filteredMovements.map(movement => 
      `${movement.date},${movement.type === 'entries' ? 'Entrada' : 'Salida'},${movement.productName},${movement.quantity},${movement.userName},${movement.userRole},"${movement.observations || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_movimientos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => onViewChange('inventory')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Inventario
        </Button>
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">Historial de Movimientos</h2>
            <p className="text-slate-600">Registro completo de entradas y salidas por usuario</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6 border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-slate-700">Buscar</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Producto, usuario o notas..."
                className="rounded-lg border-slate-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userFilter" className="text-slate-700">Usuario</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="rounded-lg border-slate-300">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeFilter" className="text-slate-700">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-lg border-slate-300">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="entries">Entradas</SelectItem>
                  <SelectItem value="exits">Salidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFilter" className="text-slate-700">Fecha</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border-slate-300"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Limpiar Filtros
            </Button>
            <Button 
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card className="border-slate-200 rounded-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Registros de Movimientos
              </CardTitle>
              <CardDescription className="text-slate-600">
                {filteredMovements.length} registros encontrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentMovements.length > 0 ? (
            <>
              <div className="rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-700">Fecha/Hora</TableHead>
                      <TableHead className="text-slate-700">Tipo</TableHead>
                      <TableHead className="text-slate-700">Producto</TableHead>
                      <TableHead className="text-slate-700">Cantidad</TableHead>
                      <TableHead className="text-slate-700">Usuario</TableHead>
                      <TableHead className="text-slate-700">Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMovements.map((movement) => (
                      <TableRow key={movement.id} className="border-slate-200">
                        <TableCell className="text-slate-800">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(movement.date)}</span>
                            <span className="text-sm text-slate-500">
                              {formatDateTime(movement.timestamp)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={movement.type === 'entries' ? 'default' : 'destructive'}
                            className={`rounded-full ${
                              movement.type === 'entries' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}
                          >
                            {movement.type === 'entries' ? (
                              <>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Entrada
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Salida
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-800 font-medium">
                          {movement.productName}
                        </TableCell>
                        <TableCell className="text-slate-800">
                          <span className="font-medium">{movement.quantity}</span> unidades
                        </TableCell>
                        <TableCell className="text-slate-800">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <div className="flex flex-col">
                              <span className="font-medium">{movement.userName}</span>
                              <span className="text-sm text-slate-500">{movement.userRole}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-xs">
                          {movement.observations || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-slate-600 text-lg font-medium mb-2">No hay registros</h3>
              <p className="text-slate-500">
                {movements.length === 0 
                  ? 'Aún no se han registrado movimientos de inventario'
                  : 'No hay registros que coincidan con los filtros aplicados'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}