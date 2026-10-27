export const getCliente = async (customerId) => {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  const token = sesion?.token;
  if (!token) throw new Error("Iniciá sesión para ver tus datos.");

  const respuesta = await fetch(`/api/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    const error = new Error(data?.message ?? `Error ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }
  return data;
};
