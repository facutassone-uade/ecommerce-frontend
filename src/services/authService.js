const enviar = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message ?? `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
};

const obtenerUsuarioActual = async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message ?? `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
};

const cerrarSesion = async () => {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const error = new Error(data?.message ?? `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
};

// El backend establece el JWT en una cookie HttpOnly; el body solo aporta datos de usuario.
export const login = (email, password) => enviar("/api/auth/login", { email, password });

export const registrar = (datos) => enviar("/api/auth/register", datos);
export { obtenerUsuarioActual, cerrarSesion };
