// src/pages/CustomersManagement.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Users, Search, Edit, Eye, Phone, Mail, MapPin, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import axios from "axios";
import { toast } from "sonner";
import PaginationControls from "../common/paginationControls";

/* ---------------------- Types ---------------------- */
type Customer = {
  idCliente: number;
  nombre: string;
  contacto: string | null;
  domicilio?: string | null;
  telefono?: string | null;
  correo?: string | null;
  tipo?: "Personal" | "Empresa" | string;
  lastPurchase?: string | null;
  totalPurchases?: number;
};

type ClientPayload = {
  nombre: string;
  contacto: string | null;
  domicilio?: string;
  telefono?: string;
  correo?: string;
  tipo: string;
};

/* ---------------------- Hook useClients ----------------------
   Maneja fetch / create / update / delete y mantiene estado local.
   Reutilizable (puedes mover a hooks/useClients.ts más adelante)
------------------------------------------------------------ */
function useClients(apiBase = "/api/cliente") {
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiBase);
      setClients(res.data ?? []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = useCallback(
    async (payload: ClientPayload) => {
      const res = await axios.post(apiBase, payload);
      // Refetch para consistencia con backend
      await fetchAll();
      return res.data;
    },
    [apiBase, fetchAll],
  );

  const update = useCallback(
    async (id: number, payload: Partial<ClientPayload>) => {
      const res = await axios.put(`${apiBase}/${id}`, payload);
      await fetchAll();
      return res.data;
    },
    [apiBase, fetchAll],
  );

  const remove = useCallback(
    async (id: number) => {
      const res = await axios.delete(`${apiBase}/${id}`);
      // actualizamos UI inmediatamente
      setClients((prev) => prev.filter((c) => c.idCliente !== id));
      return res.data;
    },
    [apiBase],
  );

  return { clients, setClients, loading, error, fetchAll, create, update, remove };
}

