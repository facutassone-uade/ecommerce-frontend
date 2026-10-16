export const getProductos = async () => {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return await res.json();
};

export const getProductoById = async (id) => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return await res.json();
};
