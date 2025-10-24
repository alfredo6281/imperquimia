export interface Product {
  idProducto: number;
  nombre: string;
  categoria: "Impermeabilizante" | "Productos para Concreto" | "Pinturas" | "Selladores" | "Recubrimientos";
  tipo: string | null;
  unidad: string | null;
  unidadMedida: string | null;
  color: string | null;
  precioUnitario: number | null;
  stock: number | null;
  stockMinimo?: number | null;
  descripcion?: string | null;
  URLImagen?: string | null;
}

export type ProductPayload = Omit<Product, "idProducto">;
