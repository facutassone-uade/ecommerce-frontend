import { solicitarConToken } from "./api.js";

// GET /api/orders devuelve todas las órdenes solo con rol ADMIN
export const getOrdenes = () => solicitarConToken("/api/orders");

export const getMisOrdenes = (userId) => solicitarConToken(`/api/orders/user/${userId}`);

// datos = { customerId, date, total, paid, paymentMethod }
export const actualizarOrden = (id, datos) => solicitarConToken(`/api/orders/${id}`, "PUT", datos);

export const eliminarOrden = (id) => solicitarConToken(`/api/orders/${id}`, "DELETE");

export const agregarItemOrden = (id, productId, quantity) =>
  solicitarConToken(`/api/orders/${id}/items`, "POST", { productId, quantity });

export const quitarItemOrden = (id, itemId) =>
  solicitarConToken(`/api/orders/${id}/items/${itemId}`, "DELETE");
