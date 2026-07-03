"use client";

import { useState } from "react";
import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { User } from "@/lib/types";
import { 
  Users, 
  Shield, 
  Building, 
  Key, 
  Edit2, 
  Trash2, 
  Plus, 
  Save, 
  X,
  User as UserIcon,
  UserCog
} from "lucide-react";

export function UsersTab() {
  const { state, dispatch } = useMaintenanceContext();
  const { users, branches } = state;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleEdit = (user: User) => {
    setFormData(user);
    setIsEditing(true);
    setErrorMsg("");
  };

  const handleAddNew = () => {
    setFormData({
      role: "branch", // default role
    });
    setIsEditing(true);
    setErrorMsg("");
  };

  const handleDelete = (userId: string, role: string) => {
    if (role === "admin") {
      alert("No se puede eliminar a un administrador del sistema por seguridad.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      dispatch({ type: "DELETE_USER", payload: userId });
    }
  };

  const handleSave = () => {
    if (!formData.username?.trim()) {
      setErrorMsg("El nombre de usuario es obligatorio.");
      return;
    }
    if (!formData.role) {
      setErrorMsg("El rol es obligatorio.");
      return;
    }
    if (formData.role === "branch" && !formData.branchId) {
      setErrorMsg("Debes seleccionar una sucursal para este rol.");
      return;
    }
    
    // Check for duplicate username
    const existing = users.find(u => u.username === formData.username && u.id !== formData.id);
    if (existing) {
      setErrorMsg("Este nombre de usuario ya existe.");
      return;
    }

    if (formData.id) {
      // Update existing
      dispatch({ 
        type: "UPDATE_USER", 
        payload: formData as User 
      });
    } else {
      // Add new
      if (!formData.password?.trim()) {
        setErrorMsg("La contraseña es obligatoria para un usuario nuevo.");
        return;
      }
      const newUser: User = {
        id: `u-${Date.now()}`,
        username: formData.username.trim(),
        password: formData.password.trim(),
        role: formData.role as "admin" | "branch" | "management",
        branchId: formData.role === "branch" ? formData.branchId : null,
      };
      dispatch({ type: "ADD_USER", payload: newUser });
    }

    setIsEditing(false);
    setFormData({});
    setErrorMsg("");
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "admin":
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Shield className="w-3 h-3"/> Admin</span>;
      case "management":
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><UserCog className="w-3 h-3"/> Gerencia</span>;
      case "branch":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Building className="w-3 h-3"/> Sucursal</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit">{role}</span>;
    }
  };

  const getBranchName = (branchId?: string | null) => {
    if (!branchId) return "N/A";
    const b = branches.find(b => b.id === branchId);
    return b ? b.name : "Desconocida";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Gestión de Usuarios y Permisos
          </h2>
          <p className="text-sm text-gray-500 mt-1">Crea nuevos accesos, cambia contraseñas y asigna roles</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={handleAddNew}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold h-10 px-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200/60 mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              {formData.id ? <Edit2 className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              {formData.id ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Nombre de Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={formData.username || ""}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="pl-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="ej. sucursal.cdmx"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Contraseña {formData.id && <span className="text-gray-400 font-normal lowercase">(Dejar en blanco para no cambiar)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={formData.password || ""}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nueva contraseña"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Rol de Acceso</label>
              <select 
                value={formData.role || "branch"}
                onChange={(e) => setFormData({...formData, role: e.target.value as any, branchId: e.target.value === "branch" ? (branches[0]?.id || null) : null})}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="branch">Usuario de Sucursal (Llenado y Vista Local)</option>
                <option value="management">Gerencia / Administración (Vista Global Solo Lectura)</option>
                <option value="admin">Administrador del Sistema (Control Total)</option>
              </select>
            </div>

            {formData.role === "branch" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Sucursal Asignada</label>
                <select 
                  value={formData.branchId || ""}
                  onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>Selecciona una sucursal...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.enterprise})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Usuario
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200/60">
              <tr>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Usuario</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Contraseña</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Rol y Permisos</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Sucursal Asignada</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    {user.username}
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500 text-xs">
                    {user.password ? user.password : "********"}
                  </td>
                  <td className="px-5 py-3">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-5 py-3 text-gray-600 font-medium">
                    {user.role === "branch" ? getBranchName(user.branchId) : <span className="text-gray-400 italic">Global / No Aplica</span>}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Usuario"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id, user.role)}
                      className={`p-1.5 rounded-lg transition-colors ${user.role === "admin" ? "text-gray-300 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
                      title={user.role === "admin" ? "No se puede eliminar al admin" : "Eliminar Usuario"}
                      disabled={user.role === "admin"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-400 font-medium text-sm">
            No hay usuarios registrados. 
          </div>
        )}
      </div>
    </div>
  );
}
