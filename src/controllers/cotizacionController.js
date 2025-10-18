import express from "express";
import fs from "fs-extra";
import path from "path";
import PdfPrinter from "pdfmake";
import bodyParser from "body-parser";
import { table } from "console";

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
const printer = new PdfPrinter(fonts);

//router.post("/api/cotizacion/pdf", async (req, res) => {
export const createPdf = async (req, res) => {
  try {
    const { numero, cliente, telefono, correo, domicilio, productos, subtotal, iva, total, date, nota } = req.body;

    // Ruta donde se guardará
    //const folderPath = path.join(process.cwd(), "src/pdf/cotizaciones");
    //await fs.ensureDir(folderPath);
    //const filePath = path.join(folderPath, `C-${numero}.pdf`);
    // Divide los productos en grupos de N por página
    const productosPorPagina = 12; // cantidad que cabe cómodamente
    const paginasDeProductos = [];
    for (let i = 0; i < productos.length; i += productosPorPagina) {
      paginasDeProductos.push(productos.slice(i, i + productosPorPagina));
    }
    const facebook = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 440 146.7 540.8 258.2 568.5L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 574.1C477.8 558.8 576 450.9 576 320z"/></svg>'
    const instagram = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/></svg>'
    // Luego, genera una tabla por cada grupo (cada "página")
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
              `$${p.precio.toFixed(2)}`,
              `$${(p.cantidad * p.precio).toFixed(2)}`,
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

    // Estructura del documento
    const docDefinition = {
      pageSize: 'LETTER',
      pageMargins: [40, 180, 40, 40], // 🔹 margen superior más grande para el header
      header: function(currentPage, pageCount, pageSize){
        return{
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
                    { text: "CULIACÁN, SINALOA CP. 80200", style: "chico"},
                    { text: "TELÉFONO: 667-716-0214", style: "chico"},

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
              table:{
                widths: ["*"],
                body: [
                  [
                    { text:"Información", style: "tableHeader", alignment:"center"}
                  ]
                ]
              },
            },
            {
              columns: [
                {
                  stack:[
                    { text: [{ text: "Cliente: ", bold: true}, {text: `${numero}`}], style: "subheader"},
                    { text: [{ text: "Nombre: ", bold: true}, {text: `${cliente}`}], fontSize: 11},
                    { text: [{ text: "Dirección: ", bold: true}, {text: `${domicilio}`}], style: "subheader"},
                  ]
                },
                {
                  stack: [
                    { text: [{ text: "Telefono: ", bold: true}, {text: `${telefono}`}], style: "subheader",},
                    { text: [{ text: "Correo: ", bold: true}, {text: `${correo}`}], fontSize: 11},
                   ],
                },
              ],
            },
          ],
        };
      },
      content: [
        ...productosTableBody
      ],
      footer: function (currentPage, pageCount){
        if (currentPage === pageCount){
          return{
            margin: [40, -200, 40, 0],
            stack:[
              {
                columns: [
                  
                  // Columna izquierda (Notas)
                  {
                    
                    width: '*',
                    stack: [
                      {
                        text: [{ text: 'Notas: ', bold: true }, nota],
                        //margin: [0, 5, 10, 5],
                      },
                    ],
                    border: [true, true, true, true],
                  },

                  // Columna derecha (Totales)
                  {
                    width: 'auto',
                    alignment: 'right',
                    margin: [0, 0, 0, 0],
                    table: {
                      //widths: [70, 70],
                      body: [
                        [
                          { text: 'Subtotal', alignment: 'right' },
                          { text: subtotal.toFixed(2), alignment: 'left' },
                        ],
                        [
                          { text: 'IVA(16%)', alignment: 'right' },
                          { text: iva.toFixed(2), alignment: 'left' },
                        ],
                        [
                          { text: 'Total', alignment: 'right', style: "rellenoNegro" },
                          { text: total.toFixed(2), alignment: 'left', style: "rellenoNegro" },
                        ]
                      ]
                    }
                  }
                ],
                columnGap: 10,
              }
              ,
              [
                {
                  // Segunda fila: datos bancarios (izquierda)
                  colSpan: 2,
                  stack: [
                    { text: 'Datos Bancarios', bold: true, italics: true, margin: [0, 0, 0, 5]},
                    { text: [{ text: "Nombre: ", bold: true}, {text: 'Norma Beatriz Domínguez Villanueva'}]},
                    { text: [{ text: "Banco: ", bold: true}, {text: 'INBURSA'}]},
                    { text: [{ text: "CTA: ", bold: true}, {text: '50026530593'}]},
                    { text: [{ text: "CLABE: ", bold: true}, {text: '036730500265305931'}]},
                  ],
                  border: [false, false, false, false],
                  //margin: [5, 5, 0, 5],
                },
              ],
              {
                //margin: [0, 10, 0, 0], // espacio entre las tablas
                table: {
                  widths: ['*', 110],
                  body:[
                    [
                      {
                        // 🔹 Nueva fila con texto e imagen alineados como en la muestra
                        colSpan: 2,
                        table: {
                          widths: [110, '*', 110],
                          body: [
                            [
                              {
                                text:"",
                                border: [false, false, false, false],
                              },
                              {
                                stack: [
                                  { text: "ATENTAMENTE", alignment: "center", margin: [0, 0, 0, 40] },
                                  { text: "LIC. NORMA BEATRIZ DOMINGUEZ VILLANUEVA", alignment: "center" },
                                  { text: "GERENTE DE VENTAS", alignment: "center" },
                                ],
                                //border: [true, true, true, true],
                                border: [false, false, false, false],
                              },
                              {
                                image: path.join(process.cwd(), imagen),
                                width: 110,
                                alignment: 'right',
                                margin: [0, 0, 0, 0],
                                //border: [true, true, true, true],
                                border: [false, false, false, false],
                              }
                            ]
                          ]
                        },
                        border: [false, false, false, false],
                      },
                    ]
                  ]
                },
                layout: {
                  defaultBorder: true,
                  hLineWidth: function () { return 0.5 },
                  vLineWidth: function () { return 0.5 },
                },
              },
              {
                // 🔹 Número de página centrado abajo
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 15, 0, 0],
                color: '#555'
              }
            ]
          }
        }
        else{
          return{
            margin: [40, -70, 40, 0],
            stack:[
              {
                // 🔹 Imagen encima del footer
                image: path.join(process.cwd(), imagen),
                width: 110,
                alignment: 'right',
                margin: [0, 0, 0, 0],
                //margin: [0, 0, 0, 10], // espacio debajo de la imagen
              },
              {
                // 🔹 Número de página centrado abajo
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 15, 0, 0],
                color: '#555'
              }
            ]
          }
        }
      },
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
        rellenoNegro:{
          bold: true,
          color: "white",
          fillColor: "black"
        },
        datos:{ alignment:"left"},
        chico:{
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