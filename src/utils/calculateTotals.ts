
export interface QuoteItem {
  cantidad: number | string;
  precio: number | string;
}

export interface TotalsResult {
  subtotal: number;
  iva: number;
  total: number;
}

/**
 * Calcula subtotal, IVA y total a partir de una lista de productos.
 * @param items Array de objetos con `cantidad` y `precio`
 * @param taxRate Porcentaje de IVA (por defecto 16%)
 */
export function calculateTotals(
  items: QuoteItem[],
  taxRate: number = 0.16
): TotalsResult {
  const subtotal = items.reduce((acc, item) => {
    const cantidad = Number(item.cantidad) || 0;
    const precio = Number(item.precio) || 0;
    return acc + cantidad * precio;
  }, 0);

  const iva = subtotal * taxRate;
  const total = subtotal + iva;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
