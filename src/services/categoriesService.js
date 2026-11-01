import { solicitarConToken } from "./api.js";

export const getCategorias = async () => {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return await res.json();
};

// ABM del admin (requieren rol ADMIN). datos = { name }
export const crearCategoria = (datos) => solicitarConToken("/api/categories", "POST", datos);

export const actualizarCategoria = (id, datos) =>
  solicitarConToken(`/api/categories/${id}`, "PUT", datos);

export const eliminarCategoria = (id) => solicitarConToken(`/api/categories/${id}`, "DELETE");
