import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Package, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth.js";

function UserMenu() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const iniciales = `${usuario.firstName?.[0] ?? ""}${usuario.lastName?.[0] ?? ""}`.toUpperCase();

  const salir = () => {
    logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg" className="gap-2 px-1.5">
          <Avatar className="size-8">
            <AvatarFallback>{iniciales}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{usuario.firstName}</span>
          <ChevronDown className="hidden text-muted-foreground md:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-foreground">
            {usuario.firstName} {usuario.lastName}
          </span>
          <span className="text-xs font-normal">{usuario.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/perfil")}>
          <User /> Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Package /> Mis órdenes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={salir}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
