"use client";

import { useState } from "react";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Lock, User as UserIcon, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export function LoginScreen({ users, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Small delay to make it feel premium with a loading transition
    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      const trimmedPass = password.trim();

      const user = users.find(
        (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
      );

      if (user) {
        onLogin(user);
      } else {
        setError("Usuario o contraseña incorrectos. Por favor, verifica tus datos.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900 select-none"
      style={{
        background: "radial-gradient(circle at 10% 20%, rgba(4, 32, 66, 1) 0%, rgba(12, 12, 28, 1) 90.1%)"
      }}
    >
      {/* Premium ambient light effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-6">
        {/* Header/Logo */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-3">
            Mantenimiento Preventivo
          </h2>
          <p className="text-xs text-gray-400 font-semibold">
            Casa Muñoz S.A. • Beauty Hub S.A.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-bold leading-normal text-left flex items-start gap-2 animate-shake">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-1">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl text-sm text-white font-medium bg-white/5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 border border-white/10 rounded-2xl text-sm text-white font-medium bg-white/5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all mt-6 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Acceso Rápido (Dev) */}
        <div className="pt-4 border-t border-white/10 text-left space-y-2 mt-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            Acceso Rápido (Dev)
          </label>
          <select
            className="w-full py-2.5 px-3 border border-white/10 rounded-xl text-xs text-white font-medium bg-white/5 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              if (user) onLogin(user);
            }}
            defaultValue=""
          >
            <option value="" disabled className="text-gray-900">Selecciona un usuario para entrar directo...</option>
            {users.map(u => (
              <option key={u.id} value={u.id} className="text-gray-900">
                {u.username} ({u.role === "admin" ? "Admin" : u.role === "management" ? "Gerencia" : "Sucursal"})
              </option>
            ))}
          </select>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-gray-500 font-semibold pt-4">
          Soporte TI • Casa Muñoz S.A. DE C.V.
        </div>
      </div>
    </div>
  );
}
