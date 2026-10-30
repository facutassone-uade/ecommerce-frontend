import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as cart from "../store/cartSlice.js";

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(cart.selectItems);
  const cantidadTotal = useSelector(cart.selectCantidadTotal);
  const fechaEntrega = useSelector(cart.selectFechaEntrega);
  const cargando = useSelector(cart.selectCargando);
  const error = useSelector(cart.selectError);

  // unwrap() devuelve el resultado o lanza { message, status }, como antes con el Context
  const agregar = useCallback(
    (productId, cantidad = 1) => dispatch(cart.agregar({ productId, cantidad })).unwrap(),
    [dispatch],
  );
  const eliminar = useCallback((item) => dispatch(cart.eliminar(item)).unwrap(), [dispatch]);
  const cambiarCantidad = useCallback(
    (item, nuevaCantidad) => dispatch(cart.cambiarCantidad({ item, nuevaCantidad })).unwrap(),
    [dispatch],
  );
  const vaciar = useCallback(() => dispatch(cart.vaciar()).unwrap(), [dispatch]);
  const cambiarFechaEntrega = useCallback(
    (fecha) => dispatch(cart.cambiarFechaEntrega(fecha)).unwrap(),
    [dispatch],
  );
  const confirmarCompra = useCallback(
    (metodoPago) => dispatch(cart.confirmarCompra(metodoPago)).unwrap(),
    [dispatch],
  );

  return {
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
  };
};
