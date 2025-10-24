import axios from "axios";
import type { ProductPayload, Product } from "../types/product";

const base = "/api/producto";

export const getProduct = async (): Promise<Product[]> => {
  const res = await axios.get(base);
  return res.data;
};

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  const res = await axios.post(base, payload);
  // Asumimos que el backend devuelve el objeto creado (ver backend abajo).
  return res.data;
};

export const updateProduct = async (id: number, payload: ProductPayload): Promise<Product> => {
  const res = await axios.put(`${base}/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${base}/${id}`);
};
