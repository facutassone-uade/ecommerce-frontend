import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
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
import CarritoDialog from "../../components/admin/CarritoDialog.jsx";
import ConfirmarEliminar from "../../components/admin/ConfirmarEliminar.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import { useListado } from "../../hooks/useListado.js";
import { eliminarCarrito, getCarritos } from "../../services/cartService.js";
import { cantidadItems, nombreCliente, subtotalCarrito } from "../../utils/carritos.js";
import { formatearFecha, formatearPrecio } from "../../utils/formato.js";

function AdminCarritos() {
  const { datos: carritos, setDatos: setCarritos, error } = useListado(getCarritos);
  const [busqueda, setBusqueda] = useState("");
  const [viendo, setViendo] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const eliminar = async () => {
    await eliminarCarrito(aEliminar.id);
    setCarritos((lista) => lista.filter((c) => c.id !== aEliminar.id));
  };

  const filtrados = (carritos ?? [])
    .filter((c) => nombreCliente(c).toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <AdminEncabezado titulo="Carritos" descripcion="Carritos activos (aún no convertidos en orden)" />

      {error ? (
        <ErrorAlert titulo="No pudimos cargar los carritos" mensaje={error.message} />
      ) : !carritos ? (
        <p>Cargando carritos...</p>
      ) : (
        <>
          <Buscador value={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente..." />
          {filtrados.length === 0 ? (
            <EmptyState
              titulo={busqueda ? "No hay carritos que coincidan" : "No hay carritos activos"}
              descripcion={busqueda ? "Probá con otro cliente." : "Aparecen cuando un cliente agrega productos."}
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Ítems</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((carrito) => (
                    <TableRow key={carrito.id}>
                      <TableCell>{carrito.id}</TableCell>
                      <TableCell className="font-medium">{nombreCliente(carrito)}</TableCell>
                      <TableCell>{formatearFecha(carrito.date)}</TableCell>
                      <TableCell>{formatearFecha(carrito.deliveryDate)}</TableCell>
                      <TableCell>{cantidadItems(carrito)}</TableCell>
                      <TableCell>{formatearPrecio(subtotalCarrito(carrito))}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ver carrito ${carrito.id}`}
                            onClick={() => setViendo(carrito.id)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Eliminar carrito ${carrito.id}`}
                            onClick={() => setAEliminar(carrito)}
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

      {viendo && <CarritoDialog key={viendo} cartId={viendo} onCerrar={() => setViendo(null)} />}
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo={`¿Eliminar el carrito #${aEliminar?.id ?? ""}?`}
        descripcion={`Esta acción no se puede deshacer. ${aEliminar ? nombreCliente(aEliminar) : "El cliente"} pierde los productos que tenía cargados.`}
        onConfirmar={eliminar}
      />
    </>
  );
}

export default AdminCarritos;
