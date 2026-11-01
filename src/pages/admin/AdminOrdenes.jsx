import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminEncabezado from "../../components/admin/AdminEncabezado.jsx";
import Buscador from "../../components/admin/Buscador.jsx";
import ConfirmarEliminar from "../../components/admin/ConfirmarEliminar.jsx";
import OrdenDialog from "../../components/admin/OrdenDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import { useListado } from "../../hooks/useListado.js";
import { eliminarOrden, getOrdenes } from "../../services/ordersService.js";
import { getProductos } from "../../services/productsService.js";
import { formatearFecha, formatearPrecio } from "../../utils/formato.js";

const nombreCliente = (orden) =>
  orden.customer ? `${orden.customer.name} ${orden.customer.lastName}` : "Sin cliente";

function AdminOrdenes() {
  const { datos: ordenes, setDatos: setOrdenes, error } = useListado(getOrdenes);
  const { datos: productos } = useListado(getProductos);
  const [busqueda, setBusqueda] = useState("");
  const [viendo, setViendo] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const guardada = (orden) => {
    setOrdenes((lista) => lista.map((o) => (o.id === orden.id ? orden : o)));
    setViendo(null);
  };

  const eliminar = async () => {
    await eliminarOrden(aEliminar.id);
    setOrdenes((lista) => lista.filter((o) => o.id !== aEliminar.id));
  };

  const texto = busqueda.trim().toLowerCase().replace(/^#/, "");
  const filtradas = (ordenes ?? [])
    .filter((o) => String(o.id).includes(texto) || nombreCliente(o).toLowerCase().includes(texto))
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <AdminEncabezado titulo="Órdenes" descripcion="Todas las órdenes de los clientes" />

      {error ? (
        <ErrorAlert titulo="No pudimos cargar las órdenes" mensaje={error.message} />
      ) : !ordenes ? (
        <p>Cargando órdenes...</p>
      ) : (
        <>
          <Buscador value={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente o #orden..." />
          {filtradas.length === 0 ? (
            <EmptyState
              titulo={busqueda ? "No hay órdenes que coincidan" : "Todavía no hay órdenes"}
              descripcion={busqueda ? "Probá con otro cliente o número." : "Se crean cuando un cliente confirma su compra."}
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell>{orden.id}</TableCell>
                      <TableCell className="font-medium">{nombreCliente(orden)}</TableCell>
                      <TableCell>{formatearFecha(orden.date)}</TableCell>
                      <TableCell>{orden.paymentMethod ?? "—"}</TableCell>
                      <TableCell>{formatearPrecio(orden.total)}</TableCell>
                      <TableCell>
                        {orden.paid ? (
                          <Badge variant="info">Pagada</Badge>
                        ) : (
                          <Badge variant="warning">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ver orden ${orden.id}`}
                            onClick={() => setViendo(orden)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Eliminar orden ${orden.id}`}
                            onClick={() => setAEliminar(orden)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {viendo && (
        <OrdenDialog
          key={viendo.id}
          orden={viendo}
          productos={productos ?? []}
          onCerrar={() => setViendo(null)}
          onGuardado={guardada}
          onEliminar={() => {
            setAEliminar(viendo);
            setViendo(null);
          }}
        />
      )}
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo={`¿Eliminar la orden #${aEliminar?.id ?? ""}?`}
        descripcion="Esta acción no se puede deshacer. Se borran la orden y sus ítems."
        onConfirmar={eliminar}
      />
    </>
  );
}

export default AdminOrdenes;
