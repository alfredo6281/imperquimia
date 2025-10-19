import axios from "axios";
import type { CustomerPayload, Customer } from "../types/customer";

const base = "/api/cliente";

export const getClients = async (): Promise<Customer[]> => {
  const res = await axios.get(base);
  return res.data;
};

export const createClient = async (payload: CustomerPayload): Promise<Customer> => {
  const res = await axios.post(base, payload);
  // Asumimos que el backend devuelve el objeto creado (ver backend abajo).
  return res.data;
};

export const updateClient = async (id: number, payload: CustomerPayload): Promise<Customer> => {
  const res = await axios.put(`${base}/${id}`, payload);
  return res.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await axios.delete(`${base}/${id}`);
};
