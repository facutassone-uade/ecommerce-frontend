import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

// Sin sesión va al login (y vuelve acá al ingresar); con sesión pero sin rol ADMIN, a la tienda
function RutaAdmin({ children }) {
  const { usuario, esAdmin, inicializando } = useAuth();
  const location = useLocation();

  if (inicializando) {
    return <p role="status" className="p-6 text-muted-foreground">Verificando sesión…</p>;
  }
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (!esAdmin) return <Navigate to="/" replace />;
  return children;
}

export default RutaAdmin;
