import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function TopNav() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get("q") ?? "");

  const buscar = (e) => {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="size-5" />
          </span>
          <span className="hidden text-lg font-bold sm:inline">Tienda UADE</span>
        </Link>

        <form onSubmit={buscar} className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos…"
            className="h-10 pl-9"
          />
        </form>

        <nav className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-lg" aria-label="Carrito">
            <ShoppingCart className="size-5" />
          </Button>
          <Button variant="outline" size="lg" className="hidden md:inline-flex">
            Ingresar
          </Button>
          <Button size="lg" className="hidden md:inline-flex">
            Crear cuenta
          </Button>
        </nav>
      </div>
    </header>
  );
}

export default TopNav;
