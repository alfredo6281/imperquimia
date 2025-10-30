// src/pages/products/ProductForm.tsx
import React from "react";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import type { ProductPayload } from "../../types/product";

type Props = {
  initial?: Partial<ProductPayload>;
  onSubmit: (payload: ProductPayload) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
};

type Categoria = "Impermeabilizantes" | "Productos para Concreto" | "Pinturas" | "Selladores" | "Recubrimientos";
type Color = "Ninguno" | "Aluminio" | "Amarilla" | "Blanco" | "Blanco Oro" | "Café" | "Gris" | "Marfil" | "Negro" | "Paja" | "Rojo" | "Rosa" | "Transparente";
type Tipo = "Bolsa" | "Bote" | "Brocha" | "Cubeta" | "Galón" | "Juego" | "Rollo" | "Saco" | "Salchicha";

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
};

export default function ProductForm({ initial = {}, onSubmit, submitLabel = "Guardar", onCancel }: Props) {
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
  });

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
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 space-y-2">
        <div className="space-y-2">
          <Label>Id Producto</Label>
          <span className="font-medium text-slate-800">{form.idProducto}</span>
        </div>

        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input
            value={form.nombre}
            onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-4 gap-4 space-y-2">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={form.categoria}
            onValueChange={(v) => setForm(prev => ({ ...prev, categoria: v as Categoria }))}
          >
            <SelectTrigger className="rounded-lg border-slate-300">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Impermeabilizantes">Impermeabilizantes</SelectItem>
              <SelectItem value="Productos para Concreto">Productos para Concreto</SelectItem>
              <SelectItem value="Pinturas">Pinturas</SelectItem>
              <SelectItem value="Selladores">Selladores</SelectItem>
              <SelectItem value="Recubrimientos">Recubrimientos</SelectItem>
            </SelectContent>
          </Select>
        </div>


        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => setForm(prev => ({ ...prev, tipo: v as Tipo }))}
          >
            <SelectTrigger className="rounded-lg border-slate-300">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bolsa">Bolsa</SelectItem>
              <SelectItem value="Bote">Bote</SelectItem>
              <SelectItem value="Brocha">Brocha</SelectItem>
              <SelectItem value="Cubeta">Cubeta</SelectItem>
              <SelectItem value="Galón">Galón</SelectItem>
              <SelectItem value="Juego">Juego</SelectItem>
              <SelectItem value="Rollo">Rollo</SelectItem>
              <SelectItem value="Saco">Saco</SelectItem>
              <SelectItem value="Salchicha">Salchicha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Unidad</Label>
          <Input
            type="number"
            value={String(form.unidad)}
            onChange={e => setForm(prev => ({ ...prev, unidad: Number(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Unidad de Medida</Label>
          <Input
            value={form.unidadMedida}
            onChange={e => setForm(prev => ({ ...prev, unidadMedida: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-4 gap-4 space-y-2">
        <div className="space-y-2">
          <Label>Color</Label>
          <Select
            value={form.color}
            onValueChange={(v) => setForm(prev => ({ ...prev, color: v as Color }))}
          >
            <SelectTrigger className="rounded-lg border-slate-300">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ninguno">Ninguno</SelectItem>
              <SelectItem value="Aluminio">Aluminio</SelectItem>
              <SelectItem value="Amarilla">Amarilla</SelectItem>
              <SelectItem value="Blanco">Blanco</SelectItem>
              <SelectItem value="Blanco Oro">Blanco Oro</SelectItem>
              <SelectItem value="Café">Café</SelectItem>
              <SelectItem value="Gris">Gris</SelectItem>
              <SelectItem value="Marfil">Marfil</SelectItem>
              <SelectItem value="Negro">Negro</SelectItem>
              <SelectItem value="Negro">Paja</SelectItem>
              <SelectItem value="Negro">Rojo</SelectItem>
              <SelectItem value="Negro">Rosa</SelectItem>
              <SelectItem value="Negro">Transparente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Precio Unitario</Label>
          <Input
            type="number"
            value={String(form.precioUnitario)}
            onChange={e => setForm(prev => ({ ...prev, precioUnitario: Number(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Stock</Label>
          <Input
            type="number"
            value={String(form.stock)}
            onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Stock Mínimo</Label>
          <Input
            type="number"
            value={String(form.stockMinimo)}
            onChange={e => setForm(prev => ({ ...prev, stockMinimo: Number(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Descripción</Label>
        <Input
          value={form.descripcion}
          onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
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
  );
}
