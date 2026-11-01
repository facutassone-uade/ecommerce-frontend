import { solicitarConToken } from "./api.js";

export const getProductos = async () => {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return await res.json();
};

export const getProductoById = async (id) => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    // status permite distinguir "no existe" (404) de "el back falló"
    const error = new Error(`Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return await res.json();
};

// ABM del admin (requieren rol ADMIN). datos = { name, description, price, stock, imageUrl }
export const crearProducto = (datos) => solicitarConToken("/api/products", "POST", datos);

export const actualizarProducto = (id, datos) =>
  solicitarConToken(`/api/products/${id}`, "PUT", datos);

export const eliminarProducto = (id) => solicitarConToken(`/api/products/${id}`, "DELETE");

export const asignarCategoria = (id, categoryId) =>
  solicitarConToken(`/api/products/${id}/categories/${categoryId}`, "POST");

export const quitarCategoria = (id, categoryId) =>
  solicitarConToken(`/api/products/${id}/categories/${categoryId}`, "DELETE");
