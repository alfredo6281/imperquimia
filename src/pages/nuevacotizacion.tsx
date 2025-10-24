<TableBody>
  {filteredQuotes.map((quote) => {
    const validUntil = new Date(quote.fecha);

    //const isExpired = new Date() > validUntil;

    return (
      <TableRow key={quote.idCotizacion}>
        <TableCell className="font-medium">ddd{quote.idCotizacion}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(quote.tipo.toString())}>
            {quote.tipo.toString() === "true" ? "Material" : "Mano de obra"}
          </Badge>
        </TableCell>
        <TableCell>{new Date(quote.fecha).toLocaleDateString()}</TableCell>
        <TableCell>{quote.cliente}</TableCell>
        <TableCell className="font-semibold">${quote.total.toFixed(2)}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(quote.estado)}>
            {quote.estado}
          </Badge>
        </TableCell>
        <TableCell className="font-medium">{quote.cliente}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => viewQuoteDetail(quote)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generatePDF(quote)}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Download className="h-3 w-3" />
            </Button>
            {(quote.estado === "Pendiente" || quote.estado === "Aceptada") && (
              <Button
                size="sm"
                onClick={() => convertToSale(quote)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded"
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteQuote(quote.idCotizacion.toString())}
              className="border-red-300 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>