import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCarritoById } from "../../services/cartService.js";
import { formatearFecha, formatearPrecio } from "../../utils/formato.js";
import { nombreCliente, subtotalCarrito } from "../../utils/carritos.js";

// Solo lectura: el carrito lo arma el cliente. Lo pedimos de nuevo por id para verlo actualizado.
function CarritoDialog({ cartId, onCerrar }) {
  const [carrito, setCarrito] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    getCarritoById(cartId)
      .then((respuesta) => vigente && setCarrito(respuesta))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [cartId]);

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Carrito #{cartId}</DialogTitle>
          <DialogDescription>
            {carrito
              ? `${nombreCliente(carrito)} · creado el ${formatearFecha(carrito.date)} · entrega ${formatearFecha(carrito.deliveryDate)}`
              : "Cargando carrito..."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !carrito ? null : carrito.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">El carrito está vacío.</p>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrito.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatearPrecio(item.product.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="text-xl font-extrabold">{formatearPrecio(subtotalCarrito(carrito))}</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CarritoDialog;
