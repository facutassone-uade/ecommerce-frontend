const enviar = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
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

// Ambos devuelven AuthResponseDTO: { token, userId, customerId, firstName, lastName, email, role }
export const login = (email, password) => enviar("/api/auth/login", { email, password });

export const registrar = (datos) => enviar("/api/auth/register", datos);
