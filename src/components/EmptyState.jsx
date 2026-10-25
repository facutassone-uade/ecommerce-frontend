import { Inbox } from "lucide-react";

function EmptyState({ titulo, descripcion, children }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-7" />
      </span>
      <h3 className="text-lg font-bold">{titulo}</h3>
      {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
      {children}
    </div>
  );
}

export default EmptyState;
