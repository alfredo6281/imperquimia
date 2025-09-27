import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", cantidad: "", id_unidad: 1 });

  // Obtener productos
  const getProductos = async () => {
    const res = await axios.get("http://localhost:5000/producto");
    setProductos(res.data);
  };

  useEffect(() => {
    getProductos();
  }, []);

  // Agregar producto
  const addProducto = async () => {
    await axios.post("http://localhost:5000/producto", nuevo);
    setNuevo({ nombre: "", cantidad: "", id_unidad: 1 });
    getProductos();
  };

  // Eliminar producto
  const deleteProducto = async (id) => {
    await axios.delete(`http://localhost:5000/producto/${id}`);
    getProductos();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 Inventario</h1>

      <div>
        <input
          type="text"
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={nuevo.cantidad}
          onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })}
        />
        <select
          value={nuevo.id_unidad}
          onChange={(e) => setNuevo({ ...nuevo, id_unidad: e.target.value })}
        >
          <option value={1}>Litros</option>
          <option value={2}>Galones</option>
          <option value={3}>Metros</option>
          <option value={4}>m²</option>
        </select>
        <button onClick={addProducto}>Agregar</button>
      </div>

      <ul>
        {productos.map((p) => (
          <li key={p.id_producto}>
            {p.nombre} - {p.cantidad} (unidad #{p.id_unidad})
            <button onClick={() => deleteProducto(p.id_producto)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
