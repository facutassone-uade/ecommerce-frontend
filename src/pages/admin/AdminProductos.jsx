import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminEncabezado from "../../components/admin/AdminEncabezado.jsx";
import Buscador from "../../components/admin/Buscador.jsx";
import ConfirmarEliminar from "../../components/admin/ConfirmarEliminar.jsx";
import Paginacion from "../../components/admin/Paginacion.jsx";
import ProductoDialog from "../../components/admin/ProductoDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import { useListado } from "../../hooks/useListado.js";
import { getCategorias } from "../../services/categoriesService.js";
import { eliminarProducto, getProductos } from "../../services/productsService.js";
import { formatearPrecio } from "../../utils/formato.js";

const POR_PAGINA = 10;

function AdminProductos() {
  const { datos: productos, setDatos: setProductos, error } = useListado(getProductos);
  const { datos: categorias } = useListado(getCategorias);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  // undefined = cerrado, null = nuevo producto, objeto = editar ese producto
  const [editando, setEditando] = useState(undefined);
  const [aEliminar, setAEliminar] = useState(null);

  const buscar = (texto) => {
    setBusqueda(texto);
    setPagina(1);
  };

  const guardado = (producto) => {
    setProductos((lista) =>
      lista.some((p) => p.id === producto.id)
        ? lista.map((p) => (p.id === producto.id ? producto : p))
        : [...lista, producto],
    );
    setEditando(undefined);
  };

  const eliminar = async () => {
    await eliminarProducto(aEliminar.id);
    setProductos((lista) => lista.filter((p) => p.id !== aEliminar.id));
  };

  const filtrados = (productos ?? []).filter((p) =>
    p.name.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  return (
    <>
      <AdminEncabezado titulo="Productos" descripcion="Alta, edición y baja de productos del catálogo">
        <Button size="lg" onClick={() => setEditando(null)} disabled={!productos}>
          <Plus /> Nuevo producto
        </Button>
      </AdminEncabezado>

      {error ? (
        <ErrorAlert titulo="No pudimos cargar los productos" mensaje={error.message} />
      ) : !productos ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          <Buscador value={busqueda} onChange={buscar} placeholder="Buscar producto..." />
          {filtrados.length === 0 ? (
            <EmptyState
              titulo={busqueda ? "No hay productos que coincidan" : "Todavía no hay productos"}
              descripcion={busqueda ? "Probá con otro nombre." : "Creá el primero con “Nuevo producto”."}
            />
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categorías</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibles.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>{producto.id}</TableCell>
                        <TableCell className="font-medium">{producto.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {producto.categories?.map((categoria) => (
                              <Badge key={categoria.id} variant="secondary">
                                {categoria.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatearPrecio(producto.price)}</TableCell>
                        <TableCell>
                          {producto.stock > 0 ? (
                            <Badge variant="success">{producto.stock} u.</Badge>
                          ) : (
                            <Badge variant="destructive">Sin stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Editar ${producto.name}`}
                              onClick={() => setEditando(producto)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label={`Eliminar ${producto.name}`}
                              onClick={() => setAEliminar(producto)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Mostrando {visibles.length} de {filtrados.length}
                </p>
                <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} onCambiar={setPagina} />
              </div>
            </>
          )}
        </>
      )}

      {editando !== undefined && (
        <ProductoDialog
          key={editando?.id ?? "nuevo"}
          producto={editando}
          categorias={categorias ?? []}
          onCerrar={() => setEditando(undefined)}
          onGuardado={guardado}
        />
      )}
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo={`¿Eliminar el producto ${aEliminar?.name ?? ""}?`}
        descripcion="Esta acción no se puede deshacer. El producto deja de aparecer en la tienda."
        onConfirmar={eliminar}
      />
    </>
  );
}

export default AdminProductos;
