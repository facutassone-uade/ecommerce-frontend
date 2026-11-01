const solicitarCarrito = async (url, method = "GET", body) => {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  const token = sesion?.token;
  if (!token) throw new Error("Iniciá sesión para usar el carrito.");

  const respuesta = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (respuesta.status === 204) return null;

  const data = await respuesta.json();
  if (!respuesta.ok) {
    let mensaje = data?.message ?? `Error ${respuesta.status}`;
    if (respuesta.status === 400 && mensaje.toLowerCase().includes("insufficient stock")) {
      mensaje = "No hay stock suficiente para esa cantidad. Revisá las unidades de tu carrito o elegí una cantidad menor.";
    }
    const error = new Error(mensaje);
    error.status = respuesta.status;
    throw error;
  }
  return data;
};

// Con rol ADMIN devuelve los carritos de todos los clientes
export const getCarritos = () => solicitarCarrito("/api/carts");

export const getCarritoById = (cartId) => solicitarCarrito(`/api/carts/${cartId}`);

export const eliminarCarrito = (cartId) => solicitarCarrito(`/api/carts/${cartId}`, "DELETE");

export const crearCarrito = (customerId) =>
  solicitarCarrito("/api/carts", "POST", {
    customerId,
    date: new Date().toLocaleDateString("en-CA"),
  });

export const agregarItem = (cartId, productId, quantity) =>
  solicitarCarrito(`/api/carts/${cartId}/items`, "POST", {
    productId,
    quantity,
  });

export const quitarItem = (cartId, itemId) =>
  solicitarCarrito(`/api/carts/${cartId}/items/${itemId}`, "DELETE");

export const vaciarItems = (cartId) =>
  solicitarCarrito(`/api/carts/${cartId}/items`, "DELETE");

export const actualizarCarrito = (cartId, { customerId, date, deliveryDate }) =>
  solicitarCarrito(`/api/carts/${cartId}`, "PUT", {
    customerId,
    date,
    deliveryDate: deliveryDate || null,
  });

export const confirmarCompra = (cartId, paymentMethod) =>
  solicitarCarrito(`/api/carts/${cartId}/checkout`, "POST", {
    paymentMethod,
  });
