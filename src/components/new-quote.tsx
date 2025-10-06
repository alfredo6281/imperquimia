import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, Calculator, FileText, Search, UserPlus, X, Download, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";

interface NewQuoteProps {
  onViewChange: (view: string) => void;
}

interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export function NewQuote({ onViewChange }: NewQuoteProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    notes: "",
    discount: 0,
    tax: 16,
    validDays: 30
  });
  
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  // Datos mock - usando estado para permitir agregar nuevos clientes
  const [mockClients, setMockClients] = useState([
    { id: "C001", name: "Constructora ABC S.A.", phone: "555-0101", email: "contacto@abc.com" },
    { id: "C002", name: "Juan Pérez", phone: "555-0102", email: "juan@email.com" },
    { id: "C003", name: "Inmobiliaria XYZ", phone: "555-0103", email: "ventas@xyz.com" },
    { id: "C004", name: "Reparaciones DEF", phone: "555-0104", email: "info@def.com" },
    { id: "C005", name: "María González", phone: "555-0105", email: "maria@email.com" }
  ]);

  const mockProducts = [
    { id: "P001", name: "Impermeabilizante Acrílico Premium 5L", price: 114.99, stock: 25, category: "Acrílico" },
    { id: "P002", name: "Sellador Elastomérico Ultra 1L", price: 49.99, stock: 40, category: "Sellador" },
    { id: "P003", name: "Membrana Prefabricada SBS 10m²", price: 89.99, stock: 15, category: "Prefabricado" },
    { id: "P004", name: "Primer Acrílico Base Agua 2L", price: 39.99, stock: 30, category: "Primer" },
    { id: "P005", name: "Fibra de Vidrio Malla 5m", price: 9.99, stock: 50, category: "Fibrado" }
  ];

  // Filtrar clientes por término de búsqueda
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.includes(clientSearchTerm) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Filtrar productos por término de búsqueda
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
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

  const addNewClient = () => {
    if (!newClientData.name.trim() || !newClientData.phone.trim()) {
      toast.error("Nombre y teléfono son campos obligatorios");
      return;
    }

    const existingClient = mockClients.find(client => 
      client.name.toLowerCase() === newClientData.name.trim().toLowerCase()
    );
    if (existingClient) {
      toast.error("Ya existe un cliente con ese nombre");
      return;
    }

    const newId = `C${String(mockClients.length + 1).padStart(3, '0')}`;
    const newClient = {
      id: newId,
      name: newClientData.name.trim(),
      phone: newClientData.phone.trim(),
      email: newClientData.email.trim() || ""
    };

    setMockClients(prev => [...prev, newClient]);
    setFormData(prev => ({
      ...prev,
      clientId: newId,
      clientName: newClient.name
    }));

    setNewClientData({ name: "", phone: "", email: "", address: "" });
    setShowNewClientModal(false);
    setClientSearchTerm("");
    toast.success("Cliente agregado y seleccionado exitosamente");
  };

  const handleClientSelect = (client: any) => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name
    }));
    setClientSearchTerm(client.name);
  };

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Selecciona un producto y cantidad válida");
      return;
    }

    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingItem = items.find(item => item.productId === selectedProduct);
    if (existingItem) {
      setItems(prev => prev.map(item => 
        item.productId === selectedProduct 
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * product.price }
          : item
      ));
    } else {
      const newItem: QuoteItem = {
        id: `item-${Date.now()}`,
        productId: selectedProduct,
        productName: product.name,
        unitPrice: product.price,
        quantity: quantity,
        subtotal: quantity * product.price
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

  // Cálculos
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * formData.discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * formData.tax) / 100;
  const total = taxableAmount + taxAmount;

  const generatePDF = () => {
    toast.success("Generando PDF de cotización...");
    // Aquí implementarías la generación real del PDF
  };

  const convertToSale = () => {
    if (!formData.clientId || items.length === 0) {
      toast.error("Completa la cotización antes de convertir a venta");
      return;
    }

    // Guardar cotización primero
    const quoteData = {
      id: `COT-${Date.now()}`,
      clientId: formData.clientId,
      clientName: formData.clientName,
      items,
      subtotal,
      discount: formData.discount,
      tax: formData.tax,
      total,
      validDays: formData.validDays,
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
      validDays: formData.validDays,
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

  const selectedClient = mockClients.find(c => c.id === formData.clientId);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => onViewChange('sales')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Ventas
        </Button>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">Nueva Cotización</h2>
            <p className="text-slate-600">Crea una cotización para enviar al cliente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del cliente */}
          <Card className="border-slate-200 rounded-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="client-search" className="text-slate-700">Buscar Cliente *</Label>
                  <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
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
                        <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                          Completa la información del cliente para agregarlo al sistema.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-client-name">Nombre/Razón Social *</Label>
                          <Input
                            id="new-client-name"
                            value={newClientData.name}
                            onChange={(e) => handleNewClientInputChange('name', e.target.value)}
                            placeholder="Ej: Juan Pérez o Constructora ABC S.A."
                            className="rounded-lg border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-client-phone">Teléfono *</Label>
                          <Input
                            id="new-client-phone"
                            value={newClientData.phone}
                            onChange={(e) => handleNewClientInputChange('phone', e.target.value)}
                            placeholder="Ej: 555-0123"
                            className="rounded-lg border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-client-email">Email</Label>
                          <Input
                            id="new-client-email"
                            type="email"
                            value={newClientData.email}
                            onChange={(e) => handleNewClientInputChange('email', e.target.value)}
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
                          onClick={() => setShowNewClientModal(false)}
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
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o email..."
                    className="pl-10 rounded-lg border-slate-300"
                  />
                </div>

                {clientSearchTerm && filteredClients.length > 0 && (
                  <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <div className="font-medium text-slate-800">{client.name}</div>
                        <div className="text-sm text-slate-600">{client.phone} • {client.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedClient && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <h4 className="font-medium text-slate-800">{selectedClient.name}</h4>
                  <p className="text-sm text-slate-600">{selectedClient.phone}</p>
                  <p className="text-sm text-slate-600">{selectedClient.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agregar productos */}
          <Card className="border-slate-200 rounded-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">Agregar Productos</CardTitle>
            </CardHeader>
            <CardContent>
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
                  />
                </div>
                {productSearchTerm && filteredProducts.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setProductSearchTerm("");
                        }}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <div className="font-medium text-slate-800">{product.name}</div>
                        <div className="text-sm text-slate-600">${product.price} • Stock: {product.stock} • {product.category}</div>
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
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-sm text-slate-500">
                              ${product.price} • Stock: {product.stock} • {product.category}
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

              {/* Lista de productos */}
              {items.length > 0 && (
                <div className="border border-slate-200 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="w-20">Cantidad</TableHead>
                        <TableHead className="w-28">Precio Unit.</TableHead>
                        <TableHead className="w-24">Subtotal</TableHead>
                        <TableHead className="w-16">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                              min="1"
                              className="w-16 h-8 text-center border-slate-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-500">$</span>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                                min="0"
                                step="0.01"
                                className="w-20 h-8 text-center border-slate-300"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">${item.subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="border-slate-200 rounded-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-slate-700">Descuento (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="rounded-lg border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax" className="text-slate-700">IVA (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={formData.tax}
                    onChange={(e) => handleInputChange('tax', Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="rounded-lg border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validDays" className="text-slate-700">Validez (días)</Label>
                  <Input
                    id="validDays"
                    type="number"
                    value={formData.validDays}
                    onChange={(e) => handleInputChange('validDays', Number(e.target.value))}
                    min="1"
                    className="rounded-lg border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700">Observaciones</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Condiciones, términos y observaciones especiales..."
                  className="rounded-lg border-slate-300"
                  rows={3}
                />
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
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
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
              </div>

              <div className="text-sm text-slate-500 space-y-1">
                <p>Productos: {items.length}</p>
                <p>Unidades: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p>Válida por: {formData.validDays} días</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={items.length === 0 || !formData.clientId}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Crear Cotización
                </Button>
                
                <Button 
                  type="button"
                  onClick={convertToSale}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  disabled={items.length === 0 || !formData.clientId}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Convertir a Venta
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  onClick={generatePDF}
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                  disabled={items.length === 0 || !formData.clientId}
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