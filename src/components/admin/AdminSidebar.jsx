import { NavLink, useNavigate } from "react-router-dom";
import { List, LogOut, Package, ShoppingBag, ShoppingCart, Tag, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "../../hooks/useAuth.js";

const secciones = [
  { to: "/admin/productos", label: "Productos", icono: Package },
  { to: "/admin/categorias", label: "Categorías", icono: Tag },
  { to: "/admin/ordenes", label: "Órdenes", icono: List },
  { to: "/admin/carritos", label: "Carritos", icono: ShoppingCart },
  { to: "/admin/clientes", label: "Clientes", icono: Users },
];

const claseItem = "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";

function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="flex shrink-0 flex-col gap-4 border-b bg-background p-3 md:sticky md:top-0 md:h-svh md:w-60 md:border-r md:border-b-0 md:p-4">
      <div className="flex items-center gap-2 px-2 py-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShoppingBag className="size-5" />
        </span>
        <span className="text-lg font-bold">Admin</span>
      </div>

      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {secciones.map(({ to, label, icono: Icono }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                claseItem,
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icono className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator className="hidden md:block" />
      <button
        type="button"
        onClick={salir}
        className={cn(claseItem, "text-muted-foreground hover:bg-muted hover:text-foreground")}
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default AdminSidebar;
