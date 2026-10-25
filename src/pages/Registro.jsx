import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AuthCard from "../components/AuthCard.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { validarCampos } from "../utils/validaciones.js";

const REQUERIDOS = {
  firstName: "El nombre",
  lastName: "El apellido",
  email: "El email",
  password: "La contraseña",
};

function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [valores, setValores] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarCampos(valores, REQUERIDOS);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    setErrorApi(null);
    try {
      // El back devuelve el token al registrarse: queda logueado directamente
      await registrar({
        firstName: valores.firstName.trim(),
        lastName: valores.lastName.trim(),
        email: valores.email.trim(),
        password: valores.password,
      });
      navigate(location.state?.desde ?? "/", { replace: true });
    } catch (err) {
      setErrorApi(
        err.status === 409
          ? "Ya existe una cuenta con ese email. Probá iniciar sesión."
          : `${err.message}. Revisá los datos e intentá de nuevo.`,
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthCard titulo="Crear cuenta" descripcion="Completá tus datos para registrarte">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {errorApi && (
          <Alert variant="destructive" className="border-destructive">
            <AlertCircle />
            <AlertTitle>No pudimos crear la cuenta</AlertTitle>
            <AlertDescription>{errorApi}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="firstName"
            label="Nombre"
            autoComplete="given-name"
            placeholder="Juan"
            value={valores.firstName}
            onChange={cambiar}
            error={errores.firstName}
          />
          <FormField
            id="lastName"
            label="Apellido"
            autoComplete="family-name"
            placeholder="Pérez"
            value={valores.lastName}
            onChange={cambiar}
            error={errores.lastName}
          />
        </div>
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
          autoComplete="new-password"
          placeholder="••••••••"
          value={valores.password}
          onChange={cambiar}
          error={errores.password}
        />
        <Button type="submit" size="lg" className="h-10" disabled={enviando}>
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" state={location.state} className="font-semibold text-foreground hover:underline">
            Ingresar
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default Registro;
