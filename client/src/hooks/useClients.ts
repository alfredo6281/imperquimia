import { useState, useEffect, useCallback } from "react";
import * as api from "../api/clients";
import type { Customer, CustomerPayload } from "../types/customer";

export function useClients() {
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- OBTENER CLIENTES ---
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (err: any) {
      console.error("Error al obtener clientes:", err);
      setError(err.message || "Error al obtener clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // --- CREAR CLIENTE ---
  const create = useCallback(async (payload: CustomerPayload) => {
    try {
      const created = await api.createClient(payload);
      setClients(prev => [...prev, created]);
      return created;
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
      throw err;
    }
  }, []);

  // --- ACTUALIZAR CLIENTE ---
  const update = useCallback(async (id: number, payload: CustomerPayload) => {
    try {
      const updated = await api.updateClient(id, payload);
      setClients(prev =>
        prev.map(c => (c.idCliente === id ? updated : c))
      );
      return updated;
    } catch (err: any) {
      console.error("Error al actualizar cliente:", err);
      throw err;
    }
  }, []);

  // --- ELIMINAR CLIENTE ---
  const remove = useCallback(async (id: number) => {
    try {
      await api.deleteClient(id);
      setClients(prev => prev.filter(c => c.idCliente !== id));
    } catch (err: any) {
      console.error("Error al eliminar cliente:", err);
      throw err;
    }
  }, []);

  return { clients, loading, error, fetch, create, update, remove };
}
