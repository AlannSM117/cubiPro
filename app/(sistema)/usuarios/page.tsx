'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ApiClient } from '@/lib/apiClient';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

export default function UsuariosPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Registration form
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showRepeatPwd, setShowRepeatPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editNombres, setEditNombres] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPasswordAcc, setEditPasswordAcc] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editShowPwdAcc, setEditShowPwdAcc] = useState(false);
  
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editRepeatNewPassword, setEditRepeatNewPassword] = useState('');
  const [editShowNewPwd, setEditShowNewPwd] = useState(false);
  const [editShowRepNewPwd, setEditShowRepNewPwd] = useState(false);

  useEffect(() => {
    const user = ApiClient.getUserFromToken();
    // Revisa si es Admin basado en roles típicos (Admin, Administrador, administrador, etc)
    const isAdminUser = user && (user.role === 'ADMIN' || user.role?.toUpperCase() === 'ADMIN');
    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      loadUsuarios();
    }
  }, []);

  async function loadUsuarios() {
    try {
      const data = await ApiClient.getUsers();
      setUsuarios(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateUser() {
    if (!nombres || !apellidos || !username || !password || !role) {
      alert('Por favor llene todos los campos requeridos');
      return;
    }
    if (password !== repeatPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      setIsLoading(true);
      await ApiClient.createUser({
        nombres,
        apellidos,
        username,
        password,
        role,
      });
      alert('Usuario creado exitosamente');
      limpiarFormulario();
      loadUsuarios();
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  }

  function limpiarFormulario() {
    setNombres('');
    setApellidos('');
    setUsername('');
    setPassword('');
    setRepeatPassword('');
    setRole('');
  }

  async function handleDeleteUser(id: string) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await ApiClient.deleteUser(id);
        loadUsuarios();
      } catch (e: any) {
        alert('Error: ' + e.message);
      }
    }
  }

  function openEditModal(user: any) {
    setEditingUser(user);
    setEditNombres(user.nombres || '');
    setEditApellidos(user.apellidos || '');
    setEditUsername(user.username || '');
    setEditPasswordAcc(user.password || ''); // Some APIs dont return pwd
    setEditRole(user.role || '');
    
    setEditNewPassword('');
    setEditRepeatNewPassword('');
    
    setEditShowPwdAcc(false);
    setEditShowNewPwd(false);
    setEditShowRepNewPwd(false);
  }

  function closeEditModal() {
    setEditingUser(null);
  }

  async function handleUpdateUser() {
    if (editNewPassword && editNewPassword !== editRepeatNewPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      const payload: any = {
        nombres: editNombres,
        apellidos: editApellidos,
        username: editUsername,
        role: editRole,
      };
      
      // Send password only if they typed a new one, or if they changed it
      if (editNewPassword) {
        payload.password = editNewPassword;
      }

      await ApiClient.updateUser(editingUser.id, payload);
      alert('Usuario actualizado exitosamente');
      closeEditModal();
      loadUsuarios();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  }

  if (isAdmin === null) return <div className="p-8">Cargando permisos...</div>;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700">Acceso Denegado</h2>
        <p className="text-gray-500 mt-2">No tienes los permisos necesarios para administrar usuarios.</p>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Usuarios"
        subtitle="Administración y registro de usuarios"
      />

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="mb-6">
          <p className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide">NUEVO USUARIO</p>
          <p className="font-lexend font-normal text-[12px] text-[#839590] uppercase tracking-wide">INGRESO DE DATOS PARA REGISTRAR UN NUEVO USUARIO</p>
        </div>

        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Nombre(s)</label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ingrese el nombre(s)"
              className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Apellidos</label>
            <input
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ingrese los apellidos"
              className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese el nombre de usuario"
              className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
                className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Repetir contraseña</label>
            <div className="relative">
              <input
                type={showRepeatPwd ? "text" : "password"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repita la contraseña"
                className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button type="button" onClick={() => setShowRepeatPwd(!showRepeatPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showRepeatPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-6">
          <div className="w-1/5 pr-4">
            <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Elegir un rol</option>
              <option value="ADMIN">ADMIN</option>
              <option value="JEFATURA">JEFATURA</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCreateUser}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-lg hover:bg-[#0956B6] transition-colors font-normal"
            >
              Crear nuevo usuario
            </button>
            <button
              onClick={limpiarFormulario}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-lexend rounded-lg hover:bg-red-700 transition-colors font-normal"
            >
              Limpiar formulario
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <p className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide">LISTADO DE USUARIOS REGISTRADOS</p>
          <p className="font-lexend font-normal text-[12px] text-[#839590] uppercase tracking-wide">VISUALIZACIÓN Y ADMINISTRACIÓN DE LOS USUARIOS EXISTENTES</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#c1cac7]">
                <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Nombre(s)</th>
                <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Apellidos</th>
                <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Nombre de usuario</th>
                <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Rol</th>
                <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors">
                  <td className="font-lexend font-normal py-4 text-center text-[13px] text-[#0A2C25]">{u.nombres}</td>
                  <td className="font-lexend font-normal py-4 text-center text-[13px] text-[#0A2C25]">{u.apellidos}</td>
                  <td className="pfont-lexend font-medium py-4 text-center text-[13px] text-[#0A2C25]">{u.username}</td>
                  <td className="font-lexend font-normal py-4 text-center text-[13px] text-[#0A2C25]">{u.role}</td>
                  <td className="py-4 px-4 flex justify-center gap-4 text-gray-400">
                    <button onClick={() => openEditModal(u)} className="hover:text-emerald-500 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)} className="hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="font-lexend font-normal py-8 text-center text-[16px] text-[#839590]">No hay usuarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="backdrop-blur-sm fixed inset-0 bg-[#0A2C25]/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide mb-1">DATOS DEL USUARIO</p>
                <p className="font-lexend font-normal text-[12px] text-[#839590] uppercase tracking-wide mb-6">EDITAR Y GUARDAR DE FORMA CORRECTA LOS DATOS</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-lexend font-medium text-[14px] text-[#839590] mb-1">Nombre(s)</label>
                    <input type="text" value={editNombres} onChange={(e)=>setEditNombres(e.target.value)} className="w-full px-2 py-3 text-[#0A2C25] font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block font-lexend font-medium text-[14px] text-[#839590] mb-1">Apellidos</label>
                    <input type="text" value={editApellidos} onChange={(e)=>setEditApellidos(e.target.value)} className="w-full px-2 py-3 text-[#0A2C25] font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block font-lexend font-medium text-[14px] text-[#839590] mb-1">Nombre de usuario</label>
                    <input type="text" value={editUsername} onChange={(e)=>setEditUsername(e.target.value)} className="w-full px-2 py-3 text-[#0A2C25] font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block font-lexend font-medium text-[14px] text-[#839590] mb-1">Contraseña</label>
                    <div className="relative">
                      <input type={editShowPwdAcc ? "text" : "password"} value={editPasswordAcc} onChange={(e)=>setEditPasswordAcc(e.target.value)} className="w-full px-2 py-3 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"  />
                      <button type="button" onClick={() => setEditShowPwdAcc(!editShowPwdAcc)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#839590]">
                        {editShowPwdAcc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-lexend font-medium text-[14px] text-[#839590] mb-1">Rol</label>
                    <select value={editRole} onChange={(e)=>setEditRole(e.target.value)} className="w-full px-2 py-3 text-[#0A2C25] font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="ADMIN">ADMIN</option>
                      <option value="JEFATURA">JEFATURA</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide mb-1 invisible">CAMBIAR CONTRASEÑA</p>
                <p className="font-lexend font-normal text-[12px] text-[#839590] uppercase tracking-wide mb-6">CAMBIAR CONTRASEÑA</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña nueva</label>
                    <div className="relative">
                      <input type={editShowNewPwd ? "text" : "password"} value={editNewPassword} onChange={(e)=>setEditNewPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-2 py-3 text-[#0A2C25] font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
                      <button type="button" onClick={() => setEditShowNewPwd(!editShowNewPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#839590]">
                        {editShowNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Repetir contraseña nueva</label>
                    <div className="relative">
                      <input type={editShowRepNewPwd ? "text" : "password"} value={editRepeatNewPassword} onChange={(e)=>setEditRepeatNewPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-2 py-3 text-[#0A2C25] font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
                      <button type="button" onClick={() => setEditShowRepNewPwd(!editShowRepNewPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#839590]">
                        {editShowRepNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-10 w-full max-w-sm mx-auto">
              <button onClick={handleUpdateUser} className="w-full px-6 py-3 bg-[#3786E6] hover:bg-[#0956B6] text-white rounded-lg font-lexend font-normal transition-colors text-sm">
                Guardar datos
              </button>
              <button onClick={closeEditModal} className="w-full px-6 py-3 bg-red-500 hover:bg-red-700 text-white rounded-lg font-lexend font-normal transition-colors text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
