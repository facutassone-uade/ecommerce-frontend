// Las credenciales de cookie HttpOnly las adjunta el navegador; nunca se leen desde JavaScript.
export const solicitarConToken = async (url, method = "GET", body) => {
  const respuesta = await fetch(url, {
    method,
    credentials: "include",
    headers: {
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
