import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatearPrecio } from "../utils/formato.js";

function OrderSummary({ items, textoBoton = "Continuar al checkout", onContinuar, deshabilitado = false }) {
  let unidades = 0;
  let total = 0;

  for (const item of items) {
    unidades += item.quantity;
    total += item.product.price * item.quantity;
  }

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-3 p-5">
        <h2 className="text-base font-bold">Resumen de compra</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Productos ({unidades})</span>
          <span>{formatearPrecio(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span>Gratis</span>
        </div>

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-extrabold">{formatearPrecio(total)}</span>
        </div>

        <Button size="lg" className="mt-2 h-10 w-full cursor-pointer" onClick={onContinuar} disabled={deshabilitado}>
          {textoBoton}
        </Button>
      </CardContent>
    </Card>
  );
}

export default OrderSummary;
