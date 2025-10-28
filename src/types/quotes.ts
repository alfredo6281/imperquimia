// src/types/quotes.ts

/** Datos del cliente y configuración general del formulario de cotización */
export interface FormDataType {
  quoteId: number;
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
}

/** Información adicional de mano de obra o sistemas */
export interface LaborDataType {
  description?: string;
  system?: string;
  finish?: string;
  surface?: number;
  price?: number;
  estimation?: number;
  advance?: number;
  balance?: number;
  warranty?: string;
}

/** Item base de la cotización (producto o servicio individual) */
export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  discountedUnitPrice?: number; // precio unitario con descuento aplicado
  color: string;
  unity: number;
  unitMed: string;
  type: string;
  quantity: number;
  subtotal: number;
  discount: number;

}

/** Item tal como se exportará en el PDF */
export interface PdfItem extends QuoteItem {
  discountedUnitPrice: number; // requerido en exportación
  subtotal: number;            // subtotal final del producto
}

/** Estructura completa del payload para generar un PDF de cotización */
export interface PdfPayload {
  quoteType: "materials" | "labor";
  formData: FormDataType;
  items: PdfItem[];
  laborData: LaborDataType;
  note: string;
  subtotal: number;
  total: number;
  iva: number;
  date: string;
  taxAmount: number;
}
