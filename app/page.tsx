"use client";

import { useState, useEffect } from "react";
import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { LoginScreen } from "@/components/LoginScreen";
import { MainDashboard } from "@/components/MainDashboard";
import { BranchDashboard } from "@/components/BranchDashboard";
import { ManagementDashboard } from "@/components/ManagementDashboard";
import { User } from "@/lib/types";

export default function Home() {
  const { state } = useMaintenanceContext();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("maintenance_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user from localStorage", e);
      }
    }
    setIsCheckingSession(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("maintenance_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("maintenance_user");
  };

  const isLoadingData = state.users.length === 0;

  if (isCheckingSession || isLoadingData) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900"
        style={{
          background: "radial-gradient(circle at 10% 20%, rgba(4, 32, 66, 1) 0%, rgba(12, 12, 28, 1) 90.1%)"
        }}
      >
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-300 tracking-wider">Cargando base de datos...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen users={state.users} onLogin={handleLogin} />;
  }

  if (currentUser.role === "admin") {
    return <MainDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === "management") {
    return <ManagementDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Branch user dashboard (Restricted / Read-Only view of compliance)
  return <BranchDashboard currentUser={currentUser} onLogout={handleLogout} />;
}
