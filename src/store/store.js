import { configureStore, createListenerMiddleware, isRejectedWithValue } from "@reduxjs/toolkit";
import authReducer, { CLAVE_SESION, logout } from "./authSlice.js";
import cartReducer from "./cartSlice.js";

const listener = createListenerMiddleware();

listener.startListening({
  actionCreator: logout,
  effect: () => localStorage.removeItem(CLAVE_SESION),
});

// Token vencido o inválido en cualquier operación: cerramos la sesión en un solo lugar.
// En login/registro un 401 son credenciales incorrectas, no sesión vencida.
listener.startListening({
  predicate: (action) =>
    isRejectedWithValue(action) &&
    action.payload?.status === 401 &&
    !action.type.startsWith("auth/"),
  effect: (_, api) => api.dispatch(logout()),
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
});
