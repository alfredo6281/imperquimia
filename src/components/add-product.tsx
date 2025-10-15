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
    idProducto:"",
    nombre: "",
    categoria: "",
    unidad:"",
    unidadMedida: "",
    tipo:"",
    stock: "",
    stockMinimo: "",
    precioUnitario: "",
    color: "",
    descripcion: "",
    URLImagen: ""
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const tipo = [
    "Bolsa",
    "Bote",
    "Brocha",
    "Cubeta",
    "Galón",
    "Juego",
    "Rollo",
    "Saco",
    "Salchicha"
  ]
  const colores = [
    "Ninguno",
    "Aluminio",
    "Amarilla",
    "Blanco",
    "Blanco Oro",
    "Café",
    "Gris",
    "Marfil",
    "Negro",
    "Paja",
    "Rojo",
    "Rosa",
    "Transparente"
  ]
  const categorias = [
    "Impermeabilizantes", 
    "Productos para Concreto",
    "Pinturas",
    "Selladores",
    "Recubrimientos"
  ];

  const unidadesMedida = [
    "Ninguno",
    "Litros",
    "Mililitros",
    "Gramos", 
    "Kilogramos", 
    "Metros²",
    "Pulgadas"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

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
    !formData.idProducto ||
    !formData.nombre ||
    !formData.categoria ||
    !formData.tipo ||
    !formData.unidadMedida ||
    !formData.stock ||
    !formData.stockMinimo ||
    !formData.precioUnitario ||
    !formData.color
  ) {
    toast.error("Por favor, completa todos los campos");
    return;
  }

  try {
    // 1️⃣ Guardar producto en la BD
    const response = await fetch("http://localhost:5000/api/producto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idProducto: parseInt(formData.idProducto, 10),
        nombre: formData.nombre,
        categoria: formData.categoria,
        tipo: formData.tipo,
        unidad: parseInt(formData.unidad || "0", 10),
        unidadMedida: formData.unidadMedida,
        color: formData.color,
        precioUnitario: parseFloat(formData.precioUnitario),
        stock: parseInt(formData.stock, 10),
        stockMinimo: parseInt(formData.stockMinimo, 10),
        descripcion: formData.descripcion,
        URLImagen: formData.URLImagen, // Se actualizará después
      }),
    });
    console.log("Respuesta del servidor:", response);
    const text = await response.text();
    console.log("Texto devuelto:", text);
    if (!response.ok) throw new Error(`Error al guardar el producto: ${response.status}`);
    if (!response.ok) throw new Error("Error al guardar el producto");

    //const data = await response.json();
    const idProducto = formData.idProducto;
    
    // 2️⃣ Subir imagen (si hay)
    if (selectedImage) {
      const formDataImage = new FormData();
      formDataImage.append("image", selectedImage);
      formDataImage.append("idProducto", String(idProducto));

      const imgRes = await fetch("http://localhost:5000/api/producto/upload", {
        method: "POST",
        body: formDataImage,
      });

      if (!imgRes.ok) throw new Error("Error al subir imagen");
    }

    toast.success("Producto agregado exitosamente");

    // Limpiar formulario
    setFormData({
      idProducto: "",
      nombre: "",
      categoria: "",
      unidad: "",
      unidadMedida: "",
      stock: "",
      tipo: "",
      stockMinimo: "",
      precioUnitario: "",
      color: "",
      descripcion: "",
      URLImagen: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setTimeout(() => {
      onViewChange("inventory");
    }, 1000);
  } catch (error) {
    console.error("Error detallado:", error);
    toast.error("Hubo un problema al guardar el producto: ");
  }
};

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4 ">
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
        </div>
      </div>

      <div className="flex gap-8 max-w-7xl">
        {/* Formulario principal */}
        <Card className="flex-1 border-slate-200 rounded-lg ">
          <CardHeader>
            <CardDescription className="text-slate-600">
              Completa todos los campos para agregar el producto al inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="parent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 formulario">
                  <div className="space-y-2">
                    <Label htmlFor="id" className="text-slate-700">Código</Label>
                    <div className="relative">
                      <Input
                        id="id"
                        value={formData.idProducto}
                        onChange={(e) => handleInputChange('idProducto', e.target.value)}
                        type="number"
                        placeholder="10000000"
                        className="rounded-lg border-slate-300 pr-16"
                        maxLength={5}
                        autoComplete="off"
                      />
                      <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none ${
                        formData.idProducto.length > 7 
                          ? 'text-red-500' 
                          : formData.idProducto.length > 5 
                            ? 'text-amber-500' 
                            : 'text-slate-400'
                      }`}>
                        {formData.idProducto.length}/8
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Nombre del Producto</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        placeholder="Ej: Impermeabilizante Acrílico"
                        className="rounded-lg border-slate-300 pr-16"
                        maxLength={50}
                        autoComplete="off"
                      />
                      <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none ${
                        formData.nombre.length > 40 
                          ? 'text-red-500' 
                          : formData.nombre.length > 25 
                            ? 'text-amber-500' 
                            : 'text-slate-400'
                      }`}>
                        {formData.nombre.length}/50
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
                    <Label htmlFor="unitMeasure" className="text-slate-700">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                      <SelectTrigger className="rounded-lg border-slate-300">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tipo.map((unit) => (
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
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      placeholder="Ej: 50"
                      min="0"
                      className="rounded-lg border-slate-300"
                      autoComplete="off"
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
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Unidad (Opcional)</Label>
                    <div className="relative">
                      <Input
                        id="unidad"
                        value={formData.unidad}
                        onChange={(e) => handleInputChange('unidad', e.target.value)}
                        type="number"
                        className="rounded-lg border-slate-300 pr-16"
                        autoComplete="off"
                      />
                    </div>
                  </div>      
                  <div className="space-y-2">
                    <Label htmlFor="unitMeasure" className="text-slate-700">Unidad de Medida</Label>
                    <Select value={formData.unidadMedida} onValueChange={(value) => handleInputChange('unidadMedida', value)}>
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
                      autoComplete="off"
                    />
                  </div>
                  
                      
                  <div className="space-y-2">
                    <Label htmlFor="colores" className="text-slate-700">Color</Label>
                    <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                      <SelectTrigger className="rounded-lg border-slate-300">
                        <SelectValue placeholder="Selecciona color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colores.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                </div>
                <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-slate-700">Descripción (Opcional)</Label>
                    <div className="relative">
                      <Input
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Ej: Impermeabilizante Acrílico"
                        className="rounded-lg border-slate-300 pr-16"
                        maxLength={100}
                        autoComplete="off"
                      />
                      <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none ${
                        formData.descripcion.length > 90 
                          ? 'text-red-500' 
                          : formData.descripcion.length > 50 
                            ? 'text-amber-500' 
                            : 'text-slate-400'
                      }`}>
                        {formData.descripcion.length}/100
                      </span>
                    </div>
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
        {/* Sección de imagen a la derecha */}
        <Card className="w-80 border-slate-200 rounded-lg h-fit">
          <CardHeader>
            <CardTitle className="text-slate-800">Imagen del Producto</CardTitle>
            <CardDescription className="text-slate-600">
              Agrega una imagen representativa (máximo 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <p className="text-slate-600 mb-2">Haz clic para seleccionar</p>
                  <p className="text-sm text-slate-500">PNG, JPG, GIF hasta 5MB</p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-48 object-cover rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 break-words">
                    {selectedImage?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}