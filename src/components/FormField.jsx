import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FormField({ id, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} className="h-10" aria-invalid={!!error} {...inputProps} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default FormField;
