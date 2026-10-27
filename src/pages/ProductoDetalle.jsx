import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { getProductoById } from "../services/productsService.js";

function ProductoDetalle() {
  const { id } = useParams();
  const { usuario, logout } = useAuth();
  const { agregar } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensajeCarrito, setMensajeCarrito] = useState(null);

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
  }, [id]);


  const agregarAlCarrito = async () => {
    if (!usuario) {
      setMensajeCarrito({ tipo: "login" });
      return false;
    }
    setMensajeCarrito(null);
    try {
      await agregar(producto.id, cantidad);
      setMensajeCarrito({ tipo: "ok" });
      return true;
    } catch (err) {
      if (err.status === 401) logout();
      setMensajeCarrito({ tipo: "error", mensaje: err.message });
      return false;
    }
  };

  const comprarAhora = async () => {
    const agregado = await agregarAlCarrito();
    if (agregado) {
      navigate("/carrito");
    }
  };

  const sinStock = producto?.stock === 0;

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
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/?categoria=${producto.categories[0].id}`}>
                        {producto.categories[0].name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
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

      {cargando ? (
        <ProductDetailSkeleton />
      ) : error?.status === 404 ? (
        <EmptyState
          titulo="Producto no encontrado"
          descripcion="Puede que se haya dado de baja o que el enlace sea incorrecto."
        >
          <Button size="lg" asChild>
            <Link to="/">Volver al catálogo</Link>
          </Button>
        </EmptyState>
      ) : error ? (
        <ErrorAlert
          titulo="No pudimos cargar el producto"
          mensaje={error.message}
        />
      ) : (
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-3">
          <div className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
            {producto.imageUrl ? (
              <img src={producto.imageUrl} alt={producto.name} className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-16" />
            )}
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
          <p className="text-3xl font-extrabold">${producto.price}</p>
          {sinStock ? (
            <Badge variant="destructive">Sin stock</Badge>
          ) : (
            <Badge variant="success">
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

          {sinStock && (
            <p role="status" className="text-sm text-destructive">
              Este producto está agotado. Por el momento no se puede comprar.
            </p>
          )}

          {!sinStock && (
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-sm font-medium">Cantidad</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <QuantitySelector cantidad={cantidad} max={producto.stock} onCambiar={setCantidad} />
                <Button size="lg" className="h-10 w-full cursor-pointer sm:w-auto sm:flex-1" onClick={agregarAlCarrito}>
                  Agregar al carrito
                </Button>
              </div>
              <Button variant="outline" size="lg" className="h-10 w-full cursor-pointer sm:w-auto" onClick={comprarAhora}>
                Comprar ahora
              </Button>
            </div>
          )}

          {mensajeCarrito && (
            <Alert variant={mensajeCarrito.tipo === "error" ? "destructive" : "default"}>
              <Info />
              <AlertDescription>
                {mensajeCarrito.tipo === "login" && (
                  <span>
                    <Link to="/login" state={{ desde: location.pathname }}>
                      Iniciá sesión
                    </Link>{" "}
                    para agregar productos al carrito.
                  </span>
                )}
                {mensajeCarrito.tipo === "ok" && (
                  <span>
                    Agregado al carrito. <Link to="/carrito">Ver carrito</Link>
                  </span>
                )}
                {mensajeCarrito.tipo === "error" && mensajeCarrito.mensaje}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      )}
    </main>
  );
}

export default ProductoDetalle;
