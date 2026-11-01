import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function Buscador({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-5 w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 pl-9"
      />
    </div>
  );
}

export default Buscador;
