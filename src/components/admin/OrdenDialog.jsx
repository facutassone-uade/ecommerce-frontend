import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import QuantitySelector from "../QuantitySelector.jsx";
import {
  actualizarOrden,
  agregarItemOrden,
  quitarItemOrden,
} from "../../services/ordersService.js";
import { formatearFecha, formatearPrecio } from "../../utils/formato.js";
import { metodosPago } from "../../utils/metodosPago.js";

// Los cambios de ítems se guardan recién con "Guardar", así "Cancelar" no deja la orden a medias.
// La pantalla lo monta con un key por orden, así el estado arranca de cero cada vez que se abre.
function OrdenDialog({ orden, productos, onCerrar, onGuardado, onEliminar }) {
  const [pagada, setPagada] = useState(!!orden.paid);
  const [metodoPago, setMetodoPago] = useState(orden.paymentMethod ?? "");
  const [items, setItems] = useState(orden.items ?? []);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [errorApi, setErrorApi] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Si la orden tiene un método que no está en la lista, lo sumamos para no perderlo
  const opcionesPago = metodoPago && !metodosPago.includes(metodoPago) ? [metodoPago, ...metodosPago] : metodosPago;
  const total = items.reduce((suma, item) => suma + item.product.price * item.quantity, 0);
  const cliente = orden.customer ? `${orden.customer.name} ${orden.customer.lastName}` : "Sin cliente";

  const agregarItem = () => {
    const producto = productos.find((p) => String(p.id) === productoId);
    if (!producto) return;
    setItems([...items, { id: `nuevo-${Date.now()}`, nuevo: true, product: producto, quantity: cantidad }]);
    setProductoId("");
    setCantidad(1);
  };

  const guardar = async () => {
    setGuardando(true);
    setErrorApi(null);
    try {
      const quitados = (orden.items ?? []).filter((original) => !items.some((i) => i.id === original.id));
      for (const item of quitados) await quitarItemOrden(orden.id, item.id);
      for (const item of items.filter((i) => i.nuevo)) {
        await agregarItemOrden(orden.id, item.product.id, item.quantity);
      }
      // El back no recalcula el total al tocar los ítems: lo mandamos nosotros
      onGuardado(
        await actualizarOrden(orden.id, {
          customerId: orden.customer.id,
          date: orden.date,
          total,
          paid: pagada,
          paymentMethod: metodoPago,
        }),
      );
    } catch (err) {
      setErrorApi(err.message);
      setGuardando(false);
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onCerrar()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Orden #{orden.id}</DialogTitle>
          <DialogDescription>
            {cliente} · {formatearFecha(orden.date)}
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={guardando} className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch id="pagada" checked={pagada} onCheckedChange={setPagada} />
              <Label htmlFor="pagada">Pagada</Label>
            </div>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger className="h-10 w-56" aria-label="Método de pago">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                {opcionesPago.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Ítems</h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">La orden no tiene productos.</p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="text-right">Quitar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatearPrecio(item.product.price)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Quitar ${item.product.name}`}
                            onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Agregar producto</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={productoId} onValueChange={setProductoId}>
                <SelectTrigger className="h-10 min-w-0 flex-1" aria-label="Producto a agregar">
                  <SelectValue placeholder="Seleccionar producto…" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={String(producto.id)}>
                      {producto.name} · {formatearPrecio(producto.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <QuantitySelector cantidad={cantidad} onCambiar={setCantidad} deshabilitado={guardando} />
              <Button variant="outline" size="lg" className="h-10" onClick={agregarItem} disabled={!productoId}>
                Agregar
              </Button>
            </div>
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-extrabold">{formatearPrecio(total)}</span>
          </div>

          {errorApi && (
            <Alert variant="destructive">
              <AlertDescription>{errorApi}</AlertDescription>
            </Alert>
          )}
        </fieldset>

        <DialogFooter className="sm:justify-between">
          <Button
            size="lg"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onEliminar}
            disabled={guardando}
          >
            Eliminar orden
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" size="lg" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button size="lg" onClick={guardar} disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrdenDialog;
