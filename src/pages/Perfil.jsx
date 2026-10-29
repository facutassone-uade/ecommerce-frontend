import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { actualizarCliente, solicitarCliente } from "../services/customersService.js";
import { validarDatosEnvio } from "../utils/validaciones.js";

function Perfil() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const volverAlCheckout = location.state?.desde === "/checkout";
  const [datosOriginales, setDatosOriginales] = useState(null);
  const [datosCliente, setDatosCliente] = useState(null);
  const [errorApi, setErrorApi] = useState(null);
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [estaGuardando, setEstaGuardando] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    async function cargarDatosCliente() {
      setDatosOriginales(null);
      setDatosCliente(null);
      setErrorApi(null);

      try {
        const datos = await solicitarCliente(usuario.customerId);
        setDatosOriginales(datos);
        setDatosCliente(datos);
      } catch (err) {
        if (err.status === 401) logout();
        setErrorApi(err);
      }
    }

    cargarDatosCliente();
  }, [usuario, logout]);

  const cambiarDato = (e) => {
    const { name, value } = e.target;
    const esDireccion = ["street", "city", "zipCode", "country"].includes(name);
    const datosActualizados = { ...datosCliente };

    if (esDireccion) {
      datosActualizados.address = {
        ...datosCliente.address,
        [name]: value,
      };
    } else {
      datosActualizados[name] = value;
    }

    setDatosCliente(datosActualizados);
  };

  const cancelarCambios = () => {
    setDatosCliente(datosOriginales);
    setErroresFormulario({});
    setErrorApi(null);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarDatosEnvio(datosCliente);
    setErroresFormulario(nuevosErrores);
    setErrorApi(null);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEstaGuardando(true);
    try {
      const datos = await actualizarCliente(usuario.customerId, {
        nationalId: Number(datosCliente.nationalId),
        phone: Number(datosCliente.phone),
        address: {
          street: datosCliente.address.street.trim(),
          city: datosCliente.address.city.trim(),
          zipCode: datosCliente.address.zipCode.trim(),
          country: datosCliente.address.country.trim(),
        },
      });
      setDatosOriginales(datos);
      setDatosCliente(datos);
      if (volverAlCheckout) navigate("/checkout", { replace: true });
    } catch (err) {
      if (err.status === 401) logout();
      setErrorApi(err);
    } finally {
      setEstaGuardando(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Mi perfil</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {volverAlCheckout
          ? "Completá tus datos de envío. Al guardar volverás al checkout."
          : "Estos datos se usan para el envío de tus compras."}
      </p>

      {!usuario ? (
        <EmptyState titulo="Iniciá sesión para ver tu perfil">
          <Button asChild>
            <Link to="/login" state={{ desde: volverAlCheckout ? "/checkout" : "/perfil" }}>
              Ingresar
            </Link>
          </Button>
        </EmptyState>
      ) : errorApi && !datosCliente ? (
        <ErrorAlert titulo="No pudimos cargar tu perfil" mensaje={errorApi.message} />
      ) : !datosCliente ? (
        <p>Cargando perfil...</p>
      ) : (
        <form onSubmit={guardarCambios} noValidate>
          <fieldset disabled={estaGuardando} className="flex min-w-0 flex-col gap-5">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <h2 className="font-bold">Cuenta</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField id="firstName" label="Nombre" value={usuario.firstName ?? ""} className="h-10 bg-muted text-muted-foreground" readOnly />
                  <FormField id="lastName" label="Apellido" value={usuario.lastName ?? ""} className="h-10 bg-muted text-muted-foreground" readOnly />
                  <FormField id="email" label="Email" type="email" value={usuario.email ?? ""} className="h-10 bg-muted text-muted-foreground" readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-4">
                <h2 className="font-bold">Datos personales</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    id="nationalId"
                    label="DNI *"
                    inputMode="numeric"
                    value={datosCliente.nationalId ?? ""}
                    onChange={cambiarDato}
                    error={erroresFormulario.nationalId}
                  />
                  <FormField
                    id="phone"
                    label="Teléfono *"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={15}
                    value={datosCliente.phone ?? ""}
                    onChange={cambiarDato}
                    error={erroresFormulario.phone}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-4">
                <h2 className="font-bold">Dirección</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <FormField
                      id="street"
                      label="Calle *"
                      autoComplete="street-address"
                      value={datosCliente.address?.street ?? ""}
                      onChange={cambiarDato}
                      error={erroresFormulario.street}
                    />
                  </div>
                  <FormField
                    id="city"
                    label="Ciudad *"
                    autoComplete="address-level2"
                    value={datosCliente.address?.city ?? ""}
                    onChange={cambiarDato}
                    error={erroresFormulario.city}
                  />
                  <FormField
                    id="zipCode"
                    label="Código postal *"
                    autoComplete="postal-code"
                    value={datosCliente.address?.zipCode ?? ""}
                    onChange={cambiarDato}
                    error={erroresFormulario.zipCode}
                  />
                  <FormField
                    id="country"
                    label="País *"
                    autoComplete="country-name"
                    value={datosCliente.address?.country ?? ""}
                    onChange={cambiarDato}
                    error={erroresFormulario.country}
                  />
                </div>
              </CardContent>
            </Card>

            {errorApi && (
              <Alert variant="destructive">
                <AlertDescription>{errorApi.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg" className="h-10">
                {estaGuardando ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-10"
                onClick={cancelarCambios}
              >
                Cancelar
              </Button>
            </div>
          </fieldset>
        </form>
      )}
    </main>
  );
}

export default Perfil;
