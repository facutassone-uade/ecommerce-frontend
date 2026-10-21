import { Button } from "@/components/ui/button";

function CategoryFilter({ categorias, seleccionada, onSeleccionar }) {
  const opciones = [{ id: null, name: "Todas" }, ...categorias];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {opciones.map((c) => (
        <Button
          key={c.id ?? "todas"}
          size="lg"
          variant={seleccionada === c.id ? "default" : "outline"}
          onClick={() => onSeleccionar(c.id)}
        >
          {c.name}
        </Button>
      ))}
    </div>
  );
}

export default CategoryFilter;
