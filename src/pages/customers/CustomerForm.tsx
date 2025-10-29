// src/pages/customers/CustomerForm.tsx
import React from "react";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import type { CustomerPayload } from "../../types/customer";

type Props = {
  initial?: Partial<CustomerPayload>;
  onSubmit: (payload: CustomerPayload) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void; // <-- añadido
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

export default function CustomerForm({ initial = {}, onSubmit, submitLabel = "Guardar", onCancel }: Props) {
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
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">

        <Label>Nombre</Label>
        <Input
          value={form.nombre}
          onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={form.tipo} onValueChange={(v: "Personal" | "Empresa") => setForm(prev => ({ ...prev, tipo: v }))}>
          <SelectTrigger className="rounded-lg border-slate-300">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Empresa">Empresa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Persona de Contacto</Label>
        <Input
          disabled={form.tipo === "Personal"}
          value={form.contacto}
          onChange={e => setForm(prev => ({ ...prev, contacto: e.target.value }))}
          placeholder={form.tipo === "Personal" ? "No aplica para Personal" : "Nombre del contacto"}
        />
        <p className="text-xs text-slate-500">Si es personal, se guarda como NULL</p>
      </div>

      <div className="space-y-2">
        <Label>Teléfono</Label>
        <Input
          value={form.telefono}
          onChange={e => {
            // quitamos todo lo que no sea dígito y limitamos a 10 dígitos
            const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
            setForm(prev => ({ ...prev, telefono: onlyDigits }));
          }}
          placeholder="66X XXXX XXX"
          type="text"                 // usa tel o text
          inputMode="numeric"        // sugiere teclado numérico en móviles
          maxLength={10}
        />
      </div>

      <div className="space-y-2">
        <Label>Correo</Label>
        <Input
          type="email"
          value={form.correo}
          onChange={e => setForm(prev => ({ ...prev, correo: e.target.value }))}
          placeholder="cliente@email.com"
        />
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Dirección</Label>
        <Input
          value={form.domicilio}
          onChange={e => setForm(prev => ({ ...prev, domicilio: e.target.value }))}
          placeholder="Calle, número, colonia, ciudad"
        />
      </div>

      <div className="col-span-2 flex justify-end gap-2">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault(); // evitar submit accidental
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
