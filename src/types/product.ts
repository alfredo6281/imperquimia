export interface Product {
  idProducto: number;
  nombre: string;
  categoria: "Impermeabilizantes" | "Productos para Concreto" | "Pinturas" | "Selladores" | "Recubrimientos";
  tipo: string | null;
  unidad: number | null;
  unidadMedida: string | null;
  color: string | null;
  precioUnitario: number;
  stock: number;
  stockMinimo: number;
  descripcion?: string | null;
  URLImagen?: string | null;
}

export type ProductPayload = Product