/* ---------------------- Small UI Helpers ---------------------- */
const getTypeColor = (type: string | undefined) => {
  switch (type) {
    case "Empresa":
      return "bg-blue-100 text-blue-800";
    case "Personal":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/* ---------------------- Reusable Modal & Confirm Dialog ---------------------- */
function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "max-w-2xl",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={size}>
        <DialogHeader>
          {title && <DialogTitle className="text-slate-800">{title}</DialogTitle>}
          <DialogDescription />
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancelar</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------------- CustomerForm (reusable) ---------------------- */
function CustomerForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
}: {
  initial?: Partial<Customer>;
  onSubmit: (payload: ClientPayload) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [tipo, setTipo] = useState<string>(initial?.tipo ?? "Personal");
  const [contacto, setContacto] = useState(initial?.contacto ?? "");
  const [telefono, setTelefono] = useState(initial?.telefono ?? "");
  const [correo, setCorreo] = useState(initial?.correo ?? "");
  const [domicilio, setDomicilio] = useState(initial?.domicilio ?? "");

  useEffect(() => {
    // sincronizar si cambian initial (útil en editar)
    setNombre(initial?.nombre ?? "");
    setTipo(initial?.tipo ?? "Personal");
    setContacto(initial?.contacto ?? "");
    setTelefono(initial?.telefono ?? "");
    setCorreo(initial?.correo ?? "");
    setDomicilio(initial?.domicilio ?? "");
  }, [initial]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload: ClientPayload = {
      nombre: nombre.trim(),
      contacto: tipo === "Personal" ? null : (contacto ? contacto.trim() : null),
      telefono: telefono ? telefono.trim() : undefined,
      correo: correo ? correo.trim() : undefined,
      domicilio: domicilio ? domicilio.trim() : undefined,
      tipo,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">
        <Label>Nombre / Razón Social *</Label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v)}>
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
          value={contacto ?? ""}
          onChange={(e) => setContacto(e.target.value)}
          disabled={tipo === "Personal"}
        />
        <p className="text-xs text-slate-500">Si es Personal, se guarda contacto como null.</p>
      </div>

      <div className="space-y-2">
        <Label>Teléfono *</Label>
        <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Correo</Label>
        <Input value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Dirección</Label>
        <Input value={domicilio} onChange={(e) => setDomicilio(e.target.value)} />
      </div>

      <div className="col-span-2 flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/* ---------------------- CustomersManagement component ---------------------- */
export function CustomersManagement({ onViewChange }: { onViewChange?: (v: string) => void }) {
  const { clients, loading, create, update, remove } = useClients("/api/cliente");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // modales
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const [selected, setSelected] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // reset page if search changes
    setCurrentPage(1);
  }, [searchTerm]);

  // filtrado seguro
  const q = searchTerm.trim().toLowerCase();

  // Normalizar a un arreglo seguro antes de filtrar
  const clientsList: Customer[] = Array.isArray(clients)
    ? clients
    : Array.isArray((clients as any)?.data)
    ? (clients as any).data
    : Array.isArray((clients as any)?.recordset)
    ? (clients as any).recordset
    : [];

  const filtered = clientsList.filter((c) => {
    const nombre = String(c.nombre ?? "").toLowerCase();
    const id = String(c.idCliente ?? "").toLowerCase();
    const contacto = String(c.contacto ?? "").toLowerCase();
    const correo = String(c.correo ?? "").toLowerCase();
    return nombre.includes(q) || id.includes(q) || contacto.includes(q) || correo.includes(q);
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  /* Handlers */
  const handleOpenView = (c: Customer) => {
    setSelected(c);
    setViewDetailsOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditCustomer(c);
    setEditDetailsOpen(true);
  };

  const handleSaveEdit = async (payload?: ClientPayload) => {
    if (!editCustomer) return;
    try {
      const body = payload ?? {
        nombre: editCustomer.nombre,
        contacto: editCustomer.tipo === "Personal" ? null : editCustomer.contacto,
        telefono: editCustomer.telefono ?? undefined,
        correo: editCustomer.correo ?? undefined,
        domicilio: editCustomer.domicilio ?? undefined,
        tipo: editCustomer.tipo ?? "Personal",
      };
      await update(editCustomer.idCliente, body);
      toast.success("Cliente actualizado correctamente");
      setEditDetailsOpen(false);
      setEditCustomer(null);
    } catch (err) {
      console.error("Error al actualizar:", err);
      toast.error("No se pudo actualizar el cliente");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    try {
      await remove(selected.idCliente);
      toast.success(`Cliente ${selected.nombre} eliminado correctamente`);
      setDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      toast.error("No se pudo eliminar el cliente");
    }
  };

  const handleCreate = async (payload: ClientPayload) => {
    if (!payload.nombre?.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    try {
      await create(payload);
      toast.success("Cliente creado exitosamente");
      setNewOpen(false);
      // fetchAll already called inside create; update current page to last
      const newTotal = (await axios.get("/api/cliente")).data.length;
      setCurrentPage(Math.max(1, Math.ceil(newTotal / itemsPerPage)));
    } catch (err) {
      console.error("Error creando cliente:", err);
      toast.error("Error al crear cliente");
    }
  };

  /* Render */
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">Gestión de Clientes</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Button onClick={() => setNewOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Cliente
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            toast.success("Exportando lista de clientes...");
          }}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <Users className="h-4 w-4 mr-2" /> Exportar Lista
        </Button>

        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, contacto o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg border-slate-300"
          />
        </div>
      </div>

      <Card className="border-slate-200 rounded-lg gap-1">
        <CardHeader>
          <CardTitle className="text-slate-800">Lista de Clientes</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Información</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5}>Cargando...</TableCell>
                </TableRow>
              )}

              {!loading && pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No hay clientes.</TableCell>
                </TableRow>
              )}

              {pageItems.map((c) => (
                <TableRow key={c.idCliente}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-800">{c.nombre}</div>
                      <div className="text-sm text-slate-500">{c.idCliente}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getTypeColor(c.tipo)}>{c.tipo}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{c.contacto ?? "-"}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" /> {c.telefono ?? "-"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Mail className="h-3 w-3" /> {c.correo ?? "-"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {(c.domicilio ?? "-").length > 25 ? `${(c.domicilio ?? "").substring(0, 25)}...` : c.domicilio ?? "-"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenView(c)} className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(c)} className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelected(c); setDeleteOpen(true); }} className="border-red-300 text-red-700 hover:bg-red-50 rounded">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length > 0 && (
            <PaginationControls
              totalItems={filtered.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              maxButtons={5}
            />
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
        title="Detalles del Cliente"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg">
              Cerrar
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID Cliente</Label>
              <div className="text-slate-900">{selected.idCliente}</div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Badge className={getTypeColor(selected.tipo)}>{selected.tipo}</Badge>
            </div>

            <div className="col-span-2">
              <Label>Nombre / Razón Social</Label>
              <div className="text-slate-900">{selected.nombre}</div>
            </div>

            <div>
              <Label>Persona de Contacto</Label>
              <div className="text-slate-900">{selected.contacto ?? "-"}</div>
            </div>

            <div>
              <Label>Teléfono</Label>
              <div className="text-slate-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" /> {selected.telefono ?? "-"}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Correo</Label>
              <div className="text-slate-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" /> {selected.correo ?? "-"}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Dirección</Label>
              <div className="text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" /> {selected.domicilio ?? "-"}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editDetailsOpen}
        onOpenChange={(v) => {
          if (!v) {
            setEditDetailsOpen(false);
            setEditCustomer(null);
          }
        }}
        title="Editar Cliente"
        size="max-w-2xl"
      >
        {editCustomer && (
          <CustomerForm
            initial={editCustomer}
            onCancel={() => {
              setEditDetailsOpen(false);
              setEditCustomer(null);
            }}
            onSubmit={async (payload) => {
              await handleSaveEdit(payload);
            }}
            submitLabel="Guardar Cambios"
          />
        )}
      </Modal>

      {/* New Modal */}
      <Modal
        open={newOpen}
        onOpenChange={setNewOpen}
        title="Nuevo Cliente"
        size="max-w-2xl"
      >
        <CustomerForm
          onCancel={() => setNewOpen(false)}
          onSubmit={async (payload) => {
            await handleCreate(payload);
          }}
          submitLabel="Crear Cliente"
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar cliente"
        description={`¿Está seguro de eliminar a ${selected?.nombre ?? "este cliente"}? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          await handleDeleteConfirm();
        }}
      />
    </div>
  );
}

export default CustomersManagement;
