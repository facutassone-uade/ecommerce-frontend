import { useEffect, useState } from "react";
import { CartContext } from "./CartContext.js";
import { useAuth } from "../hooks/useAuth.js";
import * as cartService from "../services/cartService.js";

function CartProvider({ children }) {
  const { usuario, logout } = useAuth();
  const token = usuario?.token;
  const customerId = usuario?.customerId;

  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    let activo = true;

    const cargarCarrito = async () => {
      setCargando(true);
      setError(null);
      setCarrito(null);
      try {
        const carritos = await cartService.getCarritos();
        let actual = carritos[0];
        if (!actual) {
          actual = await cartService.crearCarrito(customerId);
        }
        if (activo) setCarrito(actual);
      } catch (err) {
        if (activo) {
          if (err.status === 401) logout();
          setError(err);
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarCarrito();
    return () => {
      activo = false;
    };
  }, [token, customerId, logout]);

  const actual = token ? carrito : null;
  const items = actual?.items ?? [];
  const cantidadTotal = items.reduce((suma, item) => suma + item.quantity, 0);
  const fechaEntrega = actual?.deliveryDate ?? "";

  const agregar = async (productId, cantidad = 1) => {
    let base = actual;
    if (!base) {
      base = await cartService.crearCarrito(customerId);
      setCarrito(base);
    }
    const actualizado = await cartService.agregarItem(base.id, productId, cantidad);
    setCarrito(actualizado);
  };

  const eliminar = async (item) => {
    const actualizado = await cartService.quitarItem(actual.id, item.id);
    setCarrito(actualizado);
  };

  const cambiarCantidad = async (item, nuevaCantidad) => {
    const diferencia = nuevaCantidad - item.quantity;
    if (diferencia > 0) {
      await agregar(item.product.id, diferencia);
    } else if (diferencia < 0) {
      const sinProducto = await cartService.quitarItem(actual.id, item.id);
      if (nuevaCantidad > 0) {
        try {
          const actualizado = await cartService.agregarItem(
            actual.id,
            item.product.id,
            nuevaCantidad,
          );
          setCarrito(actualizado);
        } catch (err) {
          setCarrito(sinProducto);
          throw err;
        }
      } else {
        setCarrito(sinProducto);
      }
    }
  };

  const vaciar = async () => {
    const actualizado = await cartService.vaciarItems(actual.id);
    setCarrito(actualizado);
  };

  const cambiarFechaEntrega = async (fecha) => {
    const actualizado = await cartService.actualizarCarrito(actual.id, {
      customerId,
      date: actual.date,
      deliveryDate: fecha,
    });
    setCarrito(actualizado);
  };

  const confirmarCompra = async (metodoPago) => {
    if (!actual || items.length === 0) {
      throw new Error("Tu carrito está vacío.");
    }
    const orden = await cartService.confirmarCompra(actual.id, metodoPago);
    setCarrito({ ...actual, items: [] });
    return orden;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cantidadTotal,
        fechaEntrega,
        cargando,
        error,
        agregar,
        cambiarCantidad,
        cambiarFechaEntrega,
        confirmarCompra,
        eliminar,
        vaciar,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
