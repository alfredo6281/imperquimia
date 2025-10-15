import { useState, useEffect } from "react";
import { Plus, Users, Search, Edit, Eye, Phone, Mail, MapPin, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import axios from "axios";
import { toast } from "sonner";

interface Customer {
  idCliente: string;
  nombre: string;
  type: string;
  contact: string;
  telefono: string;
  correo: string;
  domicilio: string;
  totalPurchases: number;
  lastPurchase: string;
}

interface CustomersManagementProps {
  onViewChange: (view: string) => void;
}

export function CustomersManagement({ onViewChange }: CustomersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<Customer | null>(null);
  const [newClientData, setNewClientData] = useState({
    nombre: "",
    tipo: "Personal" as string,
    contacto: "",
    telefono: "",
    correo: "",
    domicilio: "",
  });

  // Datos mock del inventario
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/cliente")
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener clientes:", err);
      });
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.idCliente.toLowerCase().includes(searchTerm.toLowerCase()) //||
    //product.idProducto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos para paginación
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset página actual cuando cambie el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDetailsOpen(true);
  };

  const handleEditDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFormData({ ...customer });
    setEditDetailsOpen(true);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      setCustomers(
        customers.map((c) =>
          c.idCliente === editFormData.idCliente ? editFormData : c,
        ),
      );
      toast.success("Cliente actualizado correctamente");
      setEditDetailsOpen(false);
      setEditFormData(null);
      setSelectedCustomer(null);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCustomer) {
      setCustomers(
        customers.filter((c) => c.idCliente !== selectedCustomer.idCliente),
        
      );
      try {
        const response = await fetch(`http://localhost:5000/api/cliente/${selectedCustomer.idCliente}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCliente: parseInt(selectedCustomer.idCliente, 10),
        }),
        });
        
        console.log("Respuesta del servidor:", response);
      }catch (error) {
        console.log("Error detallado:", error);
        toast.error("Hubo un problema al eliminar el cliente: ");
      }
      toast.success(
        `Cliente ${selectedCustomer.nombre} eliminado correctamente`,
      );
      setDeleteAlertOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleNewClientInputChange = (
    field: string,
    value: string,
  ) => {
    setNewClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateClient = async () => {
    if (!newClientData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!newClientData.telefono.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }

    const existingClient = customers.find(
      (client) =>
        client.nombre.toLowerCase() ===
        newClientData.nombre.trim().toLowerCase(),
    );
    if (existingClient) {
      toast.error("Ya existe un cliente con ese nombre");
      return;
    }
    try{
      //const newId = `CLI-${String(customers.length + 1).padStart(3, "0")}`;
      const newClient = await fetch("http://localhost:5000/api/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newClientData.nombre,
          contacto: newClientData.nombre,
          telefono: newClientData.telefono,
          correo: newClientData.correo,
          domicilio: newClientData.domicilio,
        }),
      });
      console.log("Respuesta del servidor:", newClient);
      
      toast.success("Cliente creado exitosamente");

      // Limpiar formulario y cerrar modal
      setNewClientData({
        nombre: "",
        tipo: "Personal",
        contacto: "",
        telefono: "",
        correo: "",
        domicilio: "",
      });
      
      setNewClientOpen(false);
      
    
    }catch (error) {
      console.error("Error detallado:", error);
      toast.error("Hubo un problema al guardar el producto: ");
    }
    
    
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Empresa":
        return "bg-blue-100 text-blue-800";
      case "Personal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">
              Gestión de Clientes
            </h2>
          </div>
        </div>
      </div>

      {/* Acciones principales y búsqueda */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Button
          onClick={() => setNewClientOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Exportando lista de clientes...")
          }
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <Users className="h-4 w-4 mr-2" />
          Exportar Lista
        </Button>
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, contacto o email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 rounded-lg border-slate-300"
          />
        </div>
      </div>

      {/* Tabla de clientes */}
      <Card className="border-slate-200 rounded-lg gap-1">
        <CardHeader>
          <CardTitle className="text-slate-800">
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Información</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.map((customer) => (
                <TableRow key={customer.idCliente}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-800">
                        {customer.nombre}
                      </div>
                      <div className="text-sm text-slate-500">
                        {customer.idCliente}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getTypeColor(customer.type)}
                    >
                      {customer.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {customer.contact}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        {customer.telefono}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Mail className="h-3 w-3" />
                        {customer.correo}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {customer.domicilio.substring(0, 25)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${/*customer.totalPurchases.toFixed(2)*/}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      customer.lastPurchase,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleViewDetails(customer)
                        }
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleEditDetails(customer)
                        }
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDeleteClick(customer)
                        }
                        className="border-red-300 text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Información de paginación y controles */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCustomers.length)} de {filteredCustomers.length} clientes
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Ver Detalles */}
      <Dialog
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Detalles del Cliente
            </DialogTitle>
            <DialogDescription>
              Información completa del cliente
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-700">
                  ID Cliente
                </Label>
                <p className="text-slate-900">
                  {selectedCustomer.idCliente}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Tipo de Cliente
                </Label>
                <Badge
                  className={getTypeColor(
                    selectedCustomer.type,
                  )}
                >
                  {selectedCustomer.type}
                </Badge>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-slate-700">
                  Nombre / Razón Social
                </Label>
                <p className="text-slate-900">
                  {selectedCustomer.nombre}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Persona de Contacto
                </Label>
                <p className="text-slate-900">
                  {selectedCustomer.contact}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Teléfono
                </Label>
                <div className="flex items-center gap-2 text-slate-900">
                  <Phone className="h-4 w-4 text-slate-500" />
                  {selectedCustomer.telefono}
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-slate-700">
                  Correo Electrónico
                </Label>
                <div className="flex items-center gap-2 text-slate-900">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {selectedCustomer.correo}
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-slate-700">
                  Dirección
                </Label>
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {selectedCustomer.domicilio}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Total de Compras
                </Label>
                <p className="text-green-600">
                  ${/*selectedCustomer.totalPurchases.toFixed(2)*/}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Última Compra
                </Label>
                <p className="text-slate-900">
                  {new Date(
                    selectedCustomer.lastPurchase,
                  ).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDetailsOpen(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Detalles */}
      <Dialog
        open={editDetailsOpen}
        onOpenChange={setEditDetailsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Modifica la información del cliente
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label
                  htmlFor="edit-name"
                  className="text-slate-700"
                >
                  Nombre / Razón Social
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.nombre}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nombre: e.target.value,
                    })
                  }
                  className="rounded-lg border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-type"
                  className="text-slate-700"
                >
                  Tipo de Cliente
                </Label>
                <select
                  id="edit-type"
                  value={editFormData.type}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                >
                  <option value="Empresa">Empresa</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-contact"
                  className="text-slate-700"
                >
                  Persona de Contacto
                </Label>
                <Input
                  id="edit-contact"
                  value={editFormData.contact}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contact: e.target.value,
                    })
                  }
                  className="rounded-lg border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-phone"
                  className="text-slate-700"
                >
                  Teléfono
                </Label>
                <Input
                  id="edit-phone"
                  value={editFormData.telefono}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      telefono: e.target.value,
                    })
                  }
                  className="rounded-lg border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-email"
                  className="text-slate-700"
                >
                  Correo Electrónico
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.telefono}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      telefono: e.target.value,
                    })
                  }
                  className="rounded-lg border-slate-300"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label
                  htmlFor="edit-address"
                  className="text-slate-700"
                >
                  Dirección
                </Label>
                <Input
                  id="edit-address"
                  value={editFormData.telefono}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      telefono: e.target.value,
                    })
                  }
                  className="rounded-lg border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-status"
                  className="text-slate-700"
                >
                  Estado
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDetailsOpen(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Crear Nuevo Cliente */}
      <Dialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Nuevo Cliente
            </DialogTitle>
            <DialogDescription>
              Completa la información para registrar un nuevo
              cliente
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label
                htmlFor="new-name"
                className="text-slate-700"
              >
                Nombre / Razón Social *
              </Label>
              <Input
                id="new-name"
                value={newClientData.nombre}
                onChange={(e) =>
                  handleNewClientInputChange(
                    "nombre",
                    e.target.value,
                  )
                }
                placeholder="Ej: Juan Pérez o Constructora ABC S.A."
                className="rounded-lg border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new-type"
                className="text-slate-700"
              >
                Tipo de Cliente *
              </Label>
              <select
                id="new-type"
                value={newClientData.tipo}
                onChange={(e) =>
                  handleNewClientInputChange(
                    "tipo",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
              >
                <option value="Personal">Personal</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new-contact"
                className="text-slate-700"
              >
                Persona de Contacto
              </Label>
              <Input
                id="new-contact"
                value={newClientData.contacto}
                onChange={(e) =>
                  handleNewClientInputChange(
                    "contacto",
                    e.target.value,
                  )
                }
                placeholder="Nombre del contacto"
                className="rounded-lg border-slate-300"
              />
              <p className="text-xs text-slate-500">
                Si está vacío, se usará el nombre del cliente
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new-phone"
                className="text-slate-700"
              >
                Teléfono *
              </Label>
              <Input
                id="new-phone"
                value={newClientData.telefono}
                onChange={(e) =>
                  handleNewClientInputChange(
                    "telefono",
                    e.target.value,
                  )
                }
                placeholder="+52 555-0123"
                className="rounded-lg border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new-email"
                className="text-slate-700"
              >
                Correo Electrónico
              </Label>
              <Input
                id="new-email"
                type="email"
                value={newClientData.correo}
                onChange={(e) =>
                  handleNewClientInputChange(
                    "correo",
                    e.target.value,
                  )
                }
                placeholder="cliente@email.com"
                className="rounded-lg border-slate-300"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label
                htmlFor="new-address"
                className="text-slate-700"
              >
                Dirección
              </Label>
              <Input
                id="new-address"
                value={newClientData.domicilio}
                onChange={(e) =>
                  handleNewClientInputChange(
                    "domicilio",
                    e.target.value,
                  )
                }
                placeholder="Calle, número, colonia, ciudad"
                className="rounded-lg border-slate-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewClientOpen(false);
                setNewClientData({
                  nombre: "",
                  tipo: "Personal",
                  contacto: "",
                  telefono: "",
                  correo: "",
                  domicilio: "",
                });
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateClient}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Confirmar Eliminación */}
      <AlertDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro de eliminar este cliente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará
              permanentemente el cliente{" "}
              <span className="font-semibold text-slate-900">
                {selectedCustomer?.nombre}
              </span>{" "}
              de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Eliminar Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}