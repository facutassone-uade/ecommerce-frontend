import { useEffect, useState } from "react";
import { useAuth } from "./useAuth.js";

// Carga un listado del back para las tablas del admin.
// datos es null mientras carga; con setDatos la pantalla lo actualiza después de crear, editar o borrar.
export const useListado = (cargar) => {
  const { logout } = useAuth();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    cargar()
      .then((respuesta) => vigente && setDatos(respuesta))
      .catch((err) => {
        if (!vigente) return;
        if (err.status === 401) logout();
        setError(err);
      });
    return () => {
      vigente = false;
    };
  }, [cargar, logout]);

  return { datos, setDatos, error };
};
