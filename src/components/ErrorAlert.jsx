import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ErrorAlert({ titulo, mensaje }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16">
      <Alert variant="destructive" className="border-destructive">
        <AlertCircle />
        <AlertTitle>{titulo}</AlertTitle>
        <AlertDescription>{mensaje}</AlertDescription>
      </Alert>
    </div>
  );
}

export default ErrorAlert;
