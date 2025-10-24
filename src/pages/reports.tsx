import { ArrowLeft, Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, FileBarChart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ReportsProps {
  onViewChange: (view: string) => void;
}

export function Reports({ onViewChange }: ReportsProps) {
  // Datos mock para reportes
  const stockByCategory = [
    { name: 'Acrílico', stock: 43, value: 1980.57 },
    { name: 'Prefabricado', stock: 5, value: 627.50 },
    { name: 'Sellador', stock: 15, value: 491.25 },
    { name: 'Elastomérico', stock: 3, value: 206.70 },
    { name: 'Primer', stock: 18, value: 513.00 }
  ];

  const monthlyMovements = [
    { month: 'Ene', entradas: 45, salidas: 32 },
    { month: 'Feb', entradas: 52, salidas: 28 },
    { month: 'Mar', entradas: 38, salidas: 42 },
    { month: 'Abr', entradas: 61, salidas: 35 },
    { month: 'May', entradas: 49, salidas: 38 },
    { month: 'Jun', entradas: 55, salidas: 41 }
  ];

  const topProducts = [
    { name: 'Impermeabilizante Acrílico Premium', movements: 28, type: 'high' },
    { name: 'Sellador Poliuretano', movements: 22, type: 'medium' },
    { name: 'Primer Acrílico Base Agua', movements: 18, type: 'medium' },
    { name: 'Membrana Prefabricada APP', movements: 15, type: 'low' },
    { name: 'Impermeabilizante Elastomérico', movements: 12, type: 'low' }
  ];

  const recentMovements = [
    { date: '2024-01-15', product: 'Impermeabilizante Acrílico Premium', type: 'Entrada', quantity: 10, value: 459.90 },
    { date: '2024-01-14', product: 'Sellador Poliuretano', type: 'Salida', quantity: -5, value: -163.75 },
    { date: '2024-01-14', product: 'Primer Acrílico Base Agua', type: 'Entrada', quantity: 8, value: 228.00 },
    { date: '2024-01-13', product: 'Membrana Prefabricada APP', type: 'Salida', quantity: -2, value: -251.00 },
    { date: '2024-01-12', product: 'Impermeabilizante Elastomérico', type: 'Entrada', quantity: 6, value: 413.40 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const totalValue = stockByCategory.reduce((sum, item) => sum + item.value, 0);
  const totalStock = stockByCategory.reduce((sum, item) => sum + item.stock, 0);
  const totalEntries = monthlyMovements.reduce((sum, item) => sum + item.entradas, 0);
  const totalExits = monthlyMovements.reduce((sum, item) => sum + item.salidas, 0);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => onViewChange('inventory')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Inventario
        </Button>
        <div className="flex items-center gap-3">
          <FileBarChart className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-slate-800 text-2xl font-semibold">Reportes de Inventario</h2>
            <p className="text-slate-600">Análisis y estadísticas del sistema</p>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-slate-600">inventario completo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Unidades</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalStock}</div>
            <p className="text-xs text-slate-600">productos en stock</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Entradas (6M)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEntries}</div>
            <p className="text-xs text-slate-600">últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Salidas (6M)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExits}</div>
            <p className="text-xs text-slate-600">últimos 6 meses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de stock por categoría */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Stock por Categoría</CardTitle>
                <CardDescription className="text-slate-600">
                  Distribución actual del inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockByCategory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis dataKey="name" className="text-slate-600" />
                    <YAxis className="text-slate-600" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de valor por categoría */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Valor por Categoría</CardTitle>
                <CardDescription className="text-slate-600">
                  Distribución del valor del inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stockByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Valor']}
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Movimientos Mensuales</CardTitle>
              <CardDescription className="text-slate-600">
                Entradas vs Salidas de los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyMovements}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="month" className="text-slate-600" />
                  <YAxis className="text-slate-600" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entradas" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    name="Entradas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="salidas" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                    name="Salidas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Productos con Mayor Movimiento</CardTitle>
              <CardDescription className="text-slate-600">
                Ranking de productos por actividad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-700">Producto</TableHead>
                    <TableHead className="text-slate-700">Movimientos</TableHead>
                    <TableHead className="text-slate-700">Actividad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-800">{product.name}</TableCell>
                      <TableCell className="text-slate-800">{product.movements}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            product.type === 'high' ? 'default' : 
                            product.type === 'medium' ? 'secondary' : 'outline'
                          }
                          className={
                            product.type === 'high' ? 'bg-green-100 text-green-800' :
                            product.type === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-slate-100 text-slate-800'
                          }
                        >
                          {product.type === 'high' ? 'Alta' : 
                           product.type === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Historial Reciente</CardTitle>
              <CardDescription className="text-slate-600">
                Últimos movimientos de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-700">Fecha</TableHead>
                    <TableHead className="text-slate-700">Producto</TableHead>
                    <TableHead className="text-slate-700">Tipo</TableHead>
                    <TableHead className="text-slate-700">Cantidad</TableHead>
                    <TableHead className="text-slate-700">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement, index) => (
                    <TableRow key={index} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="text-slate-800">{movement.date}</TableCell>
                      <TableCell className="font-medium text-slate-800">{movement.product}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={movement.type === 'Entrada' ? 'secondary' : 'outline'}
                          className={movement.type === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </TableCell>
                      <TableCell className={`font-medium ${movement.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(movement.value).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}