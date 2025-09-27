import { useState } from "react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
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
    stockMinimo: "",
    precioUnitario: "",
    proveedor: "",
    peso: "",
    dimensiones: ""
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor selecciona un archivo de imagen válido");
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
        stockMinimo: "",
        precioUnitario: "",
        proveedor: "",
        peso: "",
        dimensiones: ""
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
                <div className="relative">
                  <Input
                    id="name"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Impermeabilizante Acrílico"
                    className="rounded-lg border-slate-300 pr-16"
                    maxLength={100}
                  />
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none ${
                    formData.nombre.length > 80 
                      ? 'text-red-500' 
                      : formData.nombre.length > 60 
                        ? 'text-amber-500' 
                        : 'text-slate-400'
                  }`}>
                    {formData.nombre.length}/100
                  </span>
                </div>
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
                <Label htmlFor="stockMinimo" className="text-slate-700">Stock Minimo</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
                  placeholder="Ej: 50"
                  min="0"
                  className="rounded-lg border-slate-300"
                />
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
                <Label htmlFor="dimensiones" className="text-slate-700">Dimensiones</Label>
                <div className="relative">
                  <Input
                    id="dimensiones"
                    value={formData.dimensiones}
                    onChange={(e) => handleInputChange('dimensiones', e.target.value)}
                    placeholder="Ej: 10 cm x 10 cm"
                    className="rounded-lg border-slate-300 pr-16"
                    maxLength={20}
                  />
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none ${
                    formData.dimensiones.length > 20 
                      ? 'text-red-500' 
                      : formData.dimensiones.length > 15 
                        ? 'text-amber-500' 
                        : 'text-slate-400'
                  }`}>
                    {formData.dimensiones.length}/20
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso" className="text-slate-700">Peso</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Kg"
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
            {/* Sección de imagen */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div>
                <Label className="text-slate-700 text-lg">Imagen del Producto</Label>
                <p className="text-sm text-slate-600 mt-1">Agrega una imagen representativa del producto (máximo 5MB)</p>
              </div>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Haz clic para seleccionar una imagen</p>
                    <p className="text-sm text-slate-500">PNG, JPG, GIF hasta 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-48 h-48 object-cover rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2">
                    <p className="text-sm text-slate-600">
                      {selectedImage?.name} ({((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              )}
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