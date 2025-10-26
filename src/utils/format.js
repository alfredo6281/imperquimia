function formatCotizacionCode(id) {
  return `C-${id.toString().padStart(8, "0")}`;
}

export default formatCotizacionCode;