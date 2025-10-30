import { useState, useEffect } from "react";
import { ArrowLeft, Save, Edit3, Package, Upload, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import type { ProductPayload } from "../../types/product";
import React from "react";
import { CATEGORIES, type Categoria, COLOR, type Color, TYPE, type Tipo, UNIDADMEDIDA, type unidadMedida } from "../../types/product";
import axios from "axios";
type Props = {
  initial?: Partial<ProductPayload>;
  onSubmit: (payload: ProductPayload) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
};

//type Categoria = "Impermeabilizantes" | "Productos para Concreto" | "Pinturas" | "Selladores" | "Recubrimientos";
//type Color = "Ninguno" | "Aluminio" | "Amarilla" | "Blanco" | "Blanco Oro" | "Café" | "Gris" | "Marfil" | "Negro" | "Paja" | "Rojo" | "Rosa" | "Transparente";
//type Tipo = "Bolsa" | "Bote" | "Brocha" | "Cubeta" | "Galón" | "Juego" | "Rollo" | "Saco" | "Salchicha";
type FormState = {
  idProducto: number;
  nombre: string;
  precioUnitario: number;
  stock: number;
  stockMinimo: number;
  unidad: number;
  unidadMedida: string;
  color: Color;
  categoria: Categoria; // NO nullable aquí
  descripcion: string;
  tipo: Tipo;
  URLImagen: string;
};

export default function EditProduct({ initial = {}, onSubmit, submitLabel = "Guardar", onCancel }: Props) {
  const [form, setForm] = React.useState<FormState>({
    idProducto: initial.idProducto ?? 0,
    nombre: (initial.nombre as string) ?? "",
    precioUnitario: initial.precioUnitario ?? 0,
    stock: initial.stock ?? 0,
    stockMinimo: initial.stockMinimo ?? 0,
    unidad: initial.unidad ?? 0,
    unidadMedida: (initial.unidadMedida as string) ?? "",
    color: (initial.color as Color) ?? "",
    // Usa initial.categoria (no initial.tipo). Si no viene, pon un valor por defecto válido:
    categoria: (initial.categoria as Categoria) ?? "Impermeabilizantes",
    descripcion: (initial.descripcion as string) ?? "",
    tipo: (initial.tipo as Tipo) ?? "",
    URLImagen: (initial.URLImagen as Tipo) ?? "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // si initial tiene URLImagen, usarla como preview inicialmente
  useEffect(() => {
    if (initial?.URLImagen) {
      setImagePreview(initial.URLImagen as string);
      setForm(prev => ({ ...prev, URLImagen: initial.URLImagen as string }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.URLImagen]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación simple: asegurar que la categoría es válida
    const allowed: Categoria[] = ["Impermeabilizantes", "Productos para Concreto", "Pinturas", "Selladores", "Recubrimientos"];
    if (!allowed.includes(form.categoria)) {
      // puedes usar toast aquí si tienes, por ahora lanzamos error
      console.error("Categoría inválida:", form.categoria);
      return;
    }

    const payload: ProductPayload = {
      idProducto: form.idProducto,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      tipo: form.tipo,
      unidad: form.unidad,
      unidadMedida: form.unidadMedida,
      color: form.color,
      precioUnitario: form.precioUnitario,
      stock: form.stock,
      stockMinimo: form.stockMinimo,
      descripcion: form.descripcion.trim(),
      URLImagen: form.URLImagen
    };

    await onSubmit(payload);
  };


  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    setSelectedImage(file);

    // preview local inmediato (object URL para rapidez)
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // Subir inmediatamente al servidor (si idProducto está disponible)
    if (!form.idProducto || form.idProducto === 0) {
      toast.error("Guarda el producto antes de subir la imagen (falta idProducto)");
      return;
    }

    const formData = new FormData();
    formData.append("idProducto", String(form.idProducto));
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await axios.post("/api/producto/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      if (data?.success && data.URLImagen) {
        // actualizar URLImagen con la que devuelve el servidor (añadimos timestamp para evitar cache)
        const newUrl = `${data.URLImagen}?t=${Date.now()}`;
        setForm(prev => ({ ...prev, URLImagen: newUrl }));
        setImagePreview(newUrl);
        toast.success("Imagen subida y actualizada correctamente");
      } else {
        toast.error("Error al subir la imagen");
        console.error("Upload response:", data);
      }
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
      // liberar object URL si lo usamos (si hicimos URL.createObjectURL)
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    }
  };


  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setForm(prev => ({ ...prev, URLImagen: "" }));
    toast.success("Vista previa eliminada");
  };
  return (
    <div className="">
      {/*<div className="flex-1 p-6">*/}
      <div className="max-w-7xl ">
        {/* Formulario de edición */}

        <div className="flex gap-8 space-y-2">
          <Card className="flex-1 border-slate-200 rounded-lg ">
            <CardHeader>
              <CardTitle className="text-slate-800">Codigo: {form.idProducto}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-2">

                <div className="grid   space-y-2">
                  <Label htmlFor="name" className="text-slate-700 space-y-2">Nombre del Producto</Label>
                  <Input
                    id="name"
                    value={form.nombre}
                    onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Impermeabilizante Acrílico Premium"
                    className="rounded-lg border-slate-300 "
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-700">Categoría</Label>
                    <Select value={form.categoria}
                      onValueChange={(v) => {
                        // opción segura: comprobar antes de setear
                        if ((CATEGORIES as readonly string[]).includes(v)) {
                          setForm(prev => ({ ...prev, categoria: v as Categoria }));
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg border-slate-300">
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>

                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 grid grid-cols-1 md:grid-cols-2">
                    <Label htmlFor="minStock" className="text-slate-700">Unidad</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={form.unidad}
                      onChange={e => setForm(prev => ({ ...prev, unidad: Number(e.target.value) }))}
                      placeholder="Ej: 10"
                      min="0"
                      className="rounded-lg border-slate-300"
                    />


                    <Label htmlFor="unitMeasure" className="text-slate-700">Unidad de Medida</Label>
                    <Select value={form.unidadMedida}
                      onValueChange={(v) => {
                        // opción segura: comprobar antes de setear
                        if ((UNIDADMEDIDA as readonly string[]).includes(v)) {
                          setForm(prev => ({ ...prev, unidadMedida: v as unidadMedida }));
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg border-slate-300">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADMEDIDA.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitMeasure" className="text-slate-700 ">Tipo</Label>
                    <Select value={form.tipo}
                      onValueChange={(v) => {
                        // opción segura: comprobar antes de setear
                        if ((TYPE as readonly string[]).includes(v)) {
                          setForm(prev => ({ ...prev, tipo: v as Tipo }));
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg border-slate-300 ">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE.map((tip) => (
                          <SelectItem key={tip} value={tip}>
                            {tip}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitMeasure" className="text-slate-700 ">Color</Label>
                    <Select value={form.color}
                      onValueChange={(v) => {
                        // opción segura: comprobar antes de setear
                        if ((COLOR as readonly string[]).includes(v)) {
                          setForm(prev => ({ ...prev, color: v as Color }));
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg border-slate-300">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock" className="text-slate-700">Stock Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={form.stockMinimo}
                      onChange={e => setForm(prev => ({ ...prev, stockMinimo: Number(e.target.value) }))}
                      placeholder="Ej: 10"
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
                      value={form.precioUnitario}
                      onChange={e => setForm(prev => ({ ...prev, precioUnitario: Number(e.target.value) }))}
                      placeholder="Ej: 45.99"
                      min="0"
                      className="rounded-lg border-slate-300"
                    />
                  </div>


                </div>
                <div className="grid space-y-2">
                  <Label htmlFor="descripcion" className="text-slate-700">Descripción</Label>
                  <Input
                    id="descripcion"
                    type="descripcion"
                    value={form.descripcion}
                    onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder=""
                    min="0"
                    className="rounded-lg border-slate-300 grid-cols-2"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 ">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" type="submit">{submitLabel}</Button>
                  {onCancel && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        onCancel();
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sección de imagen a la derecha */}
          <Card className="w-80 border-slate-200 rounded-lg h-fit">
            <CardHeader>
              <CardTitle className="text-slate-800">Imagen del Producto</CardTitle>
              <CardDescription className="text-slate-600">
                Actualiza la imagen representativa (máximo 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    //onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Haz clic para seleccionar</p>
                    <p className="text-xs text-slate-500">PNG, JPG hasta 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full aspect-square object-cover rounded-lg border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar Imagen
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}