import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatearPrecio } from "../utils/formato.js";

function ProductCard({ to, nombre, descripcion, precio, stock, imagenUrl, categorias = [], onAgregar }) {
  const sinStock = stock === 0;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Link
        to={to}
        className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted text-muted-foreground"
      >
        {imagenUrl ? (
          <img src={imagenUrl} alt={nombre} loading="lazy" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-10" />
        )}
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
        <p className="mt-auto text-xl font-bold">{formatearPrecio(precio)}</p>
        {sinStock ? (
          <Badge variant="destructive">Sin stock</Badge>
        ) : (
          <Badge variant="success">Stock: {stock}</Badge>
        )}
      </CardContent>

      <CardFooter className="flex-wrap gap-2 border-t-0 bg-transparent p-4 pt-0">
        <Button variant="outline" size="lg" className="flex-1" asChild>
          <Link to={to}>Ver detalle</Link>
        </Button>
        <Button size="lg" className="flex-1 cursor-pointer" disabled={sinStock} onClick={onAgregar}>
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
