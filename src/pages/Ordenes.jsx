import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getMisOrdenes } from "../services/ordersService.js";
import { formatearPrecio } from "../utils/formato.js";


function Ordenes() {
  const { usuario, logout } = useAuth();
  const [ordenes, setOrdenes] = useState(null);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [ordenAbierta, setOrdenAbierta] = useState(null);

  useEffect(() => {
    if (!usuario) return;

    async function cargarOrdenes() {
      setOrdenes(null);
      setError(null);

      try {
        setOrdenes(await getMisOrdenes(usuario.userId));
      } catch (err) {
        if (err.status === 401) logout();
        setError(err);
      }
    }

    cargarOrdenes();
  }, [usuario, logout]);

  const ordenesFiltradas = (ordenes ?? []).filter(
    (orden) => filtro === "todas" || !orden.paid
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {!usuario ? (
        <EmptyState titulo="Iniciá sesión para ver tus órdenes">
          <Button asChild>
            <Link to="/login" state={{ desde: "/ordenes" }}>
              Ingresar
            </Link>
          </Button>
        </EmptyState>
      ) : error ? (
        <ErrorAlert titulo="No pudimos cargar tus órdenes" mensaje={error.message} />
      ) : !ordenes ? (
        <p>Cargando órdenes...</p>
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
                          {orden.date} · {cantidadProductos} productos · {orden.paymentMethod}
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
