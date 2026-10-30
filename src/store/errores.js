// Redux no guarda instancias de Error: nos quedamos con lo que usan las pantallas
export const aErrorSerializable = (err) => ({
  message: err.message,
  status: err.status,
});
