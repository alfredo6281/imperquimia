// src/pages/products/InventoryDashboard.tsx
import { useCallback, useState, useRef, useEffect } from "react";
import { Plus, Package, TrendingDown, Eye, Edit, History, Pencil, MapPin } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import PaginationControls from "../../components/common/paginationControls";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import axios from "axios";
import { toast } from "sonner";

import ProductForm from "./ProductForm";
import type { Product, ProductPayload } from "../../types/product";

interface InventoryDashboardProps {
  onViewChange: (view: string) => void;
}

/* ---------------------- Hook useProducts ----------------------
   Maneja fetch / create / update / delete y mantiene estado local.
------------------------------------------------------------ */
function useProducts(apiBase = "/api/producto") {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiBase);
      setProducts(res.data ?? []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = useCallback(
    async (payload: ProductPayload) => {
      const res = await axios.post(apiBase, payload);
      await fetchAll();
      return res.data;
    },
    [apiBase, fetchAll],
  );

  const update = useCallback(
    async (id: number, payload: Partial<ProductPayload>) => {
      // tu ruta es PUT /producto/editar/:id
      const res = await axios.put(`${apiBase}/editar/${id}`, payload);
      await fetchAll();
      return res.data;
    },
    [apiBase, fetchAll],
  );

  const remove = useCallback(
    async (id: number) => {
      const res = await axios.delete(`${apiBase}/${id}`);
      await fetchAll();
      return res.data;
    },
    [apiBase, fetchAll],
  );

  return { products, setProducts, loading, error, fetchAll, create, update, remove };
}

/* ---------------------- Modal component ---------------------- */
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

/* ---------------------- InventoryDashboard ---------------------- */
export function InventoryDashboard({ onViewChange }: InventoryDashboardProps) {
  const apiBase = "/api/producto";
  const { products, setProducts, loading, fetchAll, update } = useProducts(apiBase);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MODALES
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Filtrado
  const filteredProducts = products.filter((product) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(product.idProducto).toLowerCase().includes(q) ||
      (product.nombre ?? "").toLowerCase().includes(q) ||
      (product.categoria ?? "").toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const lowStockProducts = products.filter((product) => product.stock <= product.stockMinimo);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.precioUnitario), 0);

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= minStock) {
      return <Badge variant="destructive">Stock Bajo</Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (c: Product) => {
    setEditProduct(c);
    setEditDetailsOpen(true);
  };

  const handleEditImage = () => {
    fileInputRef.current?.click();
  };

  const handleSaveEdit = async (payload?: ProductPayload) => {
    if (!editProduct) return;
    try {
      const body = payload ?? {
        nombre: editProduct.nombre,
        categoria: editProduct.categoria,
        tipo: editProduct.tipo,
        unidad: editProduct.unidad,
        unidadMedida: editProduct.unidadMedida,
        color: editProduct.color,
        precioUnitario: editProduct.precioUnitario,
        stock: editProduct.stock,
        stockMinimo: editProduct.stockMinimo,
        descripcion: editProduct.descripcion,
      };
      await update(editProduct.idProducto, body);
      toast.success("Producto actualizado correctamente");
      setEditDetailsOpen(false);
      setEditProduct(null);
    } catch (err) {
      console.error("Error al actualizar:", err);
      toast.error("No se pudo actualizar el producto");
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedProduct) {
      const formData = new FormData();
      formData.append("idProducto", selectedProduct.idProducto.toString());
      formData.append("image", file);

      try {
        const response = await axios.post(`${apiBase}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const data = response.data;

        if (data.success) {
          const newUrl = `${data.URLImagen}?t=${Date.now()}`;
          toast.success("Imagen actualizada");
          setSelectedProduct((prev) => (prev ? { ...prev, URLImagen: newUrl } : prev));

          // actualizar lista en memoria
          setProducts((prev) =>
            prev.map((p) => (p.idProducto === selectedProduct.idProducto ? { ...p, URLImagen: newUrl } : p))
          );
        } else {
          toast.error("❌ Error al subir imagen");
          console.error("❌ Error al subir imagen:", data);
        }
      } catch (err) {
        toast.error("❌ Error en la petición");
        console.error("❌ Error en la petición:", err);
      } finally {
        // limpiar input para permitir volver a subir la misma imagen si se desea
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-2">
        <h2 className="text-slate-800 text-2xl font-semibold mb-2">Inventario</h2>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalProducts}</div>
            <p className="text-xs text-slate-600">productos en inventario</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">Valor Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-slate-600">valor del inventario</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">Alertas Stock</CardTitle>
            <div className="h-4 w-4 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-xs text-slate-600">productos con stock bajo</p>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex gap-2">
          <Button
            onClick={() => onViewChange("add-product")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewChange("entries")}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Registrar Entrada
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewChange("exits")}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Registrar Salida
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewChange("history")}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <History className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
        </div>
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="md:w-80 rounded-lg border-slate-300"
        />
      </div>

      {/* Tabla de productos */}
      <Card className="border-slate-200 rounded-lg h-[50px] gap-1">
        <CardHeader>
          <CardTitle className="text-slate-800 font-bold">Productos en Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-700 font-bold table-color">Código</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Nombre del Producto</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Presentación</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Categoría</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Stock Actual</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Stock Mínimo</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Estado</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => (
                  <TableRow key={product.idProducto} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-800">{product.idProducto}</TableCell>
                    <TableCell className="font-medium text-slate-800">{product.nombre}</TableCell>
                    <TableCell className="text-slate-600">{product.tipo} {product.unidad} {product.unidadMedida} </TableCell>
                    <TableCell className="text-slate-600">{product.categoria}</TableCell>
                    <TableCell className={`font-medium ${product.stock <= product.stockMinimo ? 'text-red-600' : 'text-slate-800'}`}>
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-slate-600">{product.stockMinimo}</TableCell>
                    <TableCell>{getStockStatus(product.stock, product.stockMinimo)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(product)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Información de paginación y controles */}
          {filteredProducts.length > 0 && (
            <PaginationControls
              totalItems={filteredProducts.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              maxButtons={4}
              labelPrefix="Mostrando"
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={editDetailsOpen}
        onOpenChange={(v) => {
          if (!v) {
            setEditDetailsOpen(false);
            setEditProduct(null);
          }
        }}
        title="Editar Producto"
        size="max-w-2xl"
      >
        {editProduct && (
          <ProductForm
            initial={editProduct as Partial<ProductPayload>}
            onCancel={() => {
              setEditDetailsOpen(false);
              setEditProduct(null);
            }}
            onSubmit={async (payload) => {
              await handleSaveEdit(payload);
            }}
            submitLabel="Guardar Cambios"
          />
        )}
      </Modal>

      {/* Modal de visualización de producto */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw]  overflow-y-auto anchura_ventana">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl">{selectedProduct?.nombre}</DialogTitle>
            <Badge variant="secondary" className="text-slate-600">{selectedProduct?.categoria}</Badge>
            <p className="text-slate-600 leading-relaxed">
              {selectedProduct?.descripcion}
            </p>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Imagen del producto */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <ImageWithFallback
                    src={selectedProduct.URLImagen?.trim() || "./src/img/no_image.webp"}
                    alt={selectedProduct.nombre}
                    className="w-full h-full object-cover"
                  />
                  {/* Botón de editar imagen */}
                  <button
                    onClick={handleEditImage}
                    className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105"
                    title="Editar imagen"
                  >
                    <Edit className="h-4 w-4 text-slate-600" />
                  </button>

                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className=""
                  />
                </div>

                {/* Información básica visual */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-slate-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-slate-800">{selectedProduct.stock}</div>
                      <p className="text-sm text-slate-600">Stock Actual</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">${selectedProduct.precioUnitario}</div>
                      <p className="text-sm text-slate-600">Precio Unitario</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Detalles del producto */}
              <div>
                <div />

                {/* Especificaciones técnicas */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Especificaciones Técnicas</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Codigo:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.idProducto}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Presentación:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.tipo} {selectedProduct.unidad} {selectedProduct.unidadMedida}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Color:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.color}</span>
                    </div>
                  </div>
                </div>

                {/* Información de stock */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Información de Stock</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Stock mínimo:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.stockMinimo} unidades</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Estado:</span>
                      {getStockStatus(selectedProduct.stock, selectedProduct.stockMinimo)}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      onViewChange("entries");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Registrar Entrada
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      onViewChange("exits");
                    }}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Registrar Salida
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryDashboard;
