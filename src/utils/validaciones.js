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
