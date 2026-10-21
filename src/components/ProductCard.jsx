import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function ProductCard({ to, nombre, descripcion, precio, stock, categorias = [], onAgregar }) {
  const sinStock = stock === 0;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* El back todavía no expone imageUrl: placeholder hasta que se agregue */}
      <Link
        to={to}
        className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground"
      >
        <ImageIcon className="size-10" />
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categorias.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
              </Badge>
            ))}
          </div>
        )}
        <h3 className="font-semibold">
          <Link to={to} className="hover:underline">
            {nombre}
          </Link>
        </h3>
        {descripcion && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{descripcion}</p>
        )}
        <p className="mt-auto text-xl font-bold">${precio.toLocaleString("es-AR")}</p>
        {sinStock ? (
          <Badge variant="destructive">Sin stock</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700">Stock: {stock}</Badge>
        )}
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent p-4 pt-0">
        <Button size="lg" className="w-full" disabled={sinStock} onClick={onAgregar}>
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
