import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AuthCard from "../components/AuthCard.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { validarCampos } from "../utils/validaciones.js";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [valores, setValores] = useState({ email: "", password: "" });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarCampos(valores, { email: "El email", password: "La contraseña" });
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    setErrorApi(null);
    try {
      const usuario = await login(valores.email.trim(), valores.password);
      const inicio = usuario.role === "ADMIN" ? "/admin" : "/";
      navigate(location.state?.desde ?? inicio, { replace: true });
    } catch (err) {
      setErrorApi(
        err.status === 401
          ? "El email o la contraseña no son correctos."
          : `No pudimos iniciar sesión (${err.message}). Probá de nuevo en unos segundos.`,
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthCard titulo="Iniciar sesión" descripcion="Ingresá con tu email y contraseña">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {errorApi && (
          <Alert variant="destructive" className="border-destructive">
            <AlertCircle />
            <AlertTitle>Credenciales inválidas</AlertTitle>
            <AlertDescription>{errorApi}</AlertDescription>
          </Alert>
        )}
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          value={valores.email}
          onChange={cambiar}
          error={errores.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={valores.password}
          onChange={cambiar}
          error={errores.password}
        />
        <Button type="submit" size="lg" className="h-10" disabled={enviando}>
          {enviando ? "Ingresando…" : "Ingresar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link to="/registro" state={location.state} className="font-semibold text-foreground hover:underline">
            Crear cuenta
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default Login;
