import { useState, useEffect } from "react";
import { FileText, Search, Download, Eye, Plus, Quote } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import { usePdfGenerator } from "../../hooks/usePdfGenerator";
import axios from "axios";
import PaginationControls from "../../components/common/paginationControls";
import { calculateTotals } from "../../utils/calculateTotals";
interface QuotesHistoryProps {
  onViewChange: (view: string) => void;
}
interface Quote {
  idCotizacion: number;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  tipo: string;
  estado: string;
  idCliente: number;
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
  color: string;
  unidad: number;
  unidadMedida: string;
}
interface QuoteLabor {
  idCotizacionMa: number;
  fecha: string;
  descripcion: string;
  sistema: string;
  acabado: string;
  superficie: number;
  precio: number;
  anticipo: number;
  saldo: number;
  garantia: number;
  estado: string;
  nota: string;
}
export function QuotesHistory({ onViewChange }: QuotesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  //const [sortColumn, setSortColumn] = useState<string | null>(null);
  //const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [detailsQuotes, setdetailsQuotes] = useState<DetailsQuoute[]>([]);
  const [selectedQuoteLabor, setSelectedQuoteLabor] = useState<QuoteLabor | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  //const [selectedDetailQuote, setDetailSelectedQuote] = useState<DetailsQuoute | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 6;
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

  {/*const filteredDetailQuotes = detailsQuotes.filter(quote => {
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
  });*/}
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredQuotes.length);
  const pageItems = filteredQuotes.slice(startIndex, endIndex);
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
      case "Material":
        return "bg-green-100 text-green-800";
      case "Mano de obra":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  {/*
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
  const [quoteType, setQuoteType] = useState<"materials" | "labor">("materials");
  */}

  const { generate } = usePdfGenerator();
  // sustituye la función generatePDF existente por esta
  const generatePDF = async (quoteParam?: Quote) => {
    const quote = quoteParam ?? selectedQuote;
    if (!quote) {
      toast.error("Selecciona una cotización para generar el PDF");
      return;
    }

    // Determinar tipo (ajusta si tu backend usa otro valor)
    const tipoRaw = (quote.tipo ?? "").toString().toLowerCase();
    const quoteType: "materials" | "labor" =
      tipoRaw === "false" || tipoRaw.includes("mano") || tipoRaw.includes("labor")
        ? "labor"
        : "materials";

    // Obtener detalles: usa los ya cargados en estado o pídelos al backend si no están
    let relevantDetails: DetailsQuoute[] = detailsQuotes.filter(d => d.idCotizacion === quote.idCotizacion);

    if (quoteType === "materials" && relevantDetails.length === 0) {
      // pedir detalles al backend porque no están en memoria
      try {
        const res = await axios.get(`http://localhost:5000/api/cotizacion/detalle/${quote.idCotizacion}`);
        relevantDetails = res.data ?? [];
        // opcional: actualizar estado para que el modal los muestre si el usuario lo abre después
        setdetailsQuotes(prev => {
          // evitar duplicados: reemplazamos detalles del mismo idCotizacion
          const other = prev.filter(d => d.idCotizacion !== quote.idCotizacion);
          return [...other, ...relevantDetails];
        });
      } catch (err) {
        console.error("Error al obtener detalles para generar PDF:", err);
        toast.error("No se pudieron cargar los detalles de la cotización para generar el PDF");
        return;
      }
    }

    // --- antes de construir formDataForPdf ---
    let clientAddress = "";
    let clientPhone = "";
    let clientEmail = "";

    // Si faltan datos y tenemos idCliente, pedirlos al endpoint de clientes
    if ((!clientAddress || !clientPhone || !clientEmail) && quote.idCliente) {
      try {
        const clientRes = await axios.get(`http://localhost:5000/api/cliente/detalle/${quote.idCliente}`);
        const clientRaw = clientRes.data ?? {};
        const client = Array.isArray(clientRaw) ? (clientRaw[0] ?? {}) : (clientRaw ?? {});
        clientAddress = client.domicilio;
        clientPhone = client.telefono;
        clientEmail = client.correo;
      } catch (err) {
        console.warn("No se pudieron obtener datos del cliente:", err);
        // no retornamos: seguimos con los valores que tengamos (posiblemente vacíos)
      }
    }

    // Ahora sí construimos formDataForPdf usando las variables rellenadas
    const formDataForPdf = {
      quoteId: String(quote.idCotizacion ?? `C${Date.now()}`),
      clientId: String(quote.idCliente ?? ""),
      clientName: quote.cliente ?? "",
      clientAddress: clientAddress,
      clientPhone: clientPhone,
      clientEmail: clientEmail,
      notes: (quote as any).nota ?? "",
      discount: Number((quote as any).discount ?? 0),
      tax: Number((quote as any).tax ?? 0),
    };

    // Mapear los detalles a items esperados por el hook
    const itemsForPdf = (relevantDetails ?? [])
      .map((d) => {
        const cantidad = Number(d.cantidad ?? 0);
        const precio = Number(d.precio ?? 0);
        const computedSubtotal = +(cantidad * precio);
        const subtotal = d.subtotal != null ? Number(d.subtotal) : computedSubtotal;

        return {
          productId: String(d.idProducto ?? ""),
          productName: d.producto ?? "",
          color: d.color ?? "", // si DetailsQuoute tiene color, úsalo
          type: d.tipo,
          unity: d.unidad ?? 0,
          unitMed: d.unidadMedida ?? "",
          quantity: cantidad,
          unitPrice: precio,
          subtotal,
        };
      });

    // --- antes de construir formDataForPdf ---
    let sistema = "", acabado = "", superficie = "", precio = "",
      descripcion = "", saldo = "", garantia = "", anticipo = "";

    // Si faltan datos y tenemos idCliente, pedirlos al endpoint de clientes
    if ((!sistema || !acabado || !superficie) && quote.idCotizacion) {
      try {
        const cotizacionRes = await axios.get(`http://localhost:5000/api/cotizacion/mano/${quote.idCotizacion}`);
        const cotizacionRaw = cotizacionRes.data ?? {};
        const cotizacion = Array.isArray(cotizacionRaw) ? (cotizacionRaw[0] ?? {}) : (cotizacionRaw ?? {});
        descripcion = cotizacion.descripcion;
        sistema = cotizacion.sistema;
        acabado = cotizacion.acabado;
        superficie = cotizacion.superficie;
        precio = cotizacion.precio;
        saldo = cotizacion.saldo;
        garantia = cotizacion.garantia;
        anticipo = cotizacion.anticipo;
      } catch (err) {
        console.warn("No se pudieron obtener datos del cliente:", err);
        // no retornamos: seguimos con los valores que tengamos (posiblemente vacíos)
      }
    }
    // Datos para mano de obra (si aplica)
    const laborDataForPdf = {
      description: descripcion,
      system: sistema,
      finish: acabado,
      surface: superficie,
      price: precio,
      estimation: quote.total,
      balance: saldo,
      warranty: garantia,
      advance: anticipo,
    };

    // Cálculos
    const subtotalCalc = quoteType === "materials"
      ? itemsForPdf.reduce((s, it) => s + (Number(it.subtotal) || 0), 0)
      : Number((quote as any).subtotal ?? (quote.total ?? 0));

    const taxAmount = Number((quote as any).tax ?? 0);
    const totalCalc = Number(quote.total ?? subtotalCalc + taxAmount);
    const date = quote.fecha
      ? new Date(quote.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

    try {
      const url = await generate(
        {
          quoteType,
          formData: formDataForPdf,
          items: quoteType === "materials" ? itemsForPdf : undefined,
          laborData: quoteType === "labor" ? laborDataForPdf : undefined,
          note: (quote as any).nota ?? "",
          subtotal: subtotalCalc,
          total: totalCalc,
          date,
          taxAmount,
        } as any, // puedes tiparlo si prefieres
        {
          onStart: () => toast.info("Generando PDF..."),
          onSuccess: () => toast.success("PDF generado con éxito"),
          onError: (e) => toast.error(e.message || "Error al generar PDF"),
        }
      );
      console.log(clientAddress, clientPhone, clientEmail, quote.idCliente)
      window.open(url, "_blank");
      toast.success(`PDF listo: COT-${quote.idCotizacion}`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast.error((err as Error)?.message ?? "Error al generar PDF");
    }
  };
  // 🔹 Calcular totales automáticamente (evita depender de la BD o props)
  const { subtotal, iva, total } = calculateTotals(
    detailsQuotes.map((i) => ({
      cantidad: i.cantidad,
      precio: i.precio,
    })),

  );
  const downloadPDF = async (quoteParam?: Quote) => {
    const quote = quoteParam ?? selectedQuote;
    if (!quote) {
      toast.error("Selecciona una cotización para descargar el PDF");
      return;
    }

    // --- Preparar mismos datos que en generatePDF (usa tu lógica actual) ---
    const tipoRaw = (quote.tipo ?? "").toString().toLowerCase();
    const quoteType: "materials" | "labor" =
      tipoRaw === "false" || tipoRaw.includes("mano") || tipoRaw.includes("labor")
        ? "labor"
        : "materials";

    let relevantDetails: DetailsQuoute[] = detailsQuotes.filter(d => d.idCotizacion === quote.idCotizacion);

    if (quoteType === "materials" && relevantDetails.length === 0) {
      try {
        const res = await axios.get(`http://localhost:5000/api/cotizacion/detalle/${quote.idCotizacion}`);
        relevantDetails = res.data ?? [];
        setdetailsQuotes(prev => {
          const other = prev.filter(d => d.idCotizacion !== quote.idCotizacion);
          return [...other, ...relevantDetails];
        });
      } catch (err) {
        console.error("Error al obtener detalles para descargar PDF:", err);
        toast.error("No se pudieron cargar los detalles");
        return;
      }
    }
    // --- antes de construir formDataForPdf ---
    let clientAddress = "";
    let clientPhone = "";
    let clientEmail = "";

    // Si faltan datos y tenemos idCliente, pedirlos al endpoint de clientes
    if ((!clientAddress || !clientPhone || !clientEmail) && quote.idCliente) {
      try {
        const clientRes = await axios.get(`http://localhost:5000/api/cliente/detalle/${quote.idCliente}`);
        const clientRaw = clientRes.data ?? {};
        const client = Array.isArray(clientRaw) ? (clientRaw[0] ?? {}) : (clientRaw ?? {});
        clientAddress = client.domicilio;
        clientPhone = client.telefono;
        clientEmail = client.correo;
      } catch (err) {
        console.warn("No se pudieron obtener datos del cliente:", err);
        // no retornamos: seguimos con los valores que tengamos (posiblemente vacíos)
      }
    }
    const formDataForPdf = {
      quoteId: String(quote.idCotizacion ?? `C${Date.now()}`),
      clientId: String(quote.idCliente),
      clientName: quote.cliente ?? "",
      clientAddress: clientAddress,
      clientPhone: clientPhone,
      clientEmail: clientEmail,
      notes: (quote as any).nota ?? "",
      discount: Number((quote as any).discount ?? 0),
      tax: Number((quote as any).tax ?? 0),
    };

    const itemsForPdf = (relevantDetails ?? []).map((d) => {
      const cantidad = Number(d.cantidad ?? 0);
      const precio = Number(d.precio ?? 0);
      const computedSubtotal = +(cantidad * precio);
      const subtotal = d.subtotal != null ? Number(d.subtotal) : computedSubtotal;
      return {
        productId: String(d.idProducto ?? ""),
        productName: d.producto ?? "",
        type: d.tipo,
        color: d.color ?? "",
        unity: d.unidad ?? 0,
        unitMed: d.unidadMedida ?? "",
        quantity: cantidad,
        unitPrice: precio,
        subtotal,
      };
    });

    // --- antes de construir formDataForPdf ---
    let sistema = "", acabado = "", superficie = "", precio = "",
      descripcion = "", saldo = "", garantia = "", anticipo = "";

    // Si faltan datos y tenemos idCliente, pedirlos al endpoint de clientes
    if ((!sistema || !acabado || !superficie) && quote.idCotizacion) {
      try {
        const cotizacionRes = await axios.get(`http://localhost:5000/api/cotizacion/mano/${quote.idCotizacion}`);
        const cotizacionRaw = cotizacionRes.data ?? {};
        const cotizacion = Array.isArray(cotizacionRaw) ? (cotizacionRaw[0] ?? {}) : (cotizacionRaw ?? {});
        descripcion = cotizacion.descripcion;
        sistema = cotizacion.sistema;
        acabado = cotizacion.acabado;
        superficie = cotizacion.superficie;
        precio = cotizacion.precio;
        saldo = cotizacion.saldo;
        garantia = cotizacion.garantia;
        anticipo = cotizacion.anticipo;
      } catch (err) {
        console.warn("No se pudieron obtener datos del cliente:", err);
        // no retornamos: seguimos con los valores que tengamos (posiblemente vacíos)
      }
    }
    // Datos para mano de obra (si aplica)
    const laborDataForPdf = {
      description: descripcion,
      system: sistema,
      finish: acabado,
      surface: superficie,
      price: precio,
      estimation: quote.total,
      balance: saldo,
      warranty: garantia,
      advance: anticipo,
    };

    /*const subtotalCalc = quoteType === "materials"
      ? itemsForPdf.reduce((s, it) => s + (Number(it.subtotal) || 0), 0)
      : Number((quote as any).subtotal ?? (quote.total ?? 0));
    */
    const taxAmount = Number((quote as any).tax ?? 0);
    //const totalCalc = Number(quote.total ?? subtotalCalc + taxAmount);
    const date = quote.fecha
      ? new Date(quote.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

    try {
      toast.info("Generando PDF para descarga...");
      const url = await generate(
        {
          quoteType,
          formData: formDataForPdf,
          items: quoteType === "materials" ? itemsForPdf : undefined,
          laborData: quoteType === "labor" ? laborDataForPdf : undefined,
          note: (quote as any).nota ?? "",
          subtotal: subtotal,
          iva: iva,
          total: total,
          date,
          taxAmount,
        } as any,
        {
          onStart: () => { },
          onSuccess: () => { },
          onError: (e) => { throw e; },
        }
      );

      // construir filename
      const safeId = String(quote.idCotizacion ?? `C${Date.now()}`);
      //const shortDate = new Date().toISOString().split("T")[0];
      //const filename = `COT-${safeId}-${shortDate}.pdf`;
      const filename = `COT-${safeId}.pdf`;

      // Si la URL es un data: base64
      if (typeof url === "string" && url.startsWith("data:")) {
        // data URL (ej. data:application/pdf;base64,....)
        const base64 = url.split(",")[1];
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
        toast.success("Descarga iniciada");
        return;
      }

      // Para blob: o http(s): URLs -> fetch y convertir a blob
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Error al descargar PDF: ${resp.status}`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Descarga iniciada");
    } catch (err: any) {
      console.error("Error downloadPDF:", err);
      toast.error(err?.message ?? "Error descargando el PDF");
    }
  };


  /*const deleteQuote = (quoteId: string) => {
    const updatedQuotes = quotes.filter(q => q.idCotizacion.toString() !== quoteId);
    setQuotes(updatedQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
    toast.success("Cotización eliminada");
  };*/

  const viewQuoteDetail = async (quote: Quote) => {
    try {
      // limpiar cualquier detalle previo
      setdetailsQuotes([]);
      setSelectedQuoteLabor(null);

      // guardamos la cotización seleccionada (comunes)
      setSelectedQuote(quote);
      setShowDetailModal(true);

      // detectar si es mano de obra (misma heurística que en generatePDF)
      const tipoRaw = (quote.tipo ?? "").toString().toLowerCase();
      const isLabor =
        tipoRaw === "false" || tipoRaw.includes("mano") || tipoRaw.includes("labor");

      if (!isLabor) {
        // materiales -> endpoint de detalles (array)
        const res = await axios.get(`http://localhost:5000/api/cotizacion/detalle/${quote.idCotizacion}`);
        const details = res.data ?? [];
        setdetailsQuotes(Array.isArray(details) ? details : []);
      } else {
        // mano de obra -> endpoint específico (objeto o array)
        const res = await axios.get(`http://localhost:5000/api/cotizacion/mano/${quote.idCotizacion}`);
        const data = res.data;
        // el backend podría devolver un array o un objeto; normalizamos a objeto o null
        const labor = Array.isArray(data) ? (data[0] ?? null) : data ?? null;
        setSelectedQuoteLabor(labor);
        // asegurarnos de no mostrar details de materiales
        setdetailsQuotes([]);
      }
    } catch (err) {
      console.error("Error al obtener detalles de cotización:", err);
      toast.error("No se pudieron cargar los detalles de la cotización");
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
              <SelectItem value="rechazada">Rechazada</SelectItem>
              <SelectItem value="convertida a venta">Convertida a Venta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de cotizaciones */}
      <Card className="border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Historial completo de cotizaciones realizadas</CardTitle>
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
              {/*const validUntil = new Date(quote.fecha);*/}
              {pageItems.map((quote) => (
                //const isExpired = new Date() > validUntil;
                <TableRow key={quote.idCotizacion}>
                  <TableCell className="font-medium">COT-{quote.idCotizacion}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.tipo.toString())}>
                      {quote.tipo.toString() === "Material" ? "Material" : "Mano de obra"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(quote.fecha).toLocaleDateString("es-MX", { timeZone: "UTC" })}</TableCell>
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
                        className="border-red-300 text-red-600 hover:bg-blue-50 rounded"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadPDF(quote)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      {/*
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
                        */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredQuotes.length > 0 && (
            <PaginationControls
              totalItems={filteredQuotes.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              maxButtons={5}
            />
          )}
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
                  <strong>Cliente:</strong> {selectedQuote.idCliente} - {selectedQuote.cliente}
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
              {(selectedQuote.tipo ?? "").toString().toLowerCase().includes("material") ? (
                <>
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
                      <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
                    </div>

                    <div>
                      <strong>IVA:</strong> ${iva.toFixed(2)}
                    </div>

                    <div>
                      <strong>Total:</strong> ${total.toFixed(2)}
                    </div>

                  </div>
                  <div>
                  </div>
                </>
              ) : (
                <>{/* Detalle Cotizacion */}
                  {selectedQuoteLabor && (
                    <div>
                      <div><strong>Detalle de Mano de Obra para:</strong> {selectedQuoteLabor.descripcion}</div>
                      <div className="mt-2">
                        <div>{/*<strong>Descripción:</strong> {(selectedQuoteLabor as any).nota ?? "-"}*/}</div>
                        <div><strong>Sistema:</strong> {selectedQuoteLabor.sistema ?? "-"}</div>
                        <div><strong>Acabado:</strong> {(selectedQuoteLabor as any).acabado ?? "-"}</div>
                        <div><strong>Superficie:</strong> {Number((selectedQuoteLabor as any).superficie ?? 0)} m2</div>
                        <div><strong>Precio m2:</strong> ${Number((selectedQuoteLabor as any).precio ?? 0)}</div>
                        <div><strong>Estimacion: (por unidad/superficie):</strong> ${Number(selectedQuoteLabor.precio * selectedQuoteLabor.superficie).toFixed(2)} Neto</div>
                        <div><strong>Anticipo:</strong> {Number((selectedQuoteLabor as any).anticipo ?? 0)}%</div>
                        <div><strong>Saldo:</strong> {Number((selectedQuoteLabor as any).saldo ?? 0)}%</div>
                        <div><strong>Garantia:</strong> {Number((selectedQuoteLabor as any).garantia ?? 0)} años</div>
                      </div>
                    </div>
                  )}
                </>

              )}


              {selectedQuote.nota && (
                <div>
                  <strong>Nota:</strong>
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
                {/*(selectedQuote.estado === "Pendiente" || selectedQuote.estado === "Aceptada") && (
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
                )*/}
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
    </div >
  );
}