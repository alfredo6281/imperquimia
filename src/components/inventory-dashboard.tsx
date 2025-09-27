import { useState, useRef, useEffect } from "react";
import { Plus, Package, TrendingDown, Eye, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import axios from "axios";

interface Product {
  idProducto: number;
  nombre: string;
  PrecioUnitario: number;
  Stock: number;
  stockMinimo: number;
  idUnidadMedida: number;
  idProveedor: number;
  idCategoria: number;
  URLImagen: string;
}
const Categoria=['Acrilico','Prefabricado', 'Elastomerico', 'Sellador', 'Primer', 'Fibrado','Cemento'];
interface InventoryDashboardProps {
  onViewChange: (view: string) => void;
}

export function InventoryDashboard({ onViewChange }: InventoryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Datos mock del inventario
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
  axios.get("http://localhost:5000/producto")
    .then((res) => {
      setProducts(res.data);
    })
    .catch((err) => {
      console.error("Error al obtener productos:", err);
    });
}, []);

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) 
    //||
    //product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //product.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos para paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset página actual cuando cambie el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const lowStockProducts = products.filter(product => product.Stock <= product.stockMinimo);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.Stock * product.PrecioUnitario), 0);

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

  const handleEditImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedProduct) {
      const imageUrl = URL.createObjectURL(file);
      // En un sistema real, aquí subirías la imagen al servidor
      // Por ahora, solo actualizamos la URL localmente
      setSelectedProduct({
        ...selectedProduct,
        imageUrl: imageUrl
      });
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
            onClick={() => onViewChange('add-product')} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onViewChange('entries')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Registrar Entrada
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onViewChange('exits')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Registrar Salida
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
      <Card className="border-slate-200 rounded-lg h-[50px]">
        <CardHeader>
          <CardTitle className="text-slate-800 font-bold">Productos en Inventario</CardTitle>
          <CardDescription className="text-slate-600">
            Lista completa de productos impermeabilizantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-700 font-bold table-color">Nombre del Producto</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Categoría</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Stock Actual</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Stock Mínimo</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Precio Unitario</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Proveedor</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Estado</TableHead>
                  <TableHead className="text-slate-700 font-bold table-color">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => (
                  <TableRow key={product.idProducto} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-800">{product.nombre}</TableCell>
                    <TableCell className="text-slate-600">{product.idCategoria}</TableCell>
                    <TableCell className={`font-medium ${product.Stock <= product.stockMinimo ? 'text-red-600' : 'text-slate-800'}`}>
                      {product.Stock}
                    </TableCell>
                    <TableCell className="text-slate-600">{product.stockMinimo}</TableCell>
                    <TableCell className="text-slate-800">${product.PrecioUnitario}</TableCell>
                    <TableCell className="text-slate-600">{product.idProveedor}</TableCell>
                    <TableCell>{getStockStatus(product.Stock, product.stockMinimo)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {/* Información de paginación y controles */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
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

      {/* Modal de visualización de producto */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto anchura_ventana">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl">Detalles del Producto</DialogTitle>
            <DialogDescription className="text-slate-600">
              Información completa y especificaciones técnicas del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Imagen del producto */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <ImageWithFallback
                    //src={selectedProduct.URLImagen}
                    src="./src/img/Productos/Prueba.webp"
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
                    className="hidden"
                  />
                </div>
                
                {/* Información básica visual */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-slate-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-slate-800">{selectedProduct.Stock}</div>
                      <p className="text-sm text-slate-600">Stock Actual</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">${selectedProduct.PrecioUnitario}</div>
                      <p className="text-sm text-slate-600">Precio Unitario</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Detalles del producto */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{selectedProduct.nombre}</h3>
                  <Badge variant="secondary" className="mb-4">{selectedProduct.idCategoria}</Badge>
                  <p className="text-slate-600 leading-relaxed">
                    {/*selectedProduct.description*/}
                  </p>
                </div>

                {/* Especificaciones técnicas */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Especificaciones Técnicas</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">SKU:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.PrecioUnitario}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Peso:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.PrecioUnitario} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Dimensiones:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.Stock}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Proveedor:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.idProveedor}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Fecha de ingreso:</span>
                      <span className="font-medium text-slate-800">{selectedProduct.URLImagen}</span>
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
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Valor total en stock:</span>
                      <span className="font-medium text-green-600">
                        ${(selectedProduct.Stock * selectedProduct.PrecioUnitario).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Estado:</span>
                      {getStockStatus(selectedProduct.Stock, selectedProduct.stockMinimo)}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      onViewChange('entries');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Registrar Entrada
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      onViewChange('exits');
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