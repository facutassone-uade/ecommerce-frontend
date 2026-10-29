// Mismas reglas que el back (@NotBlank, @Email): validamos antes de enviar
// porque hoy el back responde 500 ante errores de validación.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validarCampos = (valores, requeridos) => {
  const errores = {};
  for (const [campo, etiqueta] of Object.entries(requeridos)) {
    if (!valores[campo]?.trim()) errores[campo] = `${etiqueta} es obligatorio`;
  }
  if (valores.email?.trim() && !EMAIL.test(valores.email.trim())) {
    errores.email = "Ingresá un email válido";
  }
  return errores;
};

export const validarDatosEnvio = (valores) => {
  const errores = {};
  const telefono = String(valores?.phone ?? "").trim();
  const direccion = valores?.address;

  if (!String(valores?.nationalId ?? "").trim()) errores.nationalId = "El DNI es obligatorio";
  if (!telefono) errores.phone = "El teléfono es obligatorio";
  if (!direccion?.street?.trim()) errores.street = "La calle es obligatoria";
  if (!direccion?.city?.trim()) errores.city = "La ciudad es obligatoria";
  if (!direccion?.zipCode?.trim()) errores.zipCode = "El código postal es obligatorio";
  if (!direccion?.country?.trim()) errores.country = "El país es obligatorio";

  if (telefono.length > 15) {
    errores.phone = "El teléfono debe tener como máximo 15 caracteres.";
  }
  return errores;
};
