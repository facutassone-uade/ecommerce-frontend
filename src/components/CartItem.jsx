import { Link } from "react-router-dom";
import { ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuantitySelector from "./QuantitySelector.jsx";

function CartItem({
  to,
  nombre,
  precio,
  cantidad,
  max,
  imagenUrl,
  procesando = false,
  onCambiarCantidad,
  onEliminar,
}) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
        <Link
          to={to}
          className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground"
        >
          {imagenUrl ? (
            <img src={imagenUrl} alt={nombre} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6" />
          )}
        </Link>

        <div className="min-w-0 flex-1 basis-40">
          <Link to={to} className="block truncate font-semibold hover:underline">
            {nombre}
          </Link>
          <p className="text-xs text-muted-foreground">${precio} c/u</p>
        </div>

        <QuantitySelector
          cantidad={cantidad}
          max={max}
          onCambiar={onCambiarCantidad}
          deshabilitado={procesando}
        />

        <p className="w-24 text-right font-bold">${precio * cantidad}</p>

        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={`Quitar ${nombre}`}
          className="cursor-pointer text-destructive hover:text-destructive"
          disabled={procesando}
          onClick={onEliminar}
        >
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  );
}

export default CartItem;
