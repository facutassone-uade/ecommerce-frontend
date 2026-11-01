// Llamada al back con el token de la sesión. La usan los services de las pantallas del admin.
export const solicitarConToken = async (url, method = "GET", body) => {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  const token = sesion?.token;
  if (!token) {
    const error = new Error("Iniciá sesión para continuar.");
    error.status = 401;
    throw error;
  }

  const respuesta = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (respuesta.status === 204) return null;

  const data = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const error = new Error(
      respuesta.status === 403
        ? "No tenés permisos para hacer esta operación."
        : (data?.message ?? `Error ${respuesta.status}`),
    );
    error.status = respuesta.status;
    throw error;
  }
  return data;
};
