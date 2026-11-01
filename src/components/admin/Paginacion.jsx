import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function Paginacion({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginación" className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={pagina === 1}
        onClick={() => onCambiar(pagina - 1)}
      >
        <ChevronLeft />
      </Button>
      {paginas.map((numero) => (
        <Button
          key={numero}
          variant={numero === pagina ? "default" : "outline"}
          size="icon"
          aria-current={numero === pagina ? "page" : undefined}
          onClick={() => onCambiar(numero)}
        >
          {numero}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        aria-label="Página siguiente"
        disabled={pagina === totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}

export default Paginacion;
