import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function QuantitySelector({ cantidad, min = 1, max, onCambiar }) {
  return (
    <div className="inline-flex h-10 items-center rounded-lg border">
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Restar"
        disabled={cantidad <= min}
        onClick={() => onCambiar(cantidad - 1)}
      >
        <Minus />
      </Button>
      <span className="w-10 text-center text-sm font-semibold">{cantidad}</span>
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Sumar"
        disabled={max !== undefined && cantidad >= max}
        onClick={() => onCambiar(cantidad + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

export default QuantitySelector;
