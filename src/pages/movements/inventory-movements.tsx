import { useState, useEffect } from "react";
import { ArrowLeft, Save, Package, TrendingUp, TrendingDown, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

import { toast } from "sonner";

interface Product {
  idProducto: number;
  nombre: string;
  categoria:string;
  stock: number;
  tipo: string;
  unidad: number;
  unidadMedida: string;
  URLImagen: string;
}
interface InventoryMovementsProps {
  onViewChange: (view: string) => void;
  movementType: 'entries' | 'exits';
}

export function InventoryMovements({ onViewChange, movementType }: InventoryMovementsProps) {
  
  const [formData, setFormData] = useState({
    idProducto: "",
    quantity: "",
    date: new Date().toISOString().split('T')[0],
    movementType: movementType
  });

  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);


  useEffect(() => {
    fetch("http://localhost:5000/api/producto")   // <--- tu endpoint del server.js
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  const selectedProduct = products.find(p => p.idProducto.toString() === formData.idProducto);

  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.idProducto || !formData.quantity || !formData.date) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    // Validar salida no mayor al stock actual
    if (formData.movementType === 'exits' && selectedProduct && quantity > selectedProduct.stock) {
      toast.error(`No hay suficiente stock. Stock actual: ${selectedProduct.stock}`);
      return;
    }
    try {
      const url =
        formData.movementType === "entries"
          ? `http://localhost:5000/api/producto/${formData.idProducto}/aumentar-stock`
          : `http://localhost:5000/api/producto/${formData.idProducto}/disminuir-stock`;

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el servidor");

      toast.success(
        `${formData.movementType === "entries" ? "Entrada" : "Salida"} registrada exitosamente`
      );

      // Resetear form
      setFormData({
        idProducto: "",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
        movementType: movementType,
      });
      setProductSearch("");

      setTimeout(() => {
        onViewChange("inventory");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Error al registrar el movimiento");
    }
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
            {/* Búsqueda de productos */}
            <div className="space-y-2">
              <Label htmlFor="productSearch" className="text-slate-700">Buscar Producto *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="productSearch"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Escribe el nombre del producto..."
                  className="pl-10 rounded-lg border-slate-300"
                  autoComplete="off"
                />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                  {/* Lista de productos encontrados con imágenes */}
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg border-slate-200 p-2">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.idProducto}
                        onClick={() => {
                          handleInputChange('idProducto', product.idProducto.toString());
                          setProductSearch(product.nombre);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <img 
                          src={product.URLImagen?  `http://localhost:5000/img/Productos/${product.idProducto}.webp` : `src/img/no_image.webp`} 
                          alt={product.nombre}
                          className="w-8 h-8 object-cover rounded border"
                          
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{product.nombre} {product.tipo} {product.unidad}{product.unidadMedida}</p>
                          <p className="text-xs text-slate-500">Stock: {product.stock} • Categoría: {product.categoria}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {productSearch && filteredProducts.length === 0 && (
                <p className="text-sm text-slate-500">No se encontraron productos que coincidan con la búsqueda</p>
              )}
            </div>

            {/* Producto seleccionado */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label className="text-slate-700">Producto Seleccionado</Label>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <img 
                    src={selectedProduct.URLImagen?  `http://localhost:5000/img/Productos/${selectedProduct.idProducto}.webp` : `src/img/no_image.webp`} 
                    alt={selectedProduct.nombre}
                    className="w-10 h-10 object-cover rounded border"
                    onError={(e) => (e.currentTarget.src = `src/img/no_image.webp`)}
                  />

                  
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{selectedProduct.nombre}</p>
                    <p className="text-sm text-slate-600">Categoría: {selectedProduct.categoria}</p>
                    <p className="text-sm text-slate-600">
                      Stock actual: <span className="font-medium">{selectedProduct.stock}</span> unidades
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, idProducto: "" }));
                      setProductSearch("");
                    }}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Campos de cantidad y fecha */}
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
                 parseInt(formData.quantity) > selectedProduct.stock && (
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

            {/* Botones */}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}