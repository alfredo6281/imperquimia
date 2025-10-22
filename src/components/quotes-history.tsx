import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Search, Filter, Download, Eye, ShoppingCart, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";

interface QuotesHistoryProps {
  onViewChange: (view: string) => void;
}

export function QuotesHistory({ onViewChange }: QuotesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Cargar cotizaciones desde localStorage
  useEffect(() => {
    const storedQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    
    // Si no hay cotizaciones guardadas, agregar datos mock
    if (storedQuotes.length === 0) {
      const mockQuotes = [
        {
          id: "COT-001",
          date: "2024-10-01",
          clientId: "C001",
          clientName: "Constructora ABC S.A.",
          items: [
            {
              id: "item-1",
              productId: "P001",
              productName: "Impermeabilizante Acrílico Premium 5L",
              unitPrice: 114.99,
              quantity: 3,
              subtotal: 344.97
            },
            {
              id: "item-2", 
              productId: "P002",
              productName: "Sellador Elastomérico Ultra 1L",
              unitPrice: 49.99,
              quantity: 2,
              subtotal: 99.98
            }
          ],
          subtotal: 444.95,
          discount: 5,
          tax: 16,
          total: 485.23,
          validDays: 30,
          notes: "Cotización para proyecto de impermeabilización de edificio",
          status: "Pendiente"
        },
        {
          id: "COT-002",
          date: "2024-10-02",
          clientId: "C002",
          clientName: "Juan Pérez",
          items: [
            {
              id: "item-3",
              productId: "P003",
              productName: "Membrana Prefabricada SBS 10m²",
              unitPrice: 89.99,
              quantity: 1,
              subtotal: 89.99
            }
          ],
          subtotal: 89.99,
          discount: 0,
          tax: 16,
          total: 104.39,
          validDays: 15,
          notes: "Reparación de techo de casa habitación",
          status: "Aceptada"
        },
        {
          id: "COT-003",
          date: "2024-10-03",
          clientId: "C003",
          clientName: "Inmobiliaria XYZ",
          items: [
            {
              id: "item-4",
              productId: "P004",
              productName: "Primer Acrílico Base Agua 2L",
              unitPrice: 39.99,
              quantity: 5,
              subtotal: 199.95
            }
          ],
          subtotal: 199.95,
          discount: 10,
          tax: 16,
          total: 208.75,
          validDays: 45,
          notes: "Preparación de superficies para múltiples unidades",
          status: "Rechazada"
        }
      ];
      
      localStorage.setItem('quotes', JSON.stringify(mockQuotes));
      setQuotes(mockQuotes);
    } else {
      setQuotes(storedQuotes);
    }
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || quote.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "Aceptada":
        return "bg-green-100 text-green-800";
      case "Rechazada":
        return "bg-red-100 text-red-800";
      case "Convertida a Venta":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const convertToSale = (quote: any) => {
    // Verificar que la cotización esté en estado válido
    if (quote.status === "Rechazada") {
      toast.error("No se puede convertir una cotización rechazada");
      return;
    }

    if (quote.status === "Convertida a Venta") {
      toast.error("Esta cotización ya fue convertida a venta");
      return;
    }

    // Actualizar estado de la cotización
    const updatedQuotes = quotes.map(q => 
      q.id === quote.id 
        ? { ...q, status: "Convertida a Venta" }
        : q
    );
    setQuotes(updatedQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));

    // Preparar datos para nueva venta
    localStorage.setItem('saleFromQuote', JSON.stringify({
      clientId: quote.clientId,
      clientName: quote.clientName,
      items: quote.items,
      discount: quote.discount,
      tax: quote.tax,
      notes: quote.notes
    }));

    toast.success("Cotización convertida a venta");
    onViewChange('new-sale');
  };

  const generatePDF = (quote: any) => {
    toast.success(`Generando PDF de cotización ${quote.id}...`);
    // Aquí implementarías la generación real del PDF
  };

  const deleteQuote = (quoteId: string) => {
    const updatedQuotes = quotes.filter(q => q.id !== quoteId);
    setQuotes(updatedQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
    toast.success("Cotización eliminada");
  };

  const viewQuoteDetail = (quote: any) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">Historial de Cotizaciones</h2>
          </div>
        </div>
      </div>

      

      {/* Acciones principales, búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Button 
          onClick={() => onViewChange('new-quote')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
        <Button 
          variant="outline"
          onClick={() => toast.success("Generando reporte de cotizaciones...")}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Cotizaciones
        </Button>
        
        {/* Búsqueda */}
        
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente o ID de cotización..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg border-slate-300"
          />
        </div>
        
        {/* Filtro de estado */}
        <div className="w-52">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="rounded-lg border-slate-300">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aceptada">Aceptada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
              <SelectItem value="convertida a venta">Convertida a Venta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de cotizaciones */}
      <Card className="border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Lista de Cotizaciones</CardTitle>
          <CardDescription className="text-slate-600">
            Historial completo de cotizaciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Cotización</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => {
                const validUntil = new Date(quote.date);
                validUntil.setDate(validUntil.getDate() + quote.validDays);
                const isExpired = new Date() > validUntil;
                
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                    <TableCell>{quote.clientName}</TableCell>
                    <TableCell className="font-semibold">${quote.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewQuoteDetail(quote)}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generatePDF(quote)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        {(quote.status === "Pendiente" || quote.status === "Aceptada") && (
                          <Button
                            size="sm"
                            onClick={() => convertToSale(quote)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                          >
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQuote(quote.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización {selectedQuote?.id}</DialogTitle>
            <DialogDescription>
              Información completa de la cotización
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Cliente:</strong> {selectedQuote.clientName}
                </div>
                <div>
                  <strong>Fecha:</strong> {new Date(selectedQuote.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Estado:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedQuote.status)}`}>
                    {selectedQuote.status}
                  </Badge>
                </div>
              </div>

              <div>
                <strong>Productos:</strong>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedQuote.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <strong>Subtotal:</strong> ${selectedQuote.subtotal.toFixed(2)}
                </div>
                <div>
                  <strong>Descuento ({selectedQuote.discount}%):</strong> -${((selectedQuote.subtotal * selectedQuote.discount) / 100).toFixed(2)}
                </div>
                <div>
                  <strong>IVA ({selectedQuote.tax}%):</strong> ${(((selectedQuote.subtotal - (selectedQuote.subtotal * selectedQuote.discount) / 100) * selectedQuote.tax) / 100).toFixed(2)}
                </div>
                <div className="text-lg font-semibold">
                  <strong>Total: ${selectedQuote.total.toFixed(2)}</strong>
                </div>
              </div>

              {selectedQuote.notes && (
                <div>
                  <strong>Observaciones:</strong>
                  <p className="mt-1 text-slate-600">{selectedQuote.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => generatePDF(selectedQuote)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </Button>
                {(selectedQuote.status === "Pendiente" || selectedQuote.status === "Aceptada") && (
                  <Button
                    onClick={() => {
                      convertToSale(selectedQuote);
                      setShowDetailModal(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Convertir a Venta
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}