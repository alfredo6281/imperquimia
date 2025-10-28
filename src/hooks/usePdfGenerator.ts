// src/hooks/usePdfGenerator.tsx
// Hook reusable para generar PDFs desde tu frontend.
// - Devuelve `generate` que realiza validaciones, arma el payload y llama al backend.
// - No abre ventanas ni muestra toasts: devuelve la URL y deja la UI encargarse.
// - Acepta callbacks opcionales (onStart, onSuccess, onError) para integrar toasts fácilmente.

import { useCallback } from "react";
import type { PdfPayload, PdfItem, FormDataType, LaborDataType } from "../types/quotes";
export type QuoteType = "materials" | "labor";
import { calculateTotals } from "../utils/calculateTotals";
export interface GenerateOptions {
  onStart?: () => void;
  onSuccess?: (url: string) => void;
  onError?: (err: Error) => void;
}

const API_BASE = import.meta.env.REACT_APP_API_URL ?? "http://localhost:5000";

function buildPayload(payload: PdfPayload) {
  const {
    quoteType,
    formData,
    items = [],
    laborData,
    note,
    date,
  } = payload;
  // 🔹 Calcular totales automáticamente (evita depender de la BD o props)
  const { subtotal, iva, total } = calculateTotals(
    items.map((i) => ({
      cantidad: i.quantity,
      precio: i.discountedUnitPrice ?? i.unitPrice,
    })),
  );

  const basePayload: any = {
    quoteType,
    idCotizacion: formData.quoteId,
    numero: formData.clientId,
    cliente: formData.clientName,
    domicilio: formData.clientAddress,
    telefono: formData.clientPhone,
    correo: formData.clientEmail,
    nota: note,
    date,
    subtotal,
    total,
    iva,
  };

  if (quoteType === "materials") {
    basePayload.productos = (items ?? []).map((item: PdfItem) => {
      const cantidad = Number(item.quantity) || 0;
      const precioOriginal = Number(item.unitPrice) || 0;
      const precioDescuento = Number(item.discountedUnitPrice ?? (precioOriginal * (1 - (Number(item.discount || 0) / 100)))) || 0;
      const descuento = Number(item.discount) || 0;
      const subtotal = Number(item.subtotal ?? (precioDescuento * cantidad)) || 0;

      return {
        codigo: item.productId,
        nombre: item.productName,
        color: item.color,
        tipo: item.type,
        unidad: item.unity,
        unidadMedida: item.unitMed,
        cantidad,
        // nombres que ya tenías para compatibilidad
        precioOriginal,
        precioDescuento,
        descuento,
        subtotal,
        // campo clave: 'precio' suele ser el que muestra la plantilla como Precio U.
        // lo ponemos con el precio final unitario (con descuento aplicado)
        precio: precioDescuento,
      };
    });
  } else {
    basePayload.manoObra = [
      {
        descripcion: laborData?.description ?? "",
        sistema: laborData?.system ?? "",
        acabado: laborData?.finish ?? "",
        superficie: laborData?.surface ?? "",
        estimacion: laborData?.estimation ?? "",
        precio: Number(laborData?.price) || 0,
        anticipo: Number(laborData?.advance) || 0,
        saldo: Number(laborData?.balance) || 0,
        garantia: laborData?.warranty ?? "",
      },
    ];
  }

  return basePayload;
}

function validateForPdf(payload: PdfPayload): string | null {
  if (!payload.formData?.clientId) return "Selecciona un cliente";
  if (payload.quoteType === "materials" && (!payload.items?.length)) return "Agrega al menos un producto";
  if (payload.quoteType === "labor" && !payload.laborData?.system?.trim()) return "Completa el campo 'sistema' en mano de obra";
  return null;
}

async function postPdf(endpoint: string, payload: any): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Error generando PDF: ${res.status} ${text ?? ""}`);
  }

  const data = await res.json();
  if (!data?.url) throw new Error("No se devolvió URL del PDF");
  return data.url as string;
}

/**
 * usePdfGenerator
 * - generate(params, options) => Promise<string (url)>
 */
export const usePdfGenerator = () => {
  const generate = useCallback(
    async (
      payload: PdfPayload,
      hooks?: {
        onStart?: () => void;
        onSuccess?: (url: string) => void;
        onError?: (e: any) => void;
      }
    ) => {
      try {
        const validationError = validateForPdf(payload);
        if (validationError) throw new Error(validationError);

        hooks?.onStart?.();

        const builtPayload = buildPayload(payload);
        const endpoint = `${API_BASE}/api/generate-pdf`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(builtPayload),
        });

        // ⚠️ Verificamos si hubo error del servidor antes de leer JSON
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Error al generar PDF en el servidor");
        }

        // ✅ Leer respuesta JSON con la URL del PDF
        const data = await res.json();

        if (!data?.url) {
          throw new Error("El servidor no devolvió la URL del PDF");
        }

        // ✅ Mostrar el PDF generado en nueva pestaña
        const url = data.url;
        hooks?.onSuccess?.(url);
        return url;


      } catch (e) {
        hooks?.onError?.(e);
        throw e;
      }
    },
    []
  );

  return { generate };
};

// ---------------------------
// Ejemplo rápido de uso (en tu componente .tsx):
// ---------------------------
// import { usePdfGenerator } from "../hooks/usePdfGenerator";
// import { toast } from "react-toastify";
//
// const MyComponent = () => {
//   const { generate } = usePdfGenerator();
//
//   const onClickGenerate = async () => {
//     try {
//       const url = await generate({ quoteType, formData, items, laborData, note: nota, subtotal, total, date, taxAmount }, {
//         onStart: () => toast.info("Generando PDF..."),
//         onSuccess: () => toast.success("PDF generado con éxito"),
//         onError: (e) => toast.error(e.message || "Error al generar PDF"),
//       });
//       // abrir en nueva pestaña desde la UI
//       window.open(url, "_blank");
//     } catch (e) {
//       console.error(e);
//     }
//   };
// };
