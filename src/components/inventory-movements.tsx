import { useState } from "react";
import { ArrowLeft, Save, Package, TrendingUp, TrendingDown, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";

interface InventoryMovementsProps {
  onViewChange: (view: string) => void;
  movementType: 'entries' | 'exits';
}

export function InventoryMovements({ onViewChange, movementType }: InventoryMovementsProps) {
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    date: new Date().toISOString().split('T')[0],
    observations: "",
    movementType: movementType
  });

  const [productSearch, setProductSearch] = useState("");

  // Productos mock
  const products = [
    { id: "1", name: "Impermeabilizante Acrílico Premium", currentStock: 25 },
    { id: "2", name: "Membrana Prefabricada APP", currentStock: 5 },
    { id: "3", name: "Sellador Poliuretano", currentStock: 15 },
    { id: "4", name: "Impermeabilizante Elastomérico", currentStock: 3 },
    { id: "5", name: "Primer Acrílico Base Agua", currentStock: 18 }
  ];

  const selectedProduct = products.find(p => p.id === formData.productId);

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMovementTypeChange = (value: string) => {
    // Limpiar selección de producto y búsqueda cuando cambia el tipo
    setFormData(prev => ({
      ...prev,
      movementType: value,
      productId: ""
    }));
    setProductSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.productId || !formData.quantity || !formData.date) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    // Validar salida no mayor al stock actual
    if (formData.movementType === 'exits' && selectedProduct && quantity > selectedProduct.currentStock) {
      toast.error(`No hay suficiente stock. Stock actual: ${selectedProduct.currentStock}`);
      return;
    }

    // Simular registro del movimiento
    const actionText = formData.movementType === 'entries' ? 'entrada' : 'salida';
    toast.success(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} registrada exitosamente`);
    
    // Limpiar formulario
    setFormData({
      productId: "",
      quantity: "",
      date: new Date().toISOString().split('T')[0],
      observations: "",
      movementType: movementType
    });

    // Regresar al inventario después de 1 segundo
    setTimeout(() => {
      onViewChange('inventory');
    }, 1000);
  };

  const isEntry = movementType === 'entries';
  const title = isEntry ? 'Registrar Entrada' : 'Registrar Salida';
  const description = isEntry ? 'Registra el ingreso de productos al inventario' : 'Registra la salida de productos del inventario';
  const Icon = isEntry ? TrendingUp : TrendingDown;
  const colorClass = isEntry ? 'text-green-600' : 'text-red-600';
  const bgClass = isEntry ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

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
          <Icon className={`h-6 w-6 ${colorClass}`} />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">{title}</h2>
            <p className="text-slate-600">{description}</p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Movimiento de Inventario
          </CardTitle>
          <CardDescription className="text-slate-600">
            Completa la información del movimiento de productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700">Tipo de Movimiento</Label>
              <RadioGroup 
                value={formData.movementType} 
                onValueChange={handleMovementTypeChange}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entries" id="entries" />
                  <Label htmlFor="entries" className="flex items-center gap-2 text-slate-700">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Entrada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exits" id="exits" />
                  <Label htmlFor="exits" className="flex items-center gap-2 text-slate-700">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Salida
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Búsqueda de productos - solo visible después de seleccionar tipo */}
            {formData.movementType && (
              <div className="space-y-2">
                <Label htmlFor="productSearch" className="text-slate-700">Buscar Producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="productSearch"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Escribe el nombre del producto..."
                    className="pl-10 rounded-lg border-slate-300"
                  />
                </div>
                {productSearch && (
                  <p className="text-sm text-slate-600">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Selector de producto - solo visible después de seleccionar tipo */}
            {formData.movementType && (
              <div className="space-y-2">
                <Label htmlFor="product" className="text-slate-700">Producto *</Label>
                <Select 
                  value={formData.productId} 
                  onValueChange={(value) => handleInputChange('productId', value)}
                >
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex justify-between items-center w-full">
                        <span>{product.name}</span>
                        <span className="text-sm text-slate-500 ml-2">Stock: {product.currentStock}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-sm text-slate-600">
                  Stock actual: <span className="font-medium">{selectedProduct.currentStock}</span> unidades
                </p>
              )}
            </div>
            )}

            {/* Campos de cantidad y fecha - solo visibles después de seleccionar tipo */}
            {formData.movementType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-700">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Ej: 10"
                  min="1"
                  className="rounded-lg border-slate-300"
                />
                {formData.movementType === 'exits' && selectedProduct && formData.quantity && 
                 parseInt(formData.quantity) > selectedProduct.currentStock && (
                  <p className="text-sm text-red-600">
                    ⚠️ Cantidad excede el stock disponible
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-700">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="rounded-lg border-slate-300"
                />
              </div>
              </div>
            )}

            {/* Campo de observaciones - solo visible después de seleccionar tipo */}
            {formData.movementType && (
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-slate-700">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  placeholder="Agrega cualquier observación sobre este movimiento..."
                  className="rounded-lg border-slate-300 min-h-[100px]"
                />
              </div>
            )}

            {/* Botones - solo visibles después de seleccionar tipo */}
            {formData.movementType && (
              <div className="flex gap-4 pt-4">
              <Button 
                type="submit"
                className={`${bgClass} text-white rounded-lg`}
              >
                <Save className="h-4 w-4 mr-2" />
                Registrar {isEntry ? 'Entrada' : 'Salida'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => onViewChange('inventory')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Cancelar
              </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}