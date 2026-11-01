// Título, bajada y acciones (por ejemplo "+ Nuevo producto") de cada pantalla del admin
function AdminEncabezado({ titulo, descripcion, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {children}
    </div>
  );
}

export default AdminEncabezado;
