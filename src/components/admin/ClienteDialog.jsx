import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { solicitarCliente } from "../../services/customersService.js";

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="font-medium">{valor || "—"}</dd>
    </div>
  );
}

// Solo lectura: los datos los edita el propio cliente desde "Mi perfil"
function ClienteDialog({ customerId, onCerrar }) {
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    solicitarCliente(customerId)
      .then((respuesta) => vigente && setCliente(respuesta))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [customerId]);

  const direccion = cliente?.address;

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{cliente ? `${cliente.name} ${cliente.lastName}` : `Cliente #${customerId}`}</DialogTitle>
          <DialogDescription>
            {cliente ? `Cliente #${cliente.id} · usuario #${cliente.userId}` : "Cargando cliente..."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          cliente && (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Dato etiqueta="DNI" valor={cliente.nationalId} />
              <Dato etiqueta="Teléfono" valor={cliente.phone} />
              <div className="sm:col-span-2">
                <Dato etiqueta="Calle" valor={direccion?.street} />
              </div>
              <Dato etiqueta="Ciudad" valor={direccion?.city} />
              <Dato etiqueta="Código postal" valor={direccion?.zipCode} />
              <Dato etiqueta="País" valor={direccion?.country} />
            </dl>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ClienteDialog;
