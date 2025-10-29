// src/types/customer.ts
export interface Customer {
  idCliente: number;
  nombre: string;
  tipo: "Personal" | "Empresa";
  contacto: string | null;
  telefono: string | null;
  correo?: string | null;
  domicilio?: string | null;
  totalPurchases?: number;
  lastPurchase?: string | null;
}

export type CustomerPayload = Omit<Customer, "idCliente"> & { contacto?: string | null };
