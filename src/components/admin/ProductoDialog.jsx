import { useState } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormField from "../FormField.jsx";
import {
  actualizarProducto,
  asignarCategoria,
  crearProducto,
  getProductoById,
  quitarCategoria,
} from "../../services/productsService.js";

const validarProducto = (valores) => {
  const errores = {};
  const precio = Number(valores.price);
  const stock = Number(valores.stock);
  if (!valores.name.trim()) errores.name = "El nombre es obligatorio";
  if (String(valores.price).trim() === "" || !(precio > 0)) errores.price = "Ingresá un precio mayor a 0";
  if (String(valores.stock).trim() === "" || !Number.isInteger(stock) || stock < 0) {
    errores.stock = "El stock tiene que ser un número entero desde 0";
  }
  return errores;
};

// producto = null para crear uno nuevo. La pantalla lo monta con un key distinto por producto,
// así el formulario arranca de cero cada vez que se abre.
function ProductoDialog({ producto, categorias, onCerrar, onGuardado }) {
  const [valores, setValores] = useState({
    name: producto?.name ?? "",
    description: producto?.description ?? "",
    price: producto?.price ?? "",
    stock: producto?.stock ?? "",
    imageUrl: producto?.imageUrl ?? "",
  });
  const [elegidas, setElegidas] = useState(producto?.categories ?? []);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const disponibles = categorias.filter((c) => !elegidas.some((e) => e.id === c.id));

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value });

  const agregarCategoria = (id) => {
    const categoria = categorias.find((c) => String(c.id) === id);
    if (categoria) setElegidas([...elegidas, categoria]);
  };

  const guardar = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarProducto(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setGuardando(true);
    setErrorApi(null);
    try {
      const datos = {
        name: valores.name.trim(),
        description: valores.description.trim(),
        price: Number(valores.price),
        stock: Number(valores.stock),
        imageUrl: valores.imageUrl.trim() || null,
      };
      const guardado = producto
        ? await actualizarProducto(producto.id, datos)
        : await crearProducto(datos);

      // Las categorías se asignan de a una con su propio endpoint
      const originales = (producto?.categories ?? []).map((c) => c.id);
      const nuevas = elegidas.map((c) => c.id);
      for (const id of nuevas.filter((id) => !originales.includes(id))) {
        await asignarCategoria(guardado.id, id);
      }
      for (const id of originales.filter((id) => !nuevas.includes(id))) {
        await quitarCategoria(guardado.id, id);
      }
      onGuardado(await getProductoById(guardado.id));
    } catch (err) {
      setErrorApi(err.message);
      setGuardando(false);
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onCerrar()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Modificá los datos y guardá los cambios." : "Completá los datos del producto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} noValidate>
          <fieldset disabled={guardando} className="flex min-w-0 flex-col gap-4">
            <FormField id="name" label="Nombre" value={valores.name} onChange={cambiar} error={errores.name} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={valores.description}
                onChange={cambiar}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="price"
                label="Precio"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={valores.price}
                onChange={cambiar}
                error={errores.price}
              />
              <FormField
                id="stock"
                label="Stock"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={valores.stock}
                onChange={cambiar}
                error={errores.stock}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categorías</Label>
              <div className="flex flex-wrap items-center gap-2">
                {elegidas.map((categoria) => (
                  <span
                    key={categoria.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm font-medium"
                  >
                    {categoria.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-full"
                      aria-label={`Quitar ${categoria.name}`}
                      onClick={() => setElegidas(elegidas.filter((c) => c.id !== categoria.id))}
                    >
                      <X />
                    </Button>
                  </span>
                ))}
                <Select value="" onValueChange={agregarCategoria} disabled={disponibles.length === 0}>
                  <SelectTrigger className="h-9 w-48" aria-label="Agregar categoría">
                    <SelectValue placeholder="Agregar categoría…" />
                  </SelectTrigger>
                  <SelectContent>
                    {disponibles.map((categoria) => (
                      <SelectItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <FormField
              id="imageUrl"
              label="URL de imagen"
              type="url"
              placeholder="https://…/producto.jpg"
              value={valores.imageUrl}
              onChange={cambiar}
            />

            {errorApi && (
              <Alert variant="destructive">
                <AlertDescription>{errorApi}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" size="lg" onClick={onCerrar}>
                Cancelar
              </Button>
              <Button type="submit" size="lg">
                {guardando ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductoDialog;
