import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageIcon, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import ProductDetailSkeleton from "../components/ProductDetailSkeleton.jsx";
import QuantitySelector from "../components/QuantitySelector.jsx";
import { getProductoById } from "../services/productsService.js";

function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    const obtenerProducto = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await getProductoById(id);
        setProducto(data);
        setCantidad(1);
      } catch (err) {
        setError(err);
      } finally {
        setCargando(false);
      }
    };

    obtenerProducto();
  }, [id, intento]);

  // Carrito requiere usuario logueado (POST /api/carts y /items son authenticated)
  const agregarAlCarrito = () => setAviso(true);

  const contenido = () => {
    if (cargando) return <ProductDetailSkeleton />;

    if (error?.status === 404) {
      return (
        <EmptyState
          titulo="Producto no encontrado"
          descripcion="Puede que se haya dado de baja o que el enlace sea incorrecto."
        >
          <Button size="lg" asChild>
            <Link to="/">Volver al catálogo</Link>
          </Button>
        </EmptyState>
      );
    }

    if (error) {
      return (
        <ErrorAlert
          titulo="No pudimos cargar el producto"
          mensaje={`El servidor no responde o está apagado (${error.message}). Probá de nuevo en unos segundos.`}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      );
    }

    const sinStock = producto.stock === 0;

    return (
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-3">
          {/* El back todavía no expone imageUrl: placeholder hasta que se agregue */}
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ImageIcon className="size-16" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {producto.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {producto.categories.map((c) => (
                <Badge key={c.id} variant="secondary">
                  {c.name}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-extrabold sm:text-3xl">{producto.name}</h1>
          <p className="text-3xl font-extrabold">${producto.price.toLocaleString("es-AR")}</p>
          {sinStock ? (
            <Badge variant="destructive">Sin stock</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700">
              En stock · {producto.stock} {producto.stock === 1 ? "unidad" : "unidades"}
            </Badge>
          )}

          <Separator className="my-2" />

          {producto.description && (
            <div>
              <h2 className="mb-1 font-semibold">Descripción</h2>
              <p className="text-sm text-muted-foreground">{producto.description}</p>
            </div>
          )}

          {!sinStock && (
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-sm font-medium">Cantidad</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <QuantitySelector cantidad={cantidad} max={producto.stock} onCambiar={setCantidad} />
                <Button size="lg" className="h-10 flex-1" onClick={agregarAlCarrito}>
                  Agregar al carrito
                </Button>
              </div>
              <Button variant="outline" size="lg" className="h-10" onClick={agregarAlCarrito}>
                Comprar ahora
              </Button>
            </div>
          )}

          {aviso && (
            <Alert>
              <Info />
              <AlertDescription>Iniciá sesión para agregar productos al carrito.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {producto && !cargando && (
            <>
              {producto.categories[0] && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{producto.categories[0].name}</BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{producto.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {contenido()}
    </main>
  );
}

export default ProductoDetalle;
