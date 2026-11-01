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
import ClienteDialog from "../../components/admin/ClienteDialog.jsx";
import ConfirmarEliminar from "../../components/admin/ConfirmarEliminar.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import { useListado } from "../../hooks/useListado.js";
import { eliminarCliente, getClientes } from "../../services/customersService.js";

const nombreCompleto = (cliente) => `${cliente.name ?? ""} ${cliente.lastName ?? ""}`.trim();

function AdminClientes() {
  const { datos: clientes, setDatos: setClientes, error } = useListado(getClientes);
  const [busqueda, setBusqueda] = useState("");
  const [viendo, setViendo] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const eliminar = async () => {
    await eliminarCliente(aEliminar.id);
    setClientes((lista) => lista.filter((c) => c.id !== aEliminar.id));
  };

  const texto = busqueda.trim().toLowerCase();
  const filtrados = (clientes ?? []).filter(
    (c) =>
      String(c.nationalId ?? "").includes(texto) ||
      String(c.phone ?? "").includes(texto) ||
      nombreCompleto(c).toLowerCase().includes(texto),
  );

  return (
    <>
      <AdminEncabezado titulo="Clientes" descripcion="Clientes registrados" />

      {error ? (
        <ErrorAlert titulo="No pudimos cargar los clientes" mensaje={error.message} />
      ) : !clientes ? (
        <p>Cargando clientes...</p>
      ) : (
        <>
          <Buscador value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, DNI o teléfono..." />
          {filtrados.length === 0 ? (
            <EmptyState
              titulo={busqueda ? "No hay clientes que coincidan" : "Todavía no hay clientes"}
              descripcion={busqueda ? "Probá con otro dato." : "Se crean cuando alguien se registra."}
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>{cliente.id}</TableCell>
                      <TableCell className="font-medium">{nombreCompleto(cliente) || "—"}</TableCell>
                      <TableCell>{cliente.nationalId ?? "—"}</TableCell>
                      <TableCell>{cliente.phone ?? "—"}</TableCell>
                      <TableCell>{cliente.address?.city || "—"}</TableCell>
                      <TableCell>#{cliente.userId}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ver cliente ${nombreCompleto(cliente)}`}
                            onClick={() => setViendo(cliente.id)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Eliminar cliente ${nombreCompleto(cliente)}`}
                            onClick={() => setAEliminar(cliente)}
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

      {viendo && <ClienteDialog key={viendo} customerId={viendo} onCerrar={() => setViendo(null)} />}
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo={`¿Eliminar al cliente ${aEliminar ? nombreCompleto(aEliminar) : ""}?`}
        descripcion="Esta acción no se puede deshacer. Se eliminarán sus datos personales y dirección."
        onConfirmar={eliminar}
      />
    </>
  );
}

export default AdminClientes;
