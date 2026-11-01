import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// onConfirmar devuelve una promesa: si falla, el diálogo queda abierto y muestra el error
function ConfirmarEliminar({ abierto, onCerrar, titulo, descripcion, onConfirmar }) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);

  const cambiarAbierto = (valor) => {
    if (valor || eliminando) return;
    setError(null);
    onCerrar();
  };

  const confirmar = async () => {
    setEliminando(true);
    setError(null);
    try {
      await onConfirmar();
      onCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <AlertDialog open={abierto} onOpenChange={cambiarAbierto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={confirmar} disabled={eliminando}>
            {eliminando ? "Eliminando…" : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmarEliminar;
