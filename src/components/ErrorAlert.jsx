import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function ErrorAlert({ titulo, mensaje, onReintentar }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16">
      <Alert variant="destructive" className="border-destructive">
        <AlertCircle />
        <AlertTitle>{titulo}</AlertTitle>
        <AlertDescription>{mensaje}</AlertDescription>
      </Alert>
      {onReintentar && (
        <Button variant="outline" size="lg" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default ErrorAlert;
