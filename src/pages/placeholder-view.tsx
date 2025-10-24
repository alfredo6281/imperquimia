import { Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

interface PlaceholderViewProps {
  title: string;
  description: string;
}

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-slate-800 text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-slate-600">{description}</p>
      </div>

      <Card className="max-w-md mx-auto border-slate-200 rounded-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-slate-100 rounded-full w-fit">
            <Construction className="h-8 w-8 text-slate-600" />
          </div>
          <CardTitle className="text-slate-800">Próximamente</CardTitle>
          <CardDescription className="text-slate-600">
            Esta funcionalidad estará disponible pronto
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-500">
            Estamos trabajando en esta sección para brindarte la mejor experiencia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}