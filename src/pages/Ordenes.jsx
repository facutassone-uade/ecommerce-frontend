import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getMisOrdenes } from "../services/ordersService.js";
import { formatearFecha, formatearPrecio } from "../utils/formato.js";


function Ordenes() {
  const { usuario, logout, inicializando } = useAuth();
  const [ordenes, setOrdenes] = useState(null);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [ordenAbierta, setOrdenAbierta] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    // Evita guardar la respuesta si el usuario cambió o se salió de la pantalla antes de que llegue
    let vigente = true;

    async function cargarOrdenes() {
      setOrdenes(null);
      setError(null);

      try {
        const datos = await getMisOrdenes(usuario.userId);
        // Las más nuevas primero
        if (vigente) setOrdenes([...datos].sort((a, b) => b.id - a.id));
      } catch (err) {
        if (!vigente) return;
        if (err.status === 401) logout();
        setError(err);
      }
    }

    cargarOrdenes();
    return () => {
      vigente = false;
    };
  }, [usuario, logout]);

  const ordenesFiltradas = (ordenes ?? []).filter(
    (orden) => filtro === "todas" || !orden.paid
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {inicializando ? (
        <p role="status">Verificando sesión…</p>
      ) : !usuario ? (
        <EmptyState titulo="Iniciá sesión para ver tus órdenes">
          <Button asChild>
            <Link to="/login" state={{ desde: "/ordenes" }}>
              Ingresar
            </Link>
          </Button>
        </EmptyState>
      ) : error ? (
        <ErrorAlert
          titulo="No pudimos cargar tus órdenes"
          mensaje={
            // Sin status (fetch falló) o 5xx (el proxy de Vite responde 502 si el back está apagado)
            !error.status || error.status >= 500
              ? "No se pudo conectar con el servidor. Probá de nuevo más tarde."
              : error.message
          }
        />
      ) : !ordenes ? (
        <div className="flex max-w-3xl flex-col gap-3" aria-label="Cargando órdenes">
          <Skeleton className="h-9 w-48" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : ordenes.length === 0 ? (
        <EmptyState
          titulo="Todavía no hiciste ninguna compra"
          descripcion="Cuando confirmes un carrito, la orden va a aparecer acá."
        >
          <Button asChild>
            <Link to="/">Ver catálogo</Link>
          </Button>
        </EmptyState>
      ) : (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Mis órdenes</h1>

        <div className="mt-5 inline-flex rounded-md bg-muted p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={filtro === "todas" ? "bg-background shadow-sm" : "text-muted-foreground"}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={filtro === "pendientes" ? "bg-background shadow-sm" : "text-muted-foreground"}
            onClick={() => setFiltro("pendientes")}
          >
            Pendientes de pago
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {ordenesFiltradas.length === 0 && (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No tenés órdenes pendientes de pago.
            </p>
          )}
          {ordenesFiltradas.map((orden) => {
            const estaAbierta = ordenAbierta === orden.id;
            const cantidadProductos = (orden.items ?? []).reduce(
              (total, item) => total + item.quantity,
              0,
            );

            return (
              <Card key={orden.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Package className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold">Orden #{orden.id}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatearFecha(orden.date)} · {cantidadProductos}{" "}
                          {cantidadProductos === 1 ? "producto" : "productos"} · {orden.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <Badge variant={orden.paid ? "info" : "warning"}>
                      {orden.paid ? "Pagada" : "Pendiente"}
                    </Badge>
                    <p className="font-bold sm:min-w-24 sm:text-right">{formatearPrecio(orden.total)}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOrdenAbierta(estaAbierta ? null : orden.id)}
                    >
                      Ver detalle
                      <ChevronDown className={`size-4 transition-transform ${estaAbierta ? "rotate-180" : ""}`} />
                    </Button>
                  </div>

                  {estaAbierta && orden.items?.length > 0 && (
                    <div className="mt-4 overflow-x-auto rounded-md border">
                      <table className="w-full min-w-120 text-sm">
                        <thead className="bg-muted/50">
                          <tr className="border-b text-left">
                            <th className="px-3 py-2 font-semibold">Producto</th>
                            <th className="px-3 py-2 font-semibold">Cant.</th>
                            <th className="px-3 py-2 text-right font-semibold">Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orden.items.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="px-3 py-2">{item.product.name}</td>
                              <td className="px-3 py-2">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">{formatearPrecio(item.product.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      )}
    </main>
  );
}

export default Ordenes;
