export const formatearPrecio = (valor) => `$ ${Number(valor ?? 0).toLocaleString("es-AR")}`;

// El back manda las fechas como "2026-10-21": las armamos a mano para que no corra el día por la zona horaria
export const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
};
