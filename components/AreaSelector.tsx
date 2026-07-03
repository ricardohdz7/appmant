import { User } from "@/lib/types";
import { Monitor, Wrench, LogOut } from "lucide-react";
import { Button } from "./ui/button";

interface AreaSelectorProps {
  currentUser: User;
  onSelectArea: (area: "informatica" | "mantenimiento") => void;
  onLogout: () => void;
}

export function AreaSelector({ currentUser, onSelectArea, onLogout }: AreaSelectorProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cm-teal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cm-teal/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-2xl font-extrabold text-cm-dark tracking-tight">
            Casa Muñoz Medi Pedi
          </h1>
          <p className="text-sm font-medium text-cm-gray uppercase tracking-wider">
            Portal de Gestión
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold block uppercase text-cm-gray">
              {currentUser.role === "admin" ? "Administración" : currentUser.role === "management" ? "Gerencia" : "Sucursal"}
            </span>
            <span className="text-sm text-cm-dark font-extrabold">{currentUser.username}</span>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-lg transition-all font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-cm-dark mb-3 tracking-tight">
              Seleccione un Área de Trabajo
            </h2>
            <p className="text-lg text-cm-gray font-medium">
              Elija el departamento que desea consultar para visualizar sus operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informática Card */}
            <button
              onClick={() => onSelectArea("informatica")}
              className="group bg-white rounded-3xl p-8 border border-gray-200 hover:border-cm-teal hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden flex flex-col h-full min-h-[300px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Monitor className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Informática</h3>
                <p className="text-gray-500 text-base font-medium flex-1">
                  Acceso al control de mantenimiento preventivo, gestión de equipos, tickets Odoo y planificaciones del área de tecnología.
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-bold uppercase text-sm tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                  Ingresar al portal &rarr;
                </div>
              </div>
            </button>

            {/* Mantenimiento General Card */}
            <button
              onClick={() => onSelectArea("mantenimiento")}
              className="group bg-white rounded-3xl p-8 border border-gray-200 hover:border-cm-teal hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden flex flex-col h-full min-h-[300px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cm-teal/10 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-cm-teal/20 text-cm-teal flex items-center justify-center mb-6 group-hover:bg-cm-teal group-hover:text-white transition-colors duration-300">
                  <Wrench className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Mantenimiento General</h3>
                <p className="text-gray-500 text-base font-medium flex-1">
                  Gestión de infraestructura, instalaciones, reparaciones físicas y tickets de mantenimiento general de sucursales.
                </p>
                <div className="mt-6 flex items-center text-cm-teal font-bold uppercase text-sm tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                  Ingresar al portal &rarr;
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
