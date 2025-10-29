import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Lock, User } from "lucide-react";

export default function App() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de inicio de sesión aquí
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Sección del formulario */}
            <div className="flex-1 flex items-center justify-center p-8 bg-green-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-green-800 mb-2">Bienvenida</h1>
                            <p className="text-green-700">Ingresa tus datos para continuar</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-green-800">Usuario</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-800" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Ingresa tu usuario"
                                        className="pl-10 rounded-lg h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-green-800">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-800" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Ingresa tu contraseña"
                                        className="pl-10 rounded-lg h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-green-600 hover:bg-green-700 rounded-lg"
                            >
                                Iniciar Sesión
                            </Button>
                            {/*
                            <div className="text-center">
                                <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>*/}
                        </form>
                    </div>
                </div>
            </div>

            {/* Sección de la imagen */}
            <div className="flex-1 relative bg-green-200">
                <ImageWithFallback
                    src="https://images.unsplash.com/photo-1643194253810-c9d5d884c3ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMG5hdHVyZSUyMGZvcmVzdHxlbnwxfHx8fDE3NjE2OTEzNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Imagen decorativa"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
