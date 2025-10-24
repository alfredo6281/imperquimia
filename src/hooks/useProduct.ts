import { useState, useEffect, useCallback } from "react";
import * as api from "../api/products";
import type { Product, ProductPayload } from "../types/product";

export function useClients() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- OBTENER CLIENTES ---
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProduct();
      setProducts(data);
    } catch (err: any) {
      console.error("Error al obtener productos:", err);
      setError(err.message || "Error al obtener productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // --- CREAR CLIENTE ---
  const create = useCallback(async (payload: ProductPayload) => {
    try {
      const created = await api.createProduct(payload);
      setProducts(prev => [...prev, created]);
      return created;
    } catch (err: any) {
      console.error("Error al crear Producto:", err);
      throw err;
    }
  }, []);

  // --- ACTUALIZAR CLIENTE ---
  const update = useCallback(async (id: number, payload: ProductPayload) => {
    try {
      const updated = await api.updateProduct(id, payload);
      setProducts(prev =>
        prev.map(c => (c.idProducto === id ? updated : c))
      );
      return updated;
    } catch (err: any) {
      console.error("Error al actualizar producto:", err);
      throw err;
    }
  }, []);

  // --- ELIMINAR CLIENTE ---
  const remove = useCallback(async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(c => c.idProducto !== id));
    } catch (err: any) {
      console.error("Error al eliminar cliente:", err);
      throw err;
    }
  }, []);

  return { products, loading, error, fetch, create, update, remove };
}
