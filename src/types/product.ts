export interface Product {
  idProducto: number;
  nombre: string;
  categoria: "Impermeabilizantes" | "Productos para Concreto" | "Pinturas" | "Selladores" | "Recubrimientos";
  tipo: "Bolsa" | "Bote" | "Brocha" | "Cubeta" | "Galón" | "Juego" | "Rollo" | "Saco" | "Salchicha";
  unidad: number | null;
  unidadMedida: string | null;
  color: "Ninguno" | "Aluminio" | "Amarilla" | "Blanco" | "Blanco Oro" | "Café" | "Gris" | "Marfil" | "Negro" | "Paja" | "Rojo" | "Rosa" | "Transparente";
  precioUnitario: number;
  stock: number;
  stockMinimo: number;
  descripcion?: string | null;
  URLImagen?: string | null;
}

export type ProductPayload = Product

export const CATEGORIES = [
  "Impermeabilizantes",
  "Productos para Concreto",
  "Pinturas",
  "Selladores",
  "Recubrimientos",
] as const;
export type Categoria = typeof CATEGORIES[number];

export const COLOR = [
  "Ninguno",
  "Aluminio",
  "Amarilla",
  "Blanco",
  "Blanco Oro",
  "Café",
  "Gris",
  "Marfil",
  "Negro",
  "Paja",
  "Rojo",
  "Rosa",
  "Transparente",
] as const;
export type Color = typeof COLOR[number];

export const TYPE = [
  "Bolsa",
  "Bote",
  "Brocha",
  "Cubeta",
  "Galón",
  "Juego",
  "Rollo",
  "Saco",
  "Salchicha",
] as const;
export type Tipo = typeof TYPE[number];

export const UNIDADMEDIDA = [
  "L",
  "Kg",
  "m²",
  "gr",
  '""',
] as const;
export type unidadMedida = typeof UNIDADMEDIDA[number];