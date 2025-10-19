// src/components/customers/CustomerForm.tsx
import React from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import type { CustomerPayload } from "../../types/customer";

type Props = {
  initial?: Partial<CustomerPayload>;
  onSubmit: (payload: CustomerPayload) => Promise<void> | void;
  submitLabel?: string;
};

// Estado local para el formulario — campos como strings (no null)
type FormState = {
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  domicilio: string;
  tipo: "Personal" | "Empresa";
};

export default function CustomerForm({ initial = {}, onSubmit, submitLabel = "Guardar" }: Props) {
  const [form, setForm] = React.useState<FormState>({
    nombre: initial.nombre ?? "",
    // usamos "" si initial.contacto es null/undefined — así evitamos pasar null al input
    contacto: (initial.contacto as string) ?? "",
    telefono: (initial.telefono as string) ?? "",
    correo: (initial.correo as string) ?? "",
    domicilio: (initial.domicilio as string) ?? "",
    tipo: (initial.tipo as "Personal" | "Empresa") ?? "Personal",
  });

  // Si cambia a Personal limpiamos campo contacto (localmente)
  React.useEffect(() => {
    if (form.tipo === "Personal" && form.contacto !== "") {
      setForm(prev => ({ ...prev, contacto: "" }));
    }
    // solo queremos disparar cuando cambie el tipo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construimos el payload con la forma que espera el backend / types
    const payload: CustomerPayload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || null,
      correo: form.correo.trim() || null,
      domicilio: form.domicilio.trim() || null,
      tipo: form.tipo,
      // si es Personal guardamos contacto como null en la BD
      contacto: form.tipo === "Personal" ? null : (form.contacto.trim() || null),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input
            value={form.nombre}
            onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>Tipo</Label>
          <Select
            value={form.tipo}
            onValueChange={(v: "Personal" | "Empresa") => setForm(prev => ({ ...prev, tipo: v }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Empresa">Empresa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Contacto</Label>
          <Input
            disabled={form.tipo === "Personal"}
            value={form.contacto}
            onChange={e => setForm(prev => ({ ...prev, contacto: e.target.value }))}
            placeholder={form.tipo === "Personal" ? "No aplica para Personal" : "Nombre del contacto"}
          />
        </div>

        <div>
          <Label>Teléfono</Label>
          <Input
            value={form.telefono}
            onChange={e => setForm(prev => ({ ...prev, telefono: e.target.value }))}
            placeholder="+52 55X XXXX XXX"
          />
        </div>

        <div>
          <Label>Correo</Label>
          <Input
            type="email"
            value={form.correo}
            onChange={e => setForm(prev => ({ ...prev, correo: e.target.value }))}
            placeholder="cliente@email.com"
          />
        </div>

        <div className="col-span-2">
          <Label>Dirección</Label>
          <Input
            value={form.domicilio}
            onChange={e => setForm(prev => ({ ...prev, domicilio: e.target.value }))}
            placeholder="Calle, número, colonia, ciudad"
          />
        </div>

        <div className="col-span-2 flex justify-end gap-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </div>
    </form>
  );
}
