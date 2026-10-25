import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CategoryFilter from "../components/CategoryFilter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import { getCategorias } from "../services/categoriesService.js";
import { getProductos } from "../services/productsService.js";

function Home() {
  const [params] = useSearchParams();
  const busqueda = (params.get("q") ?? "").toLowerCase();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaId, setCategoriaId] = useState(
    params.get("categoria") ? Number(params.get("categoria")) : null,
  );
  const [intento, setIntento] = useState(0);

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
  }, [intento]);

  // El back no tiene filtro por query/categoría todavía: se filtra en el front
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
          mensaje={`El servidor no responde o está apagado (${error}). Probá de nuevo en unos segundos.`}
          onReintentar={() => setIntento((n) => n + 1)}
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
