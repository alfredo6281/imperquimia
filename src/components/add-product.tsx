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
    nombre: "",
    categoria: "",
    unidaMedida: "",
    Stock: "",
    precioUnitario: "",
    proveedor: ""
  });

  const categorias = [
    "Acrílico",
    "Prefabricado", 
    "Elastomérico",
    "Sellador",
    "Primer",
    "Fibrado",
    "Cemento"
  ];

  const unidadesMedida = [
    "Litros",
    "Kilogramos", 
    "Metros",
    "Metros²",
    "Unidades",
    "Galones"
  ];

  const proveedores = [
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nombre || 
      !formData.categoria || 
      !formData.unidaMedida || 
      !formData.Stock || 
      !formData.precioUnitario || 
      !formData.proveedor
    ) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/producto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          categoria: formData.categoria,
          unidadMedida: formData.unidaMedida,
          Stock: parseInt(formData.Stock, 10),
          precioUnitario: parseFloat(formData.precioUnitario),
          proveedor: formData.proveedor
        })
      });

      if (!response.ok) {
        throw new Error("Error al guardar el producto");
      }

      toast.success("Producto agregado exitosamente");

      // Limpiar formulario
      setFormData({
        nombre: "",
        categoria: "",
        unidaMedida: "",
        Stock: "",
        precioUnitario: "",
        proveedor: ""
      });

      setTimeout(() => {
        onViewChange("inventory");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema al guardar el producto");
    }
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
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Impermeabilizante Acrílico Premium"
                  className="rounded-lg border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-slate-700">Categoría</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitMeasure" className="text-slate-700">Unidad de Medida</Label>
                <Select value={formData.unidaMedida} onValueChange={(value) => handleInputChange('unidaMedida', value)}>
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unit) => (
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
                  value={formData.Stock}
                  onChange={(e) => handleInputChange('Stock', e.target.value)}
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
                  value={formData.precioUnitario}
                  onChange={(e) => handleInputChange('precioUnitario', e.target.value)}
                  placeholder="Ej: 45.99"
                  min="0"
                  className="rounded-lg border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-slate-700">Proveedor</Label>
                <Select value={formData.proveedor} onValueChange={(value) => handleInputChange('proveedor', value)}>
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Selecciona proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((supplier) => (
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