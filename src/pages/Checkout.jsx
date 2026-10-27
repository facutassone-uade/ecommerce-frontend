import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { getCliente } from "../services/customersService.js";

const metodosPago = [
  "Tarjeta de crédito",
  "Tarjeta de débito",
  "Transferencia",
  "Efectivo",
];

function Checkout() {
  const { usuario, logout } = useAuth();
  const { items, cargando, error, confirmarCompra } = useCart();
  const customerId = usuario?.customerId;
  const [cliente, setCliente] = useState(null);
  const [errorCliente, setErrorCliente] = useState(null);
  const [metodoPago, setMetodoPago] = useState(metodosPago[0]);
  const [confirmando, setConfirmando] = useState(false);
  const [errorCompra, setErrorCompra] = useState(null);
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    if (!usuario) return;

    async function cargarCliente() {
      setErrorCliente(null);
      setCliente(null);

      try {
        setCliente(await getCliente(customerId));
      } catch (err) {
        if (err.status === 401) {
          logout();
        }
        setErrorCliente(err);
      }
    }

    cargarCliente();
  }, [usuario, customerId, logout]);

  const confirmar = async () => {
    if (confirmando) return;
    setConfirmando(true);
    setErrorCompra(null);
    try {
      setOrden(await confirmarCompra(metodoPago));
    } catch (err) {
      if (err.status === 401) logout();
      setErrorCompra(err.message);
    } finally {
      setConfirmando(false);
    }
  };

  const direccion = cliente?.address;
  const textoDireccion = [
    direccion?.street,
    direccion?.city,
    direccion?.zipCode,
    direccion?.country,
  ].filter(Boolean).join(", ") || "Dirección sin cargar";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">Checkout</h1>

      {!usuario ? (
        <EmptyState titulo="Iniciá sesión para continuar con la compra">
          <Button asChild>
            <Link to="/login" state={{ desde: "/checkout" }}>
              Ingresar
            </Link>
          </Button>
        </EmptyState>
      ) : orden ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3" role="status">
            <h2 className="text-xl font-bold">Orden #{orden.id} creada</h2>
            <p>Total: ${orden.total}</p>
            <p className="text-muted-foreground">
              Método de pago: {orden.paymentMethod}. Estado: {orden.paid ? "Pagada" : "Pendiente de pago"}.
            </p>
            <Button asChild>
              <Link to="/">Seguir comprando</Link>
            </Button>
          </CardContent>
        </Card>
      ) : error || errorCliente ? (
        <ErrorAlert
          titulo="No pudimos cargar el checkout"
          mensaje={(error ?? errorCliente).message}
        />
      ) : cargando || !cliente ? (
        <p role="status">Cargando checkout...</p>
      ) : items.length === 0 ? (
        <EmptyState
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos antes de confirmar la compra."
        >
          <Button asChild>
            <Link to="/">Ver catálogo</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <Card>
              <CardContent className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Datos de envío</h2>
                <p className="text-sm text-muted-foreground">
                  {usuario.firstName} {usuario.lastName}
                  {" · DNI: "}{cliente.nationalId ?? "Sin cargar"}
                  {" · Tel.: "}{cliente.phone ?? "Sin cargar"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {textoDireccion}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <fieldset disabled={confirmando} className="flex flex-col gap-2">
                  <legend className="mb-4 text-lg font-bold">Método de pago</legend>
                  {metodosPago.map((metodo) => (
                    <label
                      key={metodo}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm focus-within:ring-2 focus-within:ring-ring"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={metodo}
                        checked={metodoPago === metodo}
                        onChange={() => setMetodoPago(metodo)}
                        className="size-4 accent-primary"
                      />
                      {metodo}
                    </label>
                  ))}
                </fieldset>
              </CardContent>
            </Card>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-88">
            {errorCompra && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{errorCompra}</AlertDescription>
              </Alert>
            )}
            <OrderSummary
              items={items}
              textoBoton={confirmando ? "Confirmando..." : "Confirmar compra"}
              onContinuar={confirmar}
              deshabilitado={confirmando}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default Checkout;
