import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CartItem from "../components/CartItem.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import FormField from "../components/FormField.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { getProductos } from "../services/productsService.js";

function Cart() {
  const { usuario, logout } = useAuth();
  const {
    items,
    fechaEntrega,
    cargando,
    error,
    cambiarCantidad,
    cambiarFechaEntrega,
    eliminar,
    vaciar,
  } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState({});
  const [procesando, setProcesando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  useEffect(() => {
    const obtenerImagenes = async () => {
      try {
        const productos = await getProductos();
        setImagenes(Object.fromEntries(productos.map((p) => [p.id, p.imageUrl])));
      } catch {
        setImagenes({});
      }
    };

    obtenerImagenes();
  }, []);

  const actualizarCantidad = async (item, cantidad) => {
    setProcesando(true);
    setMensajeError(null);
    try {
      await cambiarCantidad(item, cantidad);
    } catch (err) {
      if (err.status === 401) logout();
      setMensajeError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const eliminarProducto = async (item) => {
    setProcesando(true);
    setMensajeError(null);
    try {
      await eliminar(item);
    } catch (err) {
      if (err.status === 401) logout();
      setMensajeError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const vaciarCarrito = async () => {
    setProcesando(true);
    setMensajeError(null);
    try {
      await vaciar();
    } catch (err) {
      if (err.status === 401) logout();
      setMensajeError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const actualizarFechaEntrega = async (fecha) => {
    setProcesando(true);
    setMensajeError(null);
    try {
      await cambiarFechaEntrega(fecha);
    } catch (err) {
      if (err.status === 401) logout();
      setMensajeError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const hayItems = usuario && !cargando && !error && items.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Mi carrito</h1>
          {hayItems && (
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </p>
          )}
        </div>
        {hayItems && (
          <Button
            variant="outline"
            size="lg"
            className="cursor-pointer"
            disabled={procesando}
            onClick={vaciarCarrito}
          >
            Vaciar carrito
          </Button>
        )}
      </div>

      {mensajeError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{mensajeError}</AlertDescription>
        </Alert>
      )}

      {!usuario ? (
        <EmptyState
          titulo="Iniciá sesión para ver tu carrito"
          descripcion="Tu carrito se guarda en tu cuenta."
        >
          <Button size="lg" asChild>
            <Link to="/login" state={{ desde: location.pathname }}>
              Ingresar
            </Link>
          </Button>
        </EmptyState>
      ) : cargando ? (
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full shrink-0 rounded-xl lg:w-88" />
        </div>
      ) : error ? (
        <ErrorAlert
          titulo="No pudimos cargar tu carrito"
          mensaje={error.message}
        />
      ) : items.length === 0 ? (
        <EmptyState
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo para comprarlos."
        >
          <Button size="lg" asChild>
            <Link to="/">Ver catálogo</Link>
          </Button>
        </EmptyState>
      ) : (
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                to={`/productos/${item.product.id}`}
                nombre={item.product.name}
                precio={item.product.price}
                cantidad={item.quantity}
                max={item.product.stock}
                imagenUrl={imagenes[item.product.id]}
                procesando={procesando}
                onCambiarCantidad={(cantidad) => actualizarCantidad(item, cantidad)}
                onEliminar={() => eliminarProducto(item)}
              />
            ))}
          </div>

          <div className="max-w-xs">
            <FormField
              id="fechaEntrega"
              label="Fecha de entrega"
              type="date"
              value={fechaEntrega}
              onChange={(e) => actualizarFechaEntrega(e.target.value)}
              disabled={procesando}
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-88">
          <OrderSummary
            items={items}
            onContinuar={() => navigate("/checkout")}
            deshabilitado={procesando}
          />
          <Button variant="link" className="self-start" asChild>
            <Link to="/">Seguir comprando</Link>
          </Button>
        </div>
      </div>
      )}
    </main>
  );
}

export default Cart;
