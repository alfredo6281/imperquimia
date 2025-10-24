import express from "express";
import fs from "fs-extra";
import path from "path";
import PdfPrinter from "pdfmake";
import bodyParser from "body-parser";
import sql from "mssql";      
import { pool } from "../config/db.js";
/*
////////////////////////////////////////////////
--------------------CRUD-----------------------
////////////////////////////////////////////////
*/
export const getDetallesCotizacion = async (req, res) => {
  const { id } = req.params; // viene del endpoint /api/cotizacion/:id

  try {
    if (!id) {
      return res.status(400).json({ error: "Falta el ID de la cotización" });
    }

    const result = await pool.request()
      .input("idCotizacion", sql.Int, id)
      .query(`
        SELECT 
          p.nombre AS producto,
          dc.cantidad,
          dc.precioUnitario AS precio,
          (dc.cantidad * dc.precioUnitario) AS subtotal,
          dc.idProducto,
          p.tipo,
          p.unidad,
          p.unidadMedida
        FROM cotizacion c
        INNER JOIN detalleCotizacion dc 
            ON c.idCotizacion = dc.idCotizacion
        INNER JOIN producto p 
            ON dc.idProducto = p.idProducto
        WHERE c.idCotizacion = @idCotizacion;
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getCotizacion = async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
      SELECT 
        c.idCotizacion,
        c.fecha, 
        c.total, 
        c.tipo, 
        c.estado, 
        c.nota, 
        cli.nombre as cliente, 
        u.usuario AS usuario 
      FROM cotizacion c 
      INNER JOIN Cliente cli 
        ON c.idCliente = cli.idCliente 
      INNER JOIN Usuario u 
        ON c.idUsuario = u.idUsuario 
      ORDER BY c.idCotizacion asc`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
export const createCotizacion = async (req, res) => {
  const {
    fecha,
    total,
    tipo,
    estado,
    idCliente,
    idUsuario,
    nota,
  } = req.body;

  try {
    const result = await pool
      .request()
      .input("fecha", sql.date, fecha)
      .input("total", sql.Decimal(12, 2), total)
      .input("tipo", sql.bit, tipo)
      .input("estado", sql.NVarChar(20), estado)
      .input("idCliente", sql.Int, idCliente)
      .input("idUsuario", sql.Int, idUsuario)
      .input("nota", sql.NVarChar(300), nota)
      .query(`
        INSERT INTO Producto (fecha, total, tipo, estado, idCliente, idUsuario, nota)
        
        VALUES (@fecha, @total, @tipo, @estado, @idCliente, @idUsuario, @nota)
      `);
    //No se usa porque el codigo se pone manual, se usa la siguiente linea cuando el id se pone automatico
    //const idProducto = result.recordset[0].idProducto;
    res.status(201).json({ message: "Cotizacion creada correctamente", idProducto });
  } catch (err) {
    console.error("❌ Error al crear cotizacion:", err, "cotizacion:", idProducto);
    res.status(500).json({ error: "Error al insertar cotizacion" });
  }
};
/*
////////////////////////////////////////////////
CREACION DE PDF
////////////////////////////////////////////////
*/
const router = express.Router();
router.use(bodyParser.json());
const imagen = 'src/img/gracias.jpg'
const marca = 'src/img/marca.jpg'

// Servir los PDFs de forma pública
export const pdfRouter = async (req, res) => {
  router.use("/pdf", express.static(path.join(process.cwd(), "src/pdf")));
}

//margin: izquierda, arriba, derecha , abajo
const fonts = {
  Roboto: {
    normal: "C:/Windows/Fonts/calibri.ttf",
    bold: "C:/Windows/Fonts/calibrib.ttf",
    italics: "C:/Windows/Fonts/calibrii.ttf",
    bolditalics: "C:/Windows/Fonts/calibriz.ttf"
  }
};
// helper para formatear números como 16,499.00
const fmt = (v) => {
  const n = Number(v ?? 0);
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const printer = new PdfPrinter(fonts);
let tabla = [];
export const createPdf = async (req, res) => {
  try {
    const { quoteType, numero, cliente, telefono, correo, domicilio, productos, subtotal, iva, total, date, nota,
      manoObra = [] } = req.body;

    // Divide los productos en grupos de N por página

    const facebook = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 440 146.7 540.8 258.2 568.5L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 574.1C477.8 558.8 576 450.9 576 320z"/></svg>'
    const instagram = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/></svg>'
    // Luego, genera una tabla por cada grupo (cada "página")
    if (quoteType == "materials") {
      const productosPorPagina = 11; // cantidad que cabe cómodamente
      const paginasDeProductos = [];
      for (let i = 0; i < productos.length; i += productosPorPagina) {
        paginasDeProductos.push(productos.slice(i, i + productosPorPagina));
      }
      const productosTableBody = paginasDeProductos.map((grupo, index) => {
        return {
          table: {
            widths: ["auto", "*", "auto", "auto", "auto"],
            body: [
              [
                { text: "Código", style: "tableHeader" },
                { text: "Producto", style: "tableHeader" },
                { text: "Cantidad", style: "tableHeader" },
                { text: "Precio", style: "tableHeader" },
                { text: "Subtotal", style: "tableHeader" },
              ],
              ...grupo.map(p => [
                p.codigo,
                {
                  stack: [
                    { text: p.nombre, bold: true },
                    {
                      text: `${p.tipo}: ${p.unidad} ${p.unidadMedida} - Color: ${p.color}`,
                      fontSize: 8,
                      color: "#555",
                    },
                  ],
                },
                { text: p.cantidad, alignment: "center" },
                `$${fmt(p.precio)}`,
                `$${fmt(p.cantidad * p.precio)}`,
              ])
            ]
          },
          layout: {
            hLineWidth: (i, node) => (i === 0 ? 0 : 1),
            vLineWidth: () => 0,
            hLineColor: () => '#cccccc',
            paddingBottom: () => 5
          },
          ...(index > 0 ? { pageBreak: "before" } : {}) // <--- salto de página si no es la primera tabla
        };
      });
      tabla = productosTableBody;
    } else {
      // Normalizar variables (evitar undefined)
      const m = {
        descripcion: String(manoObra[0].descripcion ?? ""),
        sistema: String(manoObra[0].sistema ?? ""),
        acabado: String(manoObra[0].acabado ?? ""),
        superficie: String(manoObra[0].superficie ?? ""),
        estimacion: String(manoObra[0].estimacion ?? "-"),
        precio: Number(manoObra[0].precio ?? subtotal) || 0,
        anticipo: Number(manoObra[0].anticipo ?? 0) || 0,
        saldo: Number(manoObra[0].saldo ?? 0) || 0,
        garantia: String(manoObra[0].garantia ?? "")
      };

      // Tabla principal de mano de obra
      const manoObraTable = {
        table: {
          widths: ["*"],
          body: [
            [{ text: [{ text: "Envió presupuesto de impermeabilización de " }, { text: `${m.descripcion}` }], style: "subheader", alignment: "center", margin: [0, 30, 0, 30] }],
            [{ text: [{ text: "Sistema: ", bold: true }, { text: `${m.sistema}` }], style: "subheader" }],
            [{ text: [{ text: "Acabado: ", bold: true }, { text: `${m.acabado}` }], style: "subheader" }],
            [{ text: [{ text: "Superficie: ", bold: true }, { text: `${m.superficie}m²` }, { text: " (Sujeto a Medición)", fontSize: 8 }], style: "subheader" }],
            [{ text: [{ text: "Precio m²: ", bold: true }, { text: `$${m.precio}` }, { text: " Neto", fontSize: 8 }], style: "subheader" }],
            [{ text: [{ text: "Estimación: ", bold: true }, { text: `$${m.estimacion}` }, { text: " Neto", fontSize: 8 }], style: "subheader" }],
            [{ text: [{ text: "Anticipo: ", bold: true }, { text: `${m.anticipo}` }, { text: " %" }], style: "subheader" }],
            [{ text: [{ text: "Saldo: ", bold: true }, { text: `${m.saldo}` }, { text: " %" }], style: "subheader" }],
            [{ text: [{ text: "Garantía: ", bold: true }, { text: `${m.garantia}` }, { text: " años" }], style: "subheader" }],
          ]

        },
        layout: { hLineWidth: () => 0, vLineWidth: () => 0 }
      };
      tabla = [manoObraTable]
      /*
      // Tabla con anticipo / saldo / garantía (si aplica)
      const financingRows = [];
      if (m.anticipo && Number(m.anticipo) !== 0) financingRows.push([{ text: "Anticipo", alignment: "right" }, { text: `$${m.anticipo.toFixed(2)}`, alignment: "left" }]);
      if (m.saldo && Number(m.saldo) !== 0) financingRows.push([{ text: "Saldo", alignment: "right" }, { text: `$${m.saldo.toFixed(2)}`, alignment: "left" }]);
      if (m.garantia && String(m.garantia).trim() !== "") financingRows.push([{ text: "Garantía", alignment: "right" }, { text: m.garantia, alignment: "left" }]);
     
      const financingTable = financingRows.length > 0 ? {
        table: {
          widths: ['*', 100],
          body: financingRows
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0
        },
        margin: [0, 6, 0, 0]
      } : null;
     
      // --- VALIDACIÓN: asegurar que todas las tablas tengan .table.body (y tablas anidadas) ---
      const normalizeTableNode = (node) => {
        if (!node || typeof node !== "object") return node;
        if (node.table) {
          // garantizar body como array
          if (!Array.isArray(node.table.body)) node.table.body = [];
          // garantizar widths como array si existe, si no lo dejamos tal cual
          if (node.table.widths && !Array.isArray(node.table.widths)) node.table.widths = [];
          // validar cada celda por si contiene una tabla anidada
          node.table.body = node.table.body.map(row => {
            if (!Array.isArray(row)) return Array.isArray(row) ? row : [row];
            return row.map(cell => {
              // si la celda es un objeto y contiene su propia tabla, normalizarla recursivamente
              if (cell && typeof cell === "object" && cell.table) {
                return normalizeTableNode(cell);
              }
              return cell;
            });
          });
        }
        return node;
      };
      */
      // montar tabla final como array (pdfmake espera array para ...tabla)

    }
    // reemplaza tu lógica de totalsRows por esto
    let totalsTable = null;
    if (quoteType === "materials") {
      totalsTable = {
        table: {
          widths: ['*', 'auto'], // la segunda columna tiene 110 pts de ancho: ajústalo si hace falta
          body: [
            [
              { text: 'Subtotal', alignment: 'right' },
              {
                text: `$${fmt(subtotal)}`,
                alignment: 'left',
                noWrap: true // evita que el número se divida en varias líneas
              }
            ],
            [
              { text: `IVA(16%)`, alignment: 'right' },
              {
                text: `$${fmt(iva)}`,
                alignment: 'left',
                noWrap: true
              }
            ],
            [
              { text: 'Total', alignment: 'right', style: "rellenoNegro" },
              {
                text: `$${fmt(total)}`,
                alignment: 'left',
                noWrap: true,
                style: "rellenoNegro"
              }
            ]
          ]
        },
      };
    }


    // Estructura del documento
    const docDefinition = {
      pageSize: 'LETTER',
      pageMargins: [40, 180, 40, 40], // 🔹 margen superior más grande para el header
      header: function (currentPage, pageCount, pageSize) {
        return {
          margin: [40, 40, 40, 40],
          stack: [
            {
              columns: [
                {
                  image: path.join(process.cwd(), marca), // tu logo
                  width: 120
                },

                {
                  stack: [
                    { text: "IMPERQUIMIA SUC. FRANCISCO VILLA", bold: true, fontSize: 9 },
                    { text: "FRANCISCO VILLA 767 PTE COL. JORGE ALMADA", style: "chico" },
                    { text: "CULIACÁN, SINALOA CP. 80200", style: "chico" },
                    { text: "TELÉFONO: 667-716-0214", style: "chico" },

                    // Aquí agregamos el SVG junto al texto
                    {
                      columns: [
                        // 🔹 Primer grupo (Facebook)
                        {
                          columns: [
                            { svg: facebook, width: 7, margin: [0, 0, 2, 0] }, // margen derecho pequeño
                            { text: "Imperquimia Francisco Villa", style: "chico" }
                          ],
                          width: "auto"
                        },
                        // 🔹 Segundo grupo (Instagram)
                        {
                          columns: [
                            { svg: instagram, width: 7, margin: [5, 0, 2, 0] }, // margen derecho pequeño
                            { text: "imperfcovilla", style: "chico", margin: [5, 0, 0, 0] }
                          ],
                          width: "auto"
                        }
                      ],
                      columnGap: 1, // espacio entre ambos grupos (puedes ajustar)
                    }

                  ],

                  margin: [5, 0, 0, 0]
                },
                {
                  alignment: "right",
                  text: [
                    { text: `C-${numero}\n`, bold: true, fontSize: 14 },
                    { text: `${date}\n`, fontSize: 9 },
                  ],
                },
              ],
            },
            { text: "COTIZACIÓN", style: "header" },
            {
              table: {
                widths: ["*"],
                body: [
                  [
                    { text: "Información", style: "tableHeader", alignment: "center" }
                  ]
                ]
              },
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      stack: [
                        { text: [{ text: "Cliente: ", bold: true }, { text: `${numero}` }], style: "subheader" },
                        { text: [{ text: "Nombre: ", bold: true }, { text: `${cliente}` }], fontSize: 11 },
                        { text: [{ text: "Dirección: ", bold: true }, { text: `${domicilio}` }], style: "subheader" },
                      ],
                      //margin: [6, 6, 6, 6]
                    },
                    {
                      stack: [
                        { text: [{ text: "Telefono: ", bold: true }, { text: `${telefono}` }], style: "subheader" },
                        { text: [{ text: "Correo: ", bold: true }, { text: `${correo}` }], fontSize: 11 },
                      ],
                      //margin: [6, 6, 6, 6]
                    }
                  ]
                ]
              },
              layout: {
                // dibuja sólo los bordes exteriores (top/bottom/left/right)
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0),
                vLineWidth: (i, node) => (i === 0 || i === (node.table.widths ? node.table.widths.length : 2) ? 1 : 0),
                hLineColor: () => '#000',
                vLineColor: () => '#000',
              }
            },
          ],
        };
      },
      content: [
        //...productosTableBody
        ...tabla
      ],

      footer: function (currentPage, pageCount) {
        // Construir contenido condicional para la primera fila del footer
        const columnsContent = [];

        if (quoteType === "materials" && totalsTable) {
          // Notas (izquierda)
          columnsContent.push({
            // Columna izquierda (Notas)
            width: '*',
            stack: [
              {
                text: [
                  { text: 'Notas: ', bold: true },
                  { text: nota },
                ],
                alignment: 'justify',
                margin: [5, 0, 0, 0],
                //margin: [5, 5, 5, 5],
              },
            ],
          });

          // Totales (derecha)
          columnsContent.push({
            width: 'auto',
            alignment: 'right',

            ...totalsTable

          });
        } else {
          // Solo Notas que ocupa todo el ancho y tiene altura fija (minHeight)
          columnsContent.push({

            columns: [

              // Columna izquierda (Notas)
              {

                width: '*',
                stack: [
                  {
                    text: [
                      { text: 'Notas: ', bold: true },
                      { text: nota },
                    ],
                    alignment: 'justify',
                    margin: [5, 0, 0, 0],
                  },
                ],
              },
              //TABLA FALSA PARA QUE RESPETE EL TAMAÑO DEFAULT
              // Columna derecha (Totales)
              {
                width: 'auto',
                alignment: 'right',
                margin: [0, 0, 0, 0],
                table: {
                  //widths: [70, 70],
                  body: [
                    [
                      { text: ' ', alignment: 'right' },
                    ],
                    [
                      { text: ' ', alignment: 'right' },
                    ],
                    [
                      { text: ' ', alignment: 'right' },
                    ],

                  ],
                },
                layout: {
                  hLineColor: () => 'white', // color de líneas horizontales
                  vLineColor: () => 'white', // color de líneas verticales

                },
              }
            ],

          });
        }

        // Nodo que pondremos arriba del footer
        const topFooterNode = { columns: columnsContent, columnGap: 10 };

        if (currentPage === pageCount) {
          return {
            margin: [40, -220, 40, 0],
            stack: [
              // 1) Notas (+ Totales si aplica)
              topFooterNode,

              // 2) Datos bancarios (como un bloque, sin usar colSpan)
              {
                margin: [0, 0, 0, 0],
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        stack: [
                          { text: 'Datos Bancarios', bold: true, italics: true, margin: [0, 0, 0, 5] },
                          { text: [{ text: "Nombre: ", bold: true }, 'Norma Beatriz Domínguez Villanueva'] },
                          { text: [{ text: "Banco: ", bold: true }, 'INBURSA'] },
                          { text: [{ text: "CTA: ", bold: true }, '50026530593'] },
                          { text: [{ text: "CLABE: ", bold: true }, '036730500265305931'] },
                        ],

                        margin: [0, 0, 0, 6]
                      }
                    ]
                  ]
                },
                layout: { hLineWidth: () => 0, vLineWidth: () => 0 }
              },

              // 3) Firma / Atentamente (tabla con 3 columnas: izquierda vacía, centro texto, derecha imagen)
              {
                table: {
                  widths: [110, '*', 110],
                  body: [
                    [
                      { text: "", border: [false, false, false, false] },
                      {
                        stack: [
                          { text: "ATENTAMENTE", alignment: "center", margin: [0, 0, 0, 50] },
                          { text: "LIC. NORMA BEATRIZ DOMINGUEZ VILLANUEVA", alignment: "center" },
                          { text: "GERENTE DE VENTAS", alignment: "center" }
                        ],
                        border: [false, false, false, false]
                      },
                      {
                        image: path.join(process.cwd(), imagen),
                        width: 110,
                        alignment: 'right',
                        border: [false, false, false, false]
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: true,
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0.5
                },
                margin: [0, 8, 0, 0]
              },

              // 4) Pie (número de página)
              {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 12, 0, 0],
                color: '#555'
              }
            ]
          };
        } else {
          // Footer páginas intermedias
          return {
            margin: [40, -70, 40, 0],
            stack: [
              {
                image: path.join(process.cwd(), imagen),
                width: 110,
                alignment: 'right',
                margin: [0, 0, 0, 0],
              },
              {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 12, 0, 0],
                color: '#555'
              }
            ]
          };
        }
      }

      ,
      styles: {
        header: { fontSize: 20, bold: true, alignment: "center", margin: [0, 5, 0, 5] },
        subheader: { fontSize: 11, margin: [0, 5, 0, 5] },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: "white",
          fillColor: "black",
          alignment: "left",
        },
        rellenoNegro: {
          bold: true,
          color: "white",
          fillColor: "black"
        },
        datos: { alignment: "left" },
        chico: {
          fontSize: 7,
          alignment: "left"
        }

      }
    };

    // Carpeta y archivo
    const folderPath = path.join(process.cwd(), "src/pdf/cotizaciones");
    await fs.ensureDir(folderPath);
    const fileName = `C-${numero}.pdf`;
    const filePath = path.join(folderPath, fileName);

    // Crear PDF y guardarlo a disco
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
    //console.log("TABLA (debug):", JSON.stringify(tabla, null, 2));
    writeStream.on("finish", () => {
      // IMPORTANTE: la ruta pública depende de cómo montes el static middleware.
      // Si en server.js usas app.use('/pdf', express.static(...)), aquí será:
      const publicUrl = `http://localhost:5000/pdf/cotizaciones/${fileName}`;
      return res.json({ success: true, url: publicUrl });
    });

    writeStream.on("error", (err) => {
      console.error("Error escribiendo PDF:", err);
      return res.status(500).json({ success: false, message: "Error guardando PDF" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando el PDF" });
  }
};
