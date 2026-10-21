export const getCategorias = async () => {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return await res.json();
};
