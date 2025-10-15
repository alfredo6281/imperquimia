import express from "express";
import fs from "fs-extra";
import path from "path";
import PdfPrinter from "pdfmake";

const router = express.Router();

// Fuentes (asegúrate de tener estas rutas o cámbialas si usas Linux)
const fonts = {
  Roboto: {
    normal: "C:/Windows/Fonts/arial.ttf",
    bold: "C:/Windows/Fonts/arialbd.ttf",
    italics: "C:/Windows/Fonts/ariali.ttf",
    bolditalics: "C:/Windows/Fonts/arialbi.ttf"
  }
};

const printer = new PdfPrinter(fonts);

// Ruta para generar PDF
router.post("/api/cotizacion/pdf", async (req, res) => {
  try {
    const {
      numero,
      fecha,
      cliente,
      telefono,
      correo,
      domicilio,
      productos,
      subtotal,
      iva,
      total
    } = req.body;

    const folderPath = path.join(process.cwd(), "src/pdf/cotizaciones");
    await fs.ensureDir(folderPath);
    const filePath = path.join(folderPath, `C-${numero}.pdf`);

    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          columns: [
            {
              image: path.join(process.cwd(), "src/img/logo.png"), // tu logo
              width: 120
            },
            {
              text: [
                { text: "IMPERQUIMIA SUC. FRANCISCO VILLA\n", bold: true },
                "NORMA BEATRIZ DOMÍNGUEZ VILLANUEVA\n",
                "FRANCISCO VILLA 767 PTE COL. JORGE ALMADA\nCULIACÁN, SINALOA CP. 80200\nRFC: DOVN700225ISC\nTELÉFONO: 667-7162014"
              ],
              fontSize: 9,
              alignment: "left",
              margin: [10, 0, 0, 0]
            },
            {
              alignment: "right",
              text: [
                { text: `C-${numero}\n`, bold: true, fontSize: 14 },
                {/* text: `${fecha}\n`, fontSize: 9 */},
                { text: "ORIGINAL", bold: true, fontSize: 10 }
              ]
            }
          ]
        },
        { text: "COTIZACIÓN", style: "title" },
        
        // Información del cliente
        {
          style: "infoBox",
          table: {
            widths: ["auto", "*", "auto", "*"],
            body: [
              [
                { text: "Cliente:", bold: true },
                cliente,
                { text: "Teléfono:", bold: true },
                telefono
              ],
              [
                { text: "Nombre:", bold: true },
                cliente,
                { text: "Correo:", bold: true },
                correo
              ],
              [
                { text: "Domicilio:", bold: true },
                { text: domicilio, colSpan: 3 },
                "",
                ""
              ]
            ]
          },
          layout: "noBorders",
          margin: [0, 10, 0, 10]
        },

        // Tabla de productos
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Código", style: "tableHeader" },
                { text: "Producto", style: "tableHeader" },
                { text: "Cantidad", style: "tableHeader" },
                { text: "Precio", style: "tableHeader" },
                { text: "Descuento", style: "tableHeader" },
                { text: "Subtotal", style: "tableHeader" },
                { text: "Total", style: "tableHeader" }
              ],
              ...productos.map((p) => [
                p.codigo,
                `${p.nombre}\n${p.descripcion || ""}`,
                p.cantidad,
                `$${p.precio.toFixed(2)}`,
                `${p.descuento || 0}%`,
                `$${(p.precio * p.cantidad * (1 - (p.descuento || 0) / 100)).toFixed(2)}`,
                `$${(p.precio * p.cantidad * 1.16).toFixed(2)}`
              ])
            ]
          },
          fontSize: 9,
          layout: {
            hLineColor: () => "#cccccc",
            vLineColor: () => "#cccccc"
          }
        },

        // Totales
        {
          columns: [
            { width: "*", text: "" },
            {
              width: 150,
              table: {
                body: [
                  ["Subtotal", `$${subtotal.toFixed(2)}`],
                  ["IVA 16%", `$${iva.toFixed(2)}`],
                  [{ text: "Valor Final", bold: true }, { text: `$${total.toFixed(2)}`, bold: true }]
                ]
              },
              layout: "lightHorizontalLines"
            }
          ],
          margin: [0, 15, 0, 0]
        },

        // Nota y firma
        {
          text: [
            { text: "Nota: ", bold: true },
            "Precios sujetos a cambio sin previo aviso\n\n",
            "Nombre: Norma Beatriz Domínguez Villanueva\nBanco: INBURSA\nCTA: 50026530593\nCLABE: 036730500265305931\n\n"
          ],
          fontSize: 9
        },
        { text: "ATENTAMENTE", alignment: "center", margin: [0, 10, 0, 0] },
        {
          text: "LIC. NORMA BEATRIZ DOMÍNGUEZ VILLANUEVA\nGERENTE DE VENTAS",
          alignment: "center",
          fontSize: 9
        }
      ],

      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: "center",
          margin: [0, 10, 0, 10]
        },
        infoBox: {
          fontSize: 10
        },
        tableHeader: {
          fillColor: "#eeeeee",
          bold: true,
          alignment: "center"
        }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();

    res.json({
      message: "PDF generado con éxito",
      url: `http://localhost:5000/pdf/cotizaciones/C-${numero}.pdf`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

export default router;
