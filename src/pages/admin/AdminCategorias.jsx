import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminEncabezado from "../../components/admin/AdminEncabezado.jsx";
import ConfirmarEliminar from "../../components/admin/ConfirmarEliminar.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import FormField from "../../components/FormField.jsx";
import { useListado } from "../../hooks/useListado.js";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from "../../services/categoriesService.js";

function AdminCategorias() {
  const { datos: categorias, setDatos: setCategorias, error } = useListado(getCategorias);
  // null = el form crea una categoría nueva; si tiene una, la edita
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState(null);
  const [errorApi, setErrorApi] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aEliminar, setAEliminar] = useState(null);

  const editar = (categoria) => {
    setEditando(categoria);
    setNombre(categoria.name);
    setErrorNombre(null);
    setErrorApi(null);
  };

  const cancelar = () => {
    setEditando(null);
    setNombre("");
    setErrorNombre(null);
    setErrorApi(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorNombre("El nombre es obligatorio");
      return;
    }

    setGuardando(true);
    setErrorNombre(null);
    setErrorApi(null);
    try {
      const datos = { name: nombre.trim() };
      if (editando) {
        const actualizada = await actualizarCategoria(editando.id, datos);
        setCategorias((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
      } else {
        const creada = await crearCategoria(datos);
        setCategorias((lista) => [...lista, creada]);
      }
      cancelar();
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    await eliminarCategoria(aEliminar.id);
    setCategorias((lista) => lista.filter((c) => c.id !== aEliminar.id));
    if (editando?.id === aEliminar.id) cancelar();
  };

  return (
    <>
      <AdminEncabezado titulo="Categorías" descripcion="Organizá el catálogo por categorías" />

      {error ? (
        <ErrorAlert titulo="No pudimos cargar las categorías" mensaje={error.message} />
      ) : !categorias ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {categorias.length === 0 ? (
            <EmptyState titulo="Todavía no hay categorías" descripcion="Creá la primera con el formulario." />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((categoria) => (
                    <TableRow key={categoria.id} data-state={editando?.id === categoria.id ? "selected" : undefined}>
                      <TableCell>{categoria.id}</TableCell>
                      <TableCell className="font-medium">{categoria.name}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar ${categoria.name}`}
                            onClick={() => editar(categoria)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Eliminar ${categoria.name}`}
                            onClick={() => setAEliminar(categoria)}
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
          )}

          <Card>
            <CardContent>
              <form onSubmit={guardar} noValidate>
                <fieldset disabled={guardando} className="flex min-w-0 flex-col gap-4">
                  <div>
                    <h2 className="font-bold">{editando ? `Editar categoría #${editando.id}` : "Nueva categoría"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {editando
                        ? "Cambiá el nombre y guardá, o cancelá para crear una nueva."
                        : "Al tocar el lápiz en la tabla, este formulario pasa a modo edición."}
                    </p>
                  </div>
                  <FormField
                    id="name"
                    label="Nombre"
                    placeholder="Ej: Juguetes"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    error={errorNombre}
                  />
                  {errorApi && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorApi}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="lg" onClick={cancelar}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="lg">
                      {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear categoría"}
                    </Button>
                  </div>
                </fieldset>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo={`¿Eliminar la categoría ${aEliminar?.name ?? ""}?`}
        descripcion="Esta acción no se puede deshacer. Los productos dejan de tener esta categoría."
        onConfirmar={eliminar}
      />
    </>
  );
}

export default AdminCategorias;
