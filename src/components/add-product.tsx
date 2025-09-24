import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

interface AddProductProps {
  onViewChange: (view: string) => void;
}

export function AddProduct({ onViewChange }: AddProductProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unitMeasure: "",
    initialStock: "",
    unitPrice: "",
    supplier: ""
  });

  const categories = [
    "Acrílico",
    "Prefabricado", 
    "Elastomérico",
    "Sellador",
    "Primer",
    "Fibrado",
    "Cemento"
  ];

  const unitMeasures = [
    "Litros",
    "Kilogramos", 
    "Metros",
    "Metros²",
    "Unidades",
    "Galones"
  ];

  const suppliers = [
    "Distribuidora ABC",
    "Impertech S.A.",
    "QuímicosXYZ",
    "Materiales DEF",
    "Construcción GHI"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.category || !formData.unitMeasure || 
        !formData.initialStock || !formData.unitPrice || !formData.supplier) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    // Simular guardado del producto
    toast.success("Producto agregado exitosamente");
    
    // Limpiar formulario
    setFormData({
      name: "",
      category: "",
      unitMeasure: "",
      initialStock: "",
      unitPrice: "",
      supplier: ""
    });

    // Regresar al inventario después de 1 segundo
    setTimeout(() => {
      onViewChange('inventory');
    }, 1000);
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
        <div>
          <h2 className="text-slate-800 text-2xl font-semibold">Agregar Nuevo Producto</h2>
          <p className="text-slate-600">Registra un nuevo producto impermeabilizante</p>
        </div>
      </div>

      <Card className="max-w-2xl border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Información del Producto</CardTitle>
          <CardDescription className="text-slate-600">
            Completa todos los campos para agregar el producto al inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Impermeabilizante Acrílico Premium"
                  className="rounded-lg border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitMeasure" className="text-slate-700">Unidad de Medida</Label>
                <Select value={formData.unitMeasure} onValueChange={(value) => handleInputChange('unitMeasure', value)}>
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitMeasures.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialStock" className="text-slate-700">Stock Inicial</Label>
                <Input
                  id="initialStock"
                  type="number"
                  value={formData.initialStock}
                  onChange={(e) => handleInputChange('initialStock', e.target.value)}
                  placeholder="Ej: 50"
                  min="0"
                  className="rounded-lg border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-slate-700">Precio Unitario</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  placeholder="Ej: 45.99"
                  min="0"
                  className="rounded-lg border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-slate-700">Proveedor</Label>
                <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Producto
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