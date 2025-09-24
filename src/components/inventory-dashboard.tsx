import { useState } from "react";
import { Plus, Package, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
}

interface InventoryDashboardProps {
  onViewChange: (view: string) => void;
}

export function InventoryDashboard({ onViewChange }: InventoryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos mock del inventario
  const products: Product[] = [
    {
      id: "1",
      name: "Impermeabilizante Acrílico Premium",
      category: "Acrílico",
      currentStock: 25,
      minStock: 10,
      unitPrice: 45.99,
      supplier: "Distribuidora ABC"
    },
    {
      id: "2",
      name: "Membrana Prefabricada APP",
      category: "Prefabricado",
      currentStock: 5,
      minStock: 8,
      unitPrice: 125.50,
      supplier: "Impertech S.A."
    },
    {
      id: "3",
      name: "Sellador Poliuretano",
      category: "Sellador",
      currentStock: 15,
      minStock: 12,
      unitPrice: 32.75,
      supplier: "QuímicosXYZ"
    },
    {
      id: "4",
      name: "Impermeabilizante Elastomérico",
      category: "Elastomérico",
      currentStock: 3,
      minStock: 6,
      unitPrice: 68.90,
      supplier: "Distribuidora ABC"
    },
    {
      id: "5",
      name: "Primer Acrílico Base Agua",
      category: "Primer",
      currentStock: 18,
      minStock: 10,
      unitPrice: 28.50,
      supplier: "Materiales DEF"
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.currentStock <= product.minStock);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.unitPrice), 0);

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= minStock) {
      return <Badge variant="destructive">Stock Bajo</Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-slate-800 text-2xl font-semibold mb-2">Dashboard de Inventario</h2>
        <p className="text-slate-600">Gestión de productos</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalProducts}</div>
            <p className="text-xs text-slate-600">productos en inventario</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Valor Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-slate-600">valor del inventario</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-80 rounded-lg border-slate-300"
        />
      </div>

      {/* Tabla de productos */}
      <Card className="border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Productos en Inventario</CardTitle>
          <CardDescription className="text-slate-600">
            Lista completa de productos impermeabilizantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Nombre del Producto</TableHead>
                <TableHead className="text-slate-700">Categoría</TableHead>
                <TableHead className="text-slate-700">Stock Actual</TableHead>
                <TableHead className="text-slate-700">Stock Mínimo</TableHead>
                <TableHead className="text-slate-700">Precio Unitario</TableHead>
                <TableHead className="text-slate-700">Proveedor</TableHead>
                <TableHead className="text-slate-700">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-800">{product.name}</TableCell>
                  <TableCell className="text-slate-600">{product.category}</TableCell>
                  <TableCell className={`font-medium ${product.currentStock <= product.minStock ? 'text-red-600' : 'text-slate-800'}`}>
                    {product.currentStock}
                  </TableCell>
                  <TableCell className="text-slate-600">{product.minStock}</TableCell>
                  <TableCell className="text-slate-800">${product.unitPrice}</TableCell>
                  <TableCell className="text-slate-600">{product.supplier}</TableCell>
                  <TableCell>{getStockStatus(product.currentStock, product.minStock)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}