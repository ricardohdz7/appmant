import { Construction, ArrowLeft } from "lucide-react";

interface UnderConstructionProps {
  onBack: () => void;
}

export function UnderConstruction({ onBack }: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cm-teal/5 blur-[120px] pointer-events-none" />
      
      <div className="bg-white rounded-3xl p-10 max-w-2xl w-full text-center shadow-xl border border-gray-100 relative z-10">
        <div className="w-24 h-24 rounded-full bg-cm-teal/10 text-cm-teal flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Construction className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-cm-dark mb-4">
          Mantenimiento General
        </h1>
        <h2 className="text-xl font-bold text-cm-teal mb-6 uppercase tracking-wider">
          Módulo en Construcción
        </h2>
        
        <p className="text-cm-gray text-lg mb-10 max-w-lg mx-auto">
          Estamos trabajando para habilitar esta sección. Pronto podrás gestionar la infraestructura, reparaciones físicas y tickets de mantenimiento general.
        </p>
        
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-cm-dark font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Selección de Área
        </button>
      </div>
    </div>
  );
}
