'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
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
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">NUEVO USUARIO</p>
          <p className="text-xs text-gray-400 uppercase mt-1">INGRESO DE DATOS PARA REGISTRAR UN NUEVO USUARIO</p>
        </div>

        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Nombre(s)</label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ingrese el nombre(s)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Apellidos</label>
            <input
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ingrese los apellidos"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese el nombre de usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Repetir contraseña</label>
            <div className="relative">
              <input
                type={showRepeatPwd ? "text" : "password"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repita la contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowRepeatPwd(!showRepeatPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showRepeatPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-6">
          <div className="w-1/5 pr-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Crear nuevo usuario
            </button>
            <button
              onClick={limpiarFormulario}
              className="px-6 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
            >
              Limpiar formulario
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">LISTADO DE USUARIOS REGISTRADOS</p>
          <p className="text-xs text-gray-400 uppercase mt-1">VISUALIZACIÓN Y ADMINISTRACIÓN DE LOS USUARIOS EXISTENTES</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-t border-gray-100">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 font-semibold text-gray-600 text-center">Nombre(s)</th>
                <th className="py-4 px-4 font-semibold text-gray-600 text-center">Apellidos</th>
                <th className="py-4 px-4 font-semibold text-gray-600 text-center">Nombre de usuario</th>
                <th className="py-4 px-4 font-semibold text-gray-600 text-center">Rol</th>
                <th className="py-4 px-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-center text-gray-800">{u.nombres}</td>
                  <td className="py-4 px-4 text-center text-gray-800">{u.apellidos}</td>
                  <td className="py-4 px-4 text-center text-gray-800 font-medium">{u.username}</td>
                  <td className="py-4 px-4 text-center text-gray-600">{u.role}</td>
                  <td className="py-4 px-4 flex justify-center gap-4 text-gray-400">
                    <button onClick={() => openEditModal(u)} className="hover:text-blue-500 transition-colors">
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
                  <td colSpan={5} className="py-8 text-center text-gray-400">No hay usuarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">DATOS DEL USUARIO</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-6">EDITAR Y GUARDAR DE FORMA CORRECTA LOS DATOS</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre(s)</label>
                    <input type="text" value={editNombres} onChange={(e)=>setEditNombres(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos</label>
                    <input type="text" value={editApellidos} onChange={(e)=>setEditApellidos(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre de usuario</label>
                    <input type="text" value={editUsername} onChange={(e)=>setEditUsername(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña</label>
                    <div className="relative">
                      <input type={editShowPwdAcc ? "text" : "password"} value={editPasswordAcc} onChange={(e)=>setEditPasswordAcc(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none pr-10 focus:border-blue-500" />
                      <button type="button" onClick={() => setEditShowPwdAcc(!editShowPwdAcc)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        {editShowPwdAcc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rol</label>
                    <select value={editRole} onChange={(e)=>setEditRole(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="ADMIN">ADMIN</option>
                      <option value="JEFATURA">JEFATURA</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1 invisible">CAMBIAR CONTRASEÑA</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-6">CAMBIAR CONTRASEÑA</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña nueva</label>
                    <div className="relative">
                      <input type={editShowNewPwd ? "text" : "password"} value={editNewPassword} onChange={(e)=>setEditNewPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-3 py-2 border rounded-lg text-sm outline-none pr-10 focus:border-blue-500" />
                      <button type="button" onClick={() => setEditShowNewPwd(!editShowNewPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        {editShowNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Repetir contraseña nueva</label>
                    <div className="relative">
                      <input type={editShowRepNewPwd ? "text" : "password"} value={editRepeatNewPassword} onChange={(e)=>setEditRepeatNewPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-3 py-2 border rounded-lg text-sm outline-none pr-10 focus:border-blue-500" />
                      <button type="button" onClick={() => setEditShowRepNewPwd(!editShowRepNewPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        {editShowRepNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-10 w-full max-w-sm mx-auto">
              <button onClick={handleUpdateUser} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm">
                Guardar datos
              </button>
              <button onClick={closeEditModal} className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
