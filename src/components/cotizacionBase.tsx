{
  // envolvemos en una tabla para dibujar bordes alrededor
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
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 6,
    paddingBottom: () => 6
  }
}
