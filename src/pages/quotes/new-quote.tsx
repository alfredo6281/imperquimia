import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Save, Calculator, FileText, Search, UserPlus, X, Download, ShoppingCart, Package } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { toast } from "sonner";

interface NewQuoteProps {
  onViewChange: (view: string) => void;
}
interface Product {
  idProducto: number;
  nombre: string;
  categoria: string;
  stock: number;
  precioUnitario: number;
  color: string;
  unidad: number;
  unidadMedida: string;
  tipo: string;
  URLImagen?: string;
}

interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  color: string;
  unity: number;
  unitMed: string;
  type: string;
  quantity: number;
  subtotal: number;
  discount: number; // Descuento individual en porcentaje
  notes: string;
}

export function NewQuote({ onViewChange }: NewQuoteProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    notes: "",
    discount: 0,
    tax: 16,
  });
  const DEFAULT_LABOR = {
    description: "losa de azotea",
    system: "Elastomerico c/malla Reforzada",
    finish: "Blanco o Rojo",
    surface: 85,
    price: 172.00,
    estimation: 14620,
    advance: 70,
    balance: 30,
    warranty: "4",
  };
  // Datos específicos para cotización de mano de obra
  const [laborData, setLaborData] = useState(() => ({ ...DEFAULT_LABOR }));
  // --- Reseteo específico para materiales ---
  const resetMaterials = () => {
    setItems([]);
    setSelectedProduct("");
    setQuantity(1);
    setProductSearchTerm("");
    // opcional: reset descuentos / tax si quieres
    setFormData(prev => ({ ...prev, discount: 0, tax: 16 }));
  };

  // --- Reseteo específico para mano de obra ---
  const resetLabor = () => {
    setLaborData({
      description: "",
      system: "",
      finish: "",
      surface: 0,
      price: 0,
      estimation: 0,
      advance: 0,
      balance: 0,
      warranty: ""
    });
  };


  // --- Funcion para cambiar tipo con reseteo ---
  const handleSetQuoteType = (type: "materials" | "labor") => {
    if (type === quoteType) return;
    if (type === "materials") {
      // vamos a materiales => limpiar mano de obra si queremos
      resetLabor();
    } else {
      // vamos a mano de obra => limpiar productos
      resetMaterials();
    }
    setQuoteType(type);
  };
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [quoteType, setQuoteType] = useState<"materials" | "labor">("materials");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const [clients, setClients] = useState<
    { id: string; name: string; phone: string; email?: string; address?: string }[]
  >([]);
  // cargar clientes desde la API al montar
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cliente");
        if (!res.ok) throw new Error("Error cargando clientes");
        const data = await res.json();
        // mapea los campos del backend (idCliente, nombre, telefono, correo, direccion)
        const mapped = data.map((c: {
          idCliente: any; id: any; nombre: any; name: any;
          telefono: any; phone: any; correo: any; email: any; domicilio: any; address: any;
        }) => ({
          id: String(c.idCliente ?? c.id ?? c.idCliente),
          name: c.nombre ?? c.name,
          phone: c.telefono ?? c.phone ?? "",
          email: c.correo ?? c.email ?? "",
          address: c.domicilio ?? c.address ?? "",
        }));
        setClients(mapped);
      } catch (err) {
        console.error("Error cargando clientes:", err);
        toast.error("No se pudieron cargar los clientes");
      }
    };

    loadClients();
  }, []);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/producto")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);


  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.includes(clientSearchTerm) ||
    client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(product =>
    product.idProducto.toString().toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.nombre.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewClientInputChange = (field: string, value: string) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNewClient = async () => {
    if (!newClientData.name.trim() || !newClientData.phone.trim()) {
      toast.error("Nombre y teléfono son campos obligatorios");
      return;
    }

    try {
      // petición al servidor
      const res = await fetch("http://localhost:5000/api/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newClientData.name.trim(),
          telefono: newClientData.phone.trim(),
          correo: newClientData.email.trim() || null,
          domicilio: newClientData.address.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error al crear cliente:", text);
        throw new Error("Error creando cliente");
      }

      const data = await res.json();
      // el backend devuelve { idCliente } según el controller que te dí
      const newId = String(data.idCliente ?? data.id ?? `C${Date.now()}`);

      const newClient = {
        id: newId,
        name: newClientData.name.trim(),
        phone: newClientData.phone.trim(),
        email: newClientData.email.trim() || "",
        address: newClientData.address.trim() || "",
      };

      // actualiza estado local
      setClients(prev => [...prev, newClient]);
      setFormData(prev => ({
        ...prev, clientId: newClient.id, clientName: newClient.name,
        clientPhone: newClient.phone, clientAddress: newClient.address, clientEmail: newClient.email
      }));

      // limpiar UI
      setNewClientData({ name: "", phone: "", email: "", address: "" });
      setShowNewClientModal(false);
      setClientSearchTerm("");
      toast.success("Cliente agregado y seleccionado exitosamente");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear el cliente");
    }
  };


  const handleClientSelect = (client: any) => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientAddress: client.address,
      clientPhone: client.phone,
      clientEmail: client.email
    }));
    setClientSearchTerm(""); // Limpiar búsqueda al seleccionar
  };

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Selecciona un producto y cantidad válida");
      return;
    }

    const product = products.find(p => p.idProducto.toString() === selectedProduct);
    if (!product) return;

    const existingItem = items.find(item => item.productId === selectedProduct);
    if (existingItem) {
      setItems(prev => prev.map(item =>
        item.productId === selectedProduct
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * product.precioUnitario }
          : item
      ));
    } else {
      const newItem: QuoteItem = {
        id: `item-${Date.now()}`,
        productId: selectedProduct,
        productName: product.nombre,
        unitPrice: product.precioUnitario,
        type: product.tipo,
        color: product.color,
        unity: product.unidad,
        unitMed: product.unidadMedida,
        quantity: quantity,
        subtotal: quantity * product.precioUnitario,
        discount: 0,
        notes: ""

      };
      setItems(prev => [...prev, newItem]);
    }

    setSelectedProduct("");
    setQuantity(1);
    setProductSearchTerm("");
    toast.success("Producto agregado");
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Producto eliminado");
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
        : item
    ));
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (newPrice < 0) {
      toast.error("El precio no puede ser negativo");
      return;
    }

    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, unitPrice: newPrice, subtotal: item.quantity * newPrice }
        : item
    ));
    toast.success("Precio actualizado");
  };

  const updateItemDiscount = (
    itemId: string,
    newDiscount: number,
  ) => {
    if (newDiscount < 0 || newDiscount > 100) {
      toast.error("El descuento debe estar entre 0% y 100%");
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const itemTotal = item.quantity * item.unitPrice;
          const discountAmount = (itemTotal * newDiscount) / 100;
          return {
            ...item,
            discount: newDiscount,
            subtotal: itemTotal - discountAmount,
          };
        }
        return item;
      }),
    );
  };

  // Cálculos
  const handleLaborDataChange = (field: string, value: string | number) => {
    setLaborData(prev => {
      const next = { ...prev, [field]: value };

      // Normalizar a número
      const surfaceNum = Number(next.surface) || 0;
      const priceNum = Number(next.price) || 0;

      // Estimación = superficie * precio (número con 2 decimales)
      next.estimation = +(surfaceNum * priceNum).toFixed(2);


      return next;
    });
  };

  const [nota, setNota] = useState("");
  const date = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Cálculos separados por tipo
  const subtotalMaterials = items.reduce((sum, item) => sum + item.subtotal, 0);
  const subtotalLabor = Number(laborData.price) || 0;

  // subtotal "activo" según tipo
  const subtotal = quoteType === "materials" ? subtotalMaterials : subtotalLabor;

  // descuentos/impuestos SOLO para materials
  const discountAmount = quoteType === "materials"
    ? (subtotalMaterials * (Number(formData.discount) || 0)) / 100
    : 0;

  const taxableAmount = quoteType === "materials"
    ? subtotalMaterials - discountAmount
    : 0;

  const taxAmount = quoteType === "materials"
    ? (taxableAmount * (Number(formData.tax) || 0)) / 100
    : 0;

  // total según tipo
  const total = quoteType === "materials"
    ? subtotalMaterials - discountAmount + taxAmount
    : subtotalLabor; // para mano de obra, el total es el precio acordado (puedes restar anticipo si prefieres)


  const generatePDF = async () => {
    // validación condicional
    if (
      !formData.clientId ||
      (quoteType === "materials" && items.length === 0) ||
      (quoteType === "labor" && !laborData.system.trim())
    ) {
      toast.error("Completa la cotización antes de generar el PDF");
      return;
    }


    const endpoint =
      quoteType === "materials"
        ? "http://localhost:5000/api/cotizacion/pdf"
        : "http://localhost:5000/api/servicio/pdf";

    try {
      // payload base común
      const basePayload: any = {
        quoteType,//este es el que manda al cotizacionController, que cotizacion es
        numero: formData.clientId,
        cliente: formData.clientName,
        domicilio: formData.clientAddress,
        telefono: formData.clientPhone,
        correo: formData.clientEmail,
        nota,
        subtotal,
        total,
        date,
      };

      // datos específicos por tipo
      if (quoteType === "materials") {
        basePayload.productos = items.map((item) => ({
          codigo: item.productId,
          nombre: item.productName,
          color: item.color,
          tipo: item.type,
          unidad: item.unity,
          unidadMedida: item.unitMed,
          cantidad: item.quantity,
          precio: item.unitPrice,
        }));
        basePayload.iva = taxAmount;
        toast.info("Generando PDF...");
      } else {
        // Deja un array "manoobra" para luego detallar líneas/partidas de trabajo
        basePayload.manoObra = [
          {
            descripcion: laborData.description ?? "",
            sistema: laborData.system ?? "",
            acabado: laborData.finish ?? "",
            superficie: laborData.surface ?? "",
            estimacion: laborData.estimation ?? "",
            precio: Number(laborData.price) || 0,
            anticipo: Number(laborData.advance) || 0,
            saldo: Number(laborData.balance) || 0,
            garantia: laborData.warranty ?? "",
          },
          // puedes enviar más objetos si necesitas varias partidas
        ];
        toast.info("Generando PDF...");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });

      if (!response.ok) {
        toast.error("Error generando PDF en el servidor");
        return;
      }

      const data = await response.json();
      if (data && data.url) {
        toast.success("PDF generado con éxito");
        window.open(data.url, "_blank");
      } else {
        toast.error("No se devolvió URL del PDF");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al generar PDF");
    }
  };



  const convertToSale = () => {
    if (!formData.clientId || items.length === 0) {
      toast.error("Completa la cotización antes de convertir a venta");
      return;
    }
    if (quoteType === "materials" && items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    if (quoteType === "labor" && !laborData.system) {
      toast.error("Completa la información de mano de obra");
      return;
    }
    // Guardar cotización primero
    const quoteData = {
      id: `COT-${Date.now()}`,
      clientId: formData.clientId,
      clientName: formData.clientName,
      quoteType,
      items: quoteType === "materials" ? items : [],
      subtotal,
      discount: formData.discount,
      tax: formData.tax,
      total,
      notes: formData.notes,
      date: new Date().toISOString().split('T')[0],
      status: 'Convertida a Venta'
    };

    const existingQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    existingQuotes.push(quoteData);
    localStorage.setItem('quotes', JSON.stringify(existingQuotes));

    // Redirigir a nueva venta con datos precargados
    localStorage.setItem('saleFromQuote', JSON.stringify({
      clientId: formData.clientId,
      clientName: formData.clientName,
      items,
      discount: formData.discount,
      tax: formData.tax,
      notes: formData.notes
    }));

    toast.success("Cotización convertida a venta");
    onViewChange('new-sale');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Selecciona un cliente");
      return;
    }

    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    const quoteData = {
      id: `COT-${Date.now()}`,
      clientId: formData.clientId,
      clientName: formData.clientName,
      items,
      subtotal,
      discount: formData.discount,
      tax: formData.tax,
      total,
      notes: formData.notes,
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente'
    };

    const existingQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    existingQuotes.push(quoteData);
    localStorage.setItem('quotes', JSON.stringify(existingQuotes));

    toast.success("Cotización creada exitosamente");

    setTimeout(() => {
      onViewChange('quotes-history');
    }, 1000);
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onViewChange('quote-history')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Historial
          </Button>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-slate-800 text-2xl font-semibold">Nueva Cotización</h2>
              <p className="text-slate-600">Crea una cotización para enviar al cliente</p>
            </div>
          </div>
        </div>

        {/* Selector de tipo de cotización */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={quoteType === "materials" ? "default" : "outline"}
            onClick={() => handleSetQuoteType("materials")}
            className={quoteType === "materials"
              ? "bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              : "border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
            }
          >
            <Package className="h-4 w-4 mr-2" />
            Materiales
          </Button>
          <Button
            type="button"
            variant={quoteType === "labor" ? "default" : "outline"}
            onClick={() => handleSetQuoteType("labor")}
            className={quoteType === "labor"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              : "border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
            }
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Mano de Obra
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del cliente */}
          <Card className="border-slate-200 rounded-lg">

            <CardContent className="space-y-4">
              {/* Cliente seleccionado o buscador */}
              {selectedClient ? (
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Cliente Seleccionado
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">
                        {selectedClient.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {selectedClient.phone}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedClient.email}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"

                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          clientId: "",
                          clientName: "",
                        }));
                        setClientSearchTerm("");
                      }}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="client-search"
                      className="text-slate-700"
                    >
                      Buscar Cliente *
                    </Label>
                    <Dialog
                      open={showNewClientModal}
                      onOpenChange={setShowNewClientModal}
                    >
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-blue-300 text-blue-600 hover:bg-blue-50 h-8 px-3 py-1"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Nuevo Cliente
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            Agregar Nuevo Cliente
                          </DialogTitle>
                          <DialogDescription>
                            Completa la información del cliente
                            para agregarlo al sistema.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-client-name">
                              Nombre/Razón Social *
                            </Label>
                            <Input
                              id="new-client-name"
                              value={newClientData.name}
                              onChange={(e) =>
                                handleNewClientInputChange(
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="Ej: Juan Pérez o Constructora ABC S.A."
                              className="rounded-lg border-slate-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-client-address">
                              Dirección *
                            </Label>
                            <Input
                              id="new-client-address"
                              value={newClientData.address}
                              onChange={(e) =>
                                handleNewClientInputChange(
                                  "address",
                                  e.target.value,
                                )
                              }
                              placeholder=""
                              className="rounded-lg border-slate-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-client-phone">
                              Teléfono *
                            </Label>
                            <Input
                              id="new-client-phone"
                              value={newClientData.phone}
                              onChange={(e) =>
                                handleNewClientInputChange(
                                  "phone",
                                  e.target.value,
                                )
                              }
                              placeholder="Ej: 555-0123"

                              className="rounded-lg border-slate-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-client-email">
                              Email
                            </Label>
                            <Input
                              id="new-client-email"
                              type="email"
                              value={newClientData.email}
                              onChange={(e) =>
                                handleNewClientInputChange(
                                  "email",
                                  e.target.value,
                                )
                              }
                              placeholder="cliente@email.com"
                              className="rounded-lg border-slate-300"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={addNewClient}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Agregar Cliente
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setShowNewClientModal(false)
                            }
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="client-search"
                      value={clientSearchTerm}
                      onChange={(e) =>
                        setClientSearchTerm(e.target.value)
                      }
                      placeholder="Buscar por nombre, teléfono o email..."
                      className="pl-10 rounded-lg border-slate-300"
                      autoComplete="off"
                    />
                  </div>

                  {clientSearchTerm &&
                    filteredClients.length > 0 && (
                      <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                        {filteredClients.map((client) => (
                          <div
                            key={client.id}
                            onClick={() =>
                              handleClientSelect(client)
                            }
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-slate-800">
                              {client.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {client.phone} • {client.email}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {clientSearchTerm &&
                    filteredClients.length === 0 && (
                      <div className="p-4 text-center text-slate-500 text-sm border border-slate-200 rounded-lg">
                        No se encontraron clientes. Intenta con
                        otro término o agrega un nuevo cliente.
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agregar productos */}
          {quoteType === "materials" ? (
            <Card className="border-slate-200 rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800">Agregar Productos</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-descriptions-sale"
                      checked={includeDescriptions}
                      onCheckedChange={(checked) =>
                        setIncludeDescriptions(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="include-descriptions-sale"
                      className="text-sm text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      Incluir descripción
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buscador de productos */}
                <div className="mb-4">
                  <Label htmlFor="product-search" className="text-slate-700">Buscar Producto</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="product-search"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre o categoría..."
                      className="pl-10 rounded-lg border-slate-300"
                      autoComplete="off"
                    />
                  </div>
                  {productSearchTerm && filteredProducts.length > 0 && (
                    <div className="mt-2 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.idProducto}
                          onClick={() => {
                            setSelectedProduct(product.idProducto.toString());
                            setProductSearchTerm("");
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-800">{product.nombre} - {product.tipo}: {product.unidad} {product.unidadMedida} {product.color}</div>
                          <div className="text-sm text-slate-600">${product.precioUnitario} • Stock: {product.stock} • {product.categoria}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="product" className="text-slate-700">Producto Seleccionado</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="rounded-lg border-slate-300">
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.idProducto} value={product.idProducto.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.nombre} - {product.tipo}: {product.unidad} {product.unidadMedida} {product.color}</span>
                              <span className="text-sm text-slate-500">
                                ${product.precioUnitario} • Stock: {product.stock} • {product.categoria}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label htmlFor="quantity" className="text-slate-700">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={addItem}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="border border-slate-200 rounded-lg ">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="w-20">
                            Cantidad
                          </TableHead>
                          <TableHead className="w-28">
                            Precio Unit.
                          </TableHead>
                          <TableHead className="w-24">
                            Desc. %
                          </TableHead>
                          <TableHead className="w-24">
                            Subtotal
                          </TableHead>
                          <TableHead className="w-16">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const itemTotal = item.quantity * item.unitPrice;
                          const discountAmount = (itemTotal * item.discount) / 100;

                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.productName} {item.unity} {item.unitMed} {item.color}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItemQuantity(
                                      item.id,
                                      Number(e.target.value),
                                    )
                                  }
                                  min="1"
                                  className="w-16 h-8 text-center border-slate-300"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-500">
                                    $
                                  </span>
                                  <Input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                      updateItemPrice(
                                        item.id,
                                        Number(e.target.value),
                                      )
                                    }
                                    min="0"
                                    step="0.01"
                                    className="w-20 h-8 text-center border-slate-300"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) =>
                                      updateItemDiscount(
                                        item.id,
                                        Number(e.target.value),
                                      )
                                    }
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-16 h-8 text-center border-slate-300"
                                  />
                                  <span className="text-xs text-slate-500">%</span>
                                </div>
                                {item.discount > 0 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    -${discountAmount.toFixed(2)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">
                                  ${item.subtotal.toFixed(2)}
                                </div>
                                {item.discount > 0 && (
                                  <div className="text-xs text-slate-500 line-through">
                                    ${itemTotal.toFixed(2)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    removeItem(item.id)
                                  }
                                  className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="p-3 bg-slate-50 text-xs text-slate-600 border-t border-slate-200">
                      💡 Tip: Puedes modificar cantidades, precios y aplicar descuentos individuales directamente en la tabla
                    </div>

                  </div>

                )}
              </CardContent>

            </Card>
          ) : (
            <Card className="border-slate-200 rounded-lg">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Información de Mano de Obra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="system" className="text-slate-700">
                      Sistema *
                    </Label>
                    <Input
                      id="system"
                      value={laborData.system}
                      onChange={(e) => handleLaborDataChange("system", e.target.value)}
                      placeholder="Ej: Impermeabilización de techos"
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finish" className="text-slate-700">
                      Acabado
                    </Label>
                    <Input
                      id="finish"
                      value={laborData.finish}
                      onChange={(e) => handleLaborDataChange("finish", e.target.value)}
                      placeholder="Ej: Texturizado, liso"
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surface" className="text-slate-700">
                      Superficie
                    </Label>
                    <Input
                      id="surface"
                      type="number"
                      value={laborData.surface}
                      onChange={(e) => handleLaborDataChange("surface", e.target.value)}
                      placeholder="Ej: 150"
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-700">
                      Precio Total *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={laborData.price || ""}
                      onChange={(e) => handleLaborDataChange("price", Number(e.target.value))}
                      placeholder="0.00"
                      className="rounded-lg border-slate-300"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advance" className="text-slate-700">
                      Anticipo
                    </Label>
                    <Input
                      id="advance"
                      type="number"
                      value={laborData.advance || ""}
                      onChange={(e) => handleLaborDataChange("advance", Number(e.target.value))}
                      placeholder="0.00"
                      className="rounded-lg border-slate-300"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance" className="text-slate-700">
                      Saldo
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      value={laborData.balance || ""}
                      onChange={(e) => handleLaborDataChange("balance", Number(e.target.value))}
                      className="rounded-lg border-slate-300 bg-slate-50"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-slate-700">
                    Garantía
                  </Label>
                  <Input
                    id="warranty"
                    value={laborData.warranty}
                    onChange={(e) => handleLaborDataChange("warranty", e.target.value)}
                    placeholder="Ej: 5 años contra defectos de instalación"
                    className="rounded-lg border-slate-300"
                  />
                </div>
                </div>

           

                
              </CardContent>

            </Card>

          )}
          {/* Información adicional */}
          <Card className="border-slate-200 rounded-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">Notas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    id="notes"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Condiciones, términos y observaciones especiales..."
                    className="rounded-lg border-slate-300 pr-16 pb-8"
                    maxLength={300}
                  />

                  <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${nota.length > 280
                    ? 'text-red-500'
                    : nota.length > 250
                      ? 'text-amber-500'
                      : 'text-slate-400'
                    }`}>
                    {nota.length}/300
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Resumen */}
        <div className="space-y-6">
          <Card className="border-slate-200 rounded-lg sticky top-6">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Cotización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {quoteType === "materials" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${subtotalMaterials.toFixed(2)}</span>
                    </div>

                    {formData.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Descuento ({formData.discount}%):</span>
                        <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-600">IVA ({formData.tax}%):</span>
                      <span className="font-medium">${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-800">Total:</span>
                        <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // resumen para "labor"
                  <>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-800">Estimacion:</span>
                      <span className="text-xl font-bold text-blue-600">${(Number(laborData.surface) * Number(laborData.price)).toFixed(2)}</span>
                    </div>

                  </>
                )}

              </div>

              <div className="text-sm text-slate-500 space-y-1">
                {quoteType === "materials" ? (
                  <>
                    <p>Productos: {items.length}</p>
                    <p>Unidades: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  </>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={
                    !formData.clientId ||
                    (quoteType === "materials" && items.length === 0) ||
                    (quoteType === "labor" && !laborData.system.trim())
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  Crear Cotización
                </Button>

                {/*<Button
                  type="button"
                  onClick={convertToSale}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  disabled={items.length === 0 || !formData.clientId}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Convertir a Venta
                </Button>*/}

                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePDF}
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                  disabled={
                    !formData.clientId ||
                    (quoteType === "materials" && items.length === 0) ||
                    (quoteType === "labor" && !laborData.system)
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onViewChange('sales')}
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}