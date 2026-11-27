import { configureStore, createListenerMiddleware, isRejectedWithValue } from "@reduxjs/toolkit";
import authReducer, { sesionInvalidada } from "./authSlice.js";
import cartReducer from "./cartSlice.js";

const listener = createListenerMiddleware();

// Cookie vencida o inválida: limpiamos el estado local sin leer ni modificar la cookie.
// En login/registro un 401 son credenciales incorrectas, no sesión vencida.
listener.startListening({
  predicate: (action) =>
    isRejectedWithValue(action) &&
    action.payload?.status === 401 &&
    !action.type.startsWith("auth/"),
  effect: (_, api) => api.dispatch(sesionInvalidada()),
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
});
