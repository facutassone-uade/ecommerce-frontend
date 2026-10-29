export const solicitarCliente = async (customerId, method = "GET", body) => {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  const token = sesion?.token;
  if (!token) throw new Error("Iniciá sesión para ver tus datos.");

  const respuesta = await fetch(`/api/customers/${customerId}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    const error = new Error(data?.message ?? `Error ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }
  return data;
};

export const actualizarCliente = (customerId, datos) =>
  solicitarCliente(customerId, "PUT", datos);
