import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as cartService from "../services/cartService.js";
import { logout } from "./authSlice.js";
import { aErrorSerializable } from "./errores.js";

// Envuelve una operación del carrito para que los errores lleguen con message y status
const crearThunk = (tipo, operacion) =>
  createAsyncThunk(tipo, async (arg, api) => {
    try {
      return await operacion(arg, api);
    } catch (err) {
      return api.rejectWithValue(aErrorSerializable(err));
    }
  });

const carritoActual = (getState) => getState().cart.carrito;
const customerIdActual = (getState) => getState().auth.usuario?.customerId;

export const cargarCarrito = crearThunk("cart/cargar", async (_, { getState }) => {
  const carritos = await cartService.getCarritos();
  return carritos[0] ?? (await cartService.crearCarrito(customerIdActual(getState)));
});

export const agregar = crearThunk(
  "cart/agregar",
  async ({ productId, cantidad = 1 }, { getState, dispatch }) => {
    let base = carritoActual(getState);
    if (!base) {
      base = await cartService.crearCarrito(customerIdActual(getState));
      dispatch(setCarrito(base));
    }
    return cartService.agregarItem(base.id, productId, cantidad);
  },
);

export const eliminar = crearThunk("cart/eliminar", async (item, { getState }) =>
  cartService.quitarItem(carritoActual(getState).id, item.id),
);

export const cambiarCantidad = crearThunk(
  "cart/cambiarCantidad",
  async ({ item, nuevaCantidad }, { getState, dispatch }) => {
    const actual = carritoActual(getState);
    const diferencia = nuevaCantidad - item.quantity;
    if (diferencia > 0) {
      return cartService.agregarItem(actual.id, item.product.id, diferencia);
    }
    if (diferencia === 0) return actual;

    const sinProducto = await cartService.quitarItem(actual.id, item.id);
    if (nuevaCantidad === 0) return sinProducto;
    try {
      return await cartService.agregarItem(actual.id, item.product.id, nuevaCantidad);
    } catch (err) {
      dispatch(setCarrito(sinProducto));
      throw err;
    }
  },
);

export const vaciar = crearThunk("cart/vaciar", async (_, { getState }) =>
  cartService.vaciarItems(carritoActual(getState).id),
);

export const cambiarFechaEntrega = crearThunk(
  "cart/cambiarFechaEntrega",
  async (fecha, { getState }) => {
    const actual = carritoActual(getState);
    return cartService.actualizarCarrito(actual.id, {
      customerId: customerIdActual(getState),
      date: actual.date,
      deliveryDate: fecha,
    });
  },
);

export const confirmarCompra = crearThunk(
  "cart/confirmarCompra",
  async (metodoPago, { getState }) => {
    const actual = carritoActual(getState);
    if (!actual || actual.items.length === 0) {
      throw new Error("Tu carrito está vacío.");
    }
    return cartService.confirmarCompra(actual.id, metodoPago);
  },
);

const initialState = {
  carrito: null,
  cargando: false,
  error: null,
};

const guardarCarrito = (state, action) => {
  state.carrito = action.payload;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCarrito: guardarCarrito,
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarCarrito.pending, (state) => {
        state.cargando = true;
        state.error = null;
        state.carrito = null;
      })
      .addCase(cargarCarrito.fulfilled, (state, action) => {
        state.cargando = false;
        state.carrito = action.payload;
      })
      .addCase(cargarCarrito.rejected, (state, action) => {
        // Si se canceló (cambió la sesión) ya hay otra carga en curso
        if (action.meta.aborted) return;
        state.cargando = false;
        state.error = action.payload;
      })
      .addCase(agregar.fulfilled, guardarCarrito)
      .addCase(eliminar.fulfilled, guardarCarrito)
      .addCase(cambiarCantidad.fulfilled, guardarCarrito)
      .addCase(vaciar.fulfilled, guardarCarrito)
      .addCase(cambiarFechaEntrega.fulfilled, guardarCarrito)
      .addCase(confirmarCompra.fulfilled, (state) => {
        state.carrito.items = [];
      })
      .addCase(logout, () => initialState);
  },
});

export const { setCarrito } = cartSlice.actions;

const SIN_ITEMS = [];

export const selectItems = (state) => state.cart.carrito?.items ?? SIN_ITEMS;
export const selectCantidadTotal = (state) =>
  selectItems(state).reduce((suma, item) => suma + item.quantity, 0);
export const selectFechaEntrega = (state) => state.cart.carrito?.deliveryDate ?? "";
export const selectCargando = (state) => state.cart.cargando;
export const selectError = (state) => state.cart.error;

export default cartSlice.reducer;
