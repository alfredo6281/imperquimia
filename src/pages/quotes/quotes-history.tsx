import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Search, Filter, Download, Eye, ShoppingCart, Trash2, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
interface QuotesHistoryProps {
  onViewChange: (view: string) => void;
}
interface Quoute {
  idCotizacion: number;
  fecha: string;
  total: number;
  tipo: string;
  estado: string;
  cliente: string;
  usuario: string;
  nota: string;
}
interface DetailsQuoute {
  idProducto: number;
  cliente: string;
  estado: string;
  idCotizacion: number;
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  tipo: string;
  unidad: number;
  unidadMedida: string;
}
export function QuotesHistory({ onViewChange }: QuotesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [quotes, setQuotes] = useState<Quoute[]>([]);
  const [detailsQuotes, setdetailsQuotes] = useState<DetailsQuoute[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quoute | null>(null);
  const [selectedDetailQuote, setDetailSelectedQuote] = useState<DetailsQuoute | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [itemsPerPage] = useState(10);
  // Datos mock del inventario
  // Cargar cotizaciones
  useEffect(() => {
    axios.get("http://localhost:5000/api/cotizacion")
      .then((res) => {
        setQuotes(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener cotizaciones:", err);
      });
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.cliente.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.idCotizacion.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || quote.estado.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredDetailQuotes = detailsQuotes.filter(quote => {
    const term = searchTerm.trim().toLowerCase();

    // 1) Búsqueda por cliente o idCotizacion (igual que antes)
    const inCliente =
      (quote.cliente ?? "").toString().toLowerCase().includes(term);
    const inIdCot =
      (quote.idCotizacion ?? "").toString().toLowerCase().includes(term);

    // 2) Búsqueda dentro de detalles: producto o idProducto
    const inDetails = detailsQuotes.some(
      (d) =>
        d.idCotizacion === quote.idCotizacion &&
        (
          (d.producto ?? "").toString().toLowerCase().includes(term) ||
          (d.idProducto ?? "").toString().toLowerCase().includes(term)
        )
    );

    // Si searchTerm está vacío, matchesSearch será true (no filtra por texto)
    const matchesSearch = term === "" ? true : (inCliente || inIdCot || inDetails);

    // 3) Filtrado por estado (case-insensitive). "all" deja pasar todo.
    const matchesFilter =
      filterStatus === "all" ||
      (quote.estado ?? "").toString().toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotes = filteredQuotes.slice(startIndex, endIndex);
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
      case "true":
        return "bg-green-100 text-green-800";
      case "false":
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
      q.idCotizacion === quote.id
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
    const updatedQuotes = quotes.filter(q => q.idCotizacion.toString() !== quoteId);
    setQuotes(updatedQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
    toast.success("Cotización eliminada");
  };

  const viewQuoteDetail = async (quote: Quoute) => {
    try {
      setSelectedQuote(quote);
      setShowDetailModal(true);

      const res = await axios.get(
        `http://localhost:5000/api/cotizacion/detalle/${quote.idCotizacion}`
      );

      setdetailsQuotes(res.data);
    } catch (err) {
      console.error("Error al obtener detalles de cotización:", err);
    }
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
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Hecha por</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => {
                const validUntil = new Date(quote.fecha);

                //const isExpired = new Date() > validUntil;

                return (
                  <TableRow key={quote.idCotizacion}>
                    <TableCell className="font-medium">COT-{quote.idCotizacion}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.tipo.toString())}>
                        {quote.tipo.toString() === "true" ? "Material" : "Mano de obra"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(quote.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{quote.cliente}</TableCell>
                    <TableCell className="font-semibold">${quote.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.estado)}>
                        {quote.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{quote.usuario}</TableCell>
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
                        {(quote.estado === "Pendiente" || quote.estado === "Aceptada") && (
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
                          onClick={() => deleteQuote(quote.idCotizacion.toString())}
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
            <DialogTitle>Detalle de Cotización {selectedQuote?.idCotizacion}</DialogTitle>
            <DialogDescription>
              Información completa de la cotización
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Cliente:</strong> {selectedQuote.cliente}
                </div>
                <div>
                  <strong>Fecha:</strong> {new Date(selectedQuote.fecha).toLocaleDateString()}
                </div>
                <div>
                  <strong>Estado:</strong>
                  <Badge className={`ml-2 ${getStatusColor(selectedQuote.estado)}`}>
                    {selectedQuote.estado}
                  </Badge>
                </div>
              </div>
              {/* Productos */}
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
                    
                    {detailsQuotes.map((item) => {
                      return (
                        <TableRow key={selectedQuote.idCotizacion}>
                          <TableCell>{item.producto} {item.tipo} {item.unidad}{item.unidadMedida}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>${Number(item.precio ?? 0).toFixed(2)}</TableCell>
                          <TableCell>${Number(item.subtotal ?? 0).toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <strong>Subtotal:</strong> ${selectedQuote.total.toFixed(2)}
                  {/*<strong>Subtotal:</strong> ${selectedQuote.subtotal.toFixed(2)}*/}
                </div>
                {/*                      
                <div>
                  <strong>Descuento ({selectedQuote.discount}%):</strong> -${((selectedQuote.subtotal * selectedQuote.discount) / 100).toFixed(2)}
                </div>
                <div>
                  <strong>IVA ({selectedQuote.tax}%):</strong> ${(((selectedQuote.subtotal - (selectedQuote.subtotal * selectedQuote.discount) / 100) * selectedQuote.tax) / 100).toFixed(2)}
                </div>
                <div className="text-lg font-semibold">
                  <strong>Total: ${selectedQuote.total.toFixed(2)}</strong>
                </div>
                  */}
              </div>

              {selectedQuote.nota && (
                <div>
                  <strong>Observaciones:</strong>
                  <p className="mt-1 text-slate-600">{selectedQuote.nota}</p>
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
                {(selectedQuote.estado === "Pendiente" || selectedQuote.estado === "Aceptada") && (
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