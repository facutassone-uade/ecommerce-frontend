import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import { getProductos, getProductoById } from "../services/productsService.js";

function Products() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const data = await getProductos();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    setTimeout(obtenerProductos, 2000);
  }, []);

  const verProducto = async (id) => {
    setCargando(true);
    try {
      const data = await getProductoById(id);
      setSeleccionado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const renderCard = (item, onClick) => (
    <Card
      key={item.id}
      nombre={item.name}
      categoria={item.categories[0].name}
      precio={item.price}
      disponible={true}
      onClick={onClick}
    >
      {item.envioGratis && <p className="card-envio">EnvÃ­o gratis</p>}
      {item.compraInternacional && (
        <p className="card-internacional">Compra internacional</p>
      )}
    </Card>
  );

  if (error) return <p>No se pudieron cargar los productos: {error}</p>;

  if (seleccionado) {
    return (
      <>
        <div className="cards">{renderCard(seleccionado)}</div>
        <button onClick={() => setSeleccionado(null)}>Volver</button>
      </>
    );
  }

  return (
    <>
      {cargando && <Loader />}
      {visible && (
        <div className="cards">
          {items.map((item) => renderCard(item, () => verProducto(item.id)))}
        </div>
      )}
      <button onClick={() => setVisible(!visible)}>
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </>
  );
}

export default Products;
