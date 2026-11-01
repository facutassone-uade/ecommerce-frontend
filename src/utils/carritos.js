// Carritos y órdenes traen el mismo CustomerSummaryDTO del back
export const nombreCliente = ({ customer }) =>
  customer ? `${customer.name} ${customer.lastName}` : "Sin cliente";

export const cantidadItems = (carrito) => carrito.items.reduce((suma, item) => suma + item.quantity, 0);

export const subtotalCarrito = (carrito) =>
  carrito.items.reduce((suma, item) => suma + item.product.price * item.quantity, 0);
