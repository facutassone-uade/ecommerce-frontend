import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CategoryFilter from "../components/CategoryFilter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { getCategorias } from "../services/categoriesService.js";
import { getProductos } from "../services/productsService.js";

function Home() {
  const [params] = useSearchParams();
  const { usuario, logout } = useAuth();
  const { agregar } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorCarrito, setErrorCarrito] = useState(null);

  const agregarAlCarrito = async (productoId) => {
    if (!usuario) {
      navigate("/login", { state: { desde: location.pathname } });
      return;
    }
    setErrorCarrito(null);
    try {
      await agregar(productoId, 1);
    } catch (err) {
      if (err.status === 401) logout();
      setErrorCarrito(err.message);
    }
  };
  const busqueda = (params.get("q") ?? "").toLowerCase();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaId, setCategoriaId] = useState(
    params.get("categoria") ? Number(params.get("categoria")) : null,
  );

  useEffect(() => {
    const obtenerCatalogo = async () => {
      setCargando(true);
      setError(null);
      try {
        const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
        setProductos(prods);
        setCategorias(cats);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerCatalogo();
  }, []);

  const visibles = productos.filter(
    (p) =>
      (categoriaId === null || p.categories.some((c) => c.id === categoriaId)) &&
      p.name.toLowerCase().includes(busqueda),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <section className="flex flex-col items-start justify-between gap-4 rounded-xl bg-primary px-6 py-10 text-primary-foreground sm:flex-row sm:items-center sm:px-10">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Ofertas de la semana</h1>
          <p className="mt-2 text-primary-foreground/70">
            Hasta 30% off en productos seleccionados
          </p>
        </div>
        <Button variant="outline" size="lg" className="text-foreground">
          Ver ofertas
        </Button>
      </section>

      {error ? (
        <ErrorAlert
          titulo="No pudimos cargar los productos"
          mensaje={error}
        />
      ) : (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold">Categorías</h2>
            <CategoryFilter
              categorias={categorias}
              seleccionada={categoriaId}
              onSeleccionar={setCategoriaId}
            />
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold">Productos</h2>
              {!cargando && (
                <span className="text-sm text-muted-foreground">
                  {visibles.length} {visibles.length === 1 ? "resultado" : "resultados"}
                </span>
              )}
            </div>

            {errorCarrito && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorCarrito}</AlertDescription>
              </Alert>
            )}

            {cargando ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : visibles.length === 0 ? (
              <EmptyState
                titulo="No encontramos productos"
                descripcion="Probá con otra búsqueda o categoría."
              >
                <Button size="lg" onClick={() => setCategoriaId(null)}>
                  Ver todos
                </Button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visibles.map((p) => (
                  <ProductCard
                    key={p.id}
                    to={`/productos/${p.id}`}
                    nombre={p.name}
                    descripcion={p.description}
                    precio={p.price}
                    stock={p.stock}
                    imagenUrl={p.imageUrl}
                    categorias={p.categories}
                    onAgregar={() => agregarAlCarrito(p.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Home;
