'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

// Componentes
import Header from '@/components/layout/Header';
import { DiscardConfirmModal } from '@/components/modals/DiscardConfirmModal';

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

  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  async function handleDeleteUser(user: any) {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  }

  // Esta es la función que realmente llamará a la API
  async function confirmDelete() {
    if (!userToDelete) return;
    try {
      await ApiClient.deleteUser(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsuarios();
      // Aquí podrías usar un toast o alerta de éxito
    } catch (e: any) {
      alert('Error: ' + e.message);
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

        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="nuevo-nombres" className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Nombre(s)</label>
            <input
              id="nuevo-nombres"
              name="nuevo-nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ingrese el nombre(s)"
              className="w-full px-2 py-4 font-lexend font-normal text border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="nuevo-apellidos" className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Apellidos</label>
            <input
              id="nuevo-apellidos"
              name="nuevo-apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ingrese los apellidos"
              className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="nuevo-username" className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Nombre de usuario</label>
            <input
              id="nuevo-username"
              name="nuevo-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese el nombre de usuario"
              className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="nuevo-password" className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Contraseña</label>
            <div className="relative">
              <input
                id="nuevo-password"
                name="nuevo-password"
                autoComplete="new-password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
                className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="nuevo-repeat-password" className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Repetir contraseña</label>
            <div className="relative">
              <input
                id="nuevo-repeat-password"
                name="nuevo-repeat-password"
                autoComplete="new-password"
                type={showRepeatPwd ? "text" : "password"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repita la contraseña"
                className="w-full px-2 py-4 font-lexend font-normal border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowRepeatPwd(!showRepeatPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showRepeatPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-6">
          <div className="w-1/5 pr-4">
            <label htmlFor="nuevo-role" className="block font-lexend font-medium text-left text-[14px] text-[#839590] mb-2">Rol</label>
            <select
              id="nuevo-role"
              name="nuevo-role"
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
              className="flex items-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-xl hover:bg-[#0956B6] transition-colors font-normal text-[14px] shadow-lg shadow-blue-500/20"
            >
              Crear nuevo usuario
            </button>
            <button
              onClick={limpiarFormulario}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-lexend font-medium transition-all text-[14px]"
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
                    <button onClick={() => openEditModal(u)} className="w-7 h-7 rounded-md bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center">
                      <Edit className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                    <button onClick={() => handleDeleteUser(u)} className="w-7 h-7 rounded-md bg-red-100 hover:bg-red-200 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-red-500 " />
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

      {/* Modal de Edición de Usuario */}
      {editingUser && (
          <div className="backdrop-blur-sm fixed inset-0 bg-[#0A2C25]/20 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-4xl border border-gray-100 animate-in zoom-in-95 slide-in-from-top-2 duration-200">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* LADO IZQUIERDO: DATOS GENERALES */}
                <div>
                  <div className="mb-8">
                    <p className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide mb-1">DATOS DEL USUARIO</p>
                    <p className="font-lexend font-normal text-[12px] text-[#839590] uppercase tracking-wide">EDITAR Y GUARDAR DE FORMA CORRECTA LOS DATOS</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="edit-nombres" className="block font-lexend font-medium text-[13px] text-[#839590] mb-1.5 ml-1">Nombre(s)</label>
                      <input 
                        id="edit-nombres"
                        name="edit-nombres"
                        type="text" 
                        value={editNombres} 
                        onChange={(e)=>setEditNombres(e.target.value)} 
                        className="w-full px-4 py-3 text-[#0A2C25] font-lexend font-normal border border-[#DCE4DF] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#039343] outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-apellidos" className="block font-lexend font-medium text-[13px] text-[#839590] mb-1.5 ml-1">Apellidos</label>
                      <input
                        id="edit-apellidos"
                        name="edit-apellidos"
                        type="text" 
                        value={editApellidos} 
                        onChange={(e)=>setEditApellidos(e.target.value)} 
                        className="w-full px-4 py-3 text-[#0A2C25] font-lexend font-normal border border-[#DCE4DF] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#039343] outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-username" className="block font-lexend font-medium text-[13px] text-[#839590] mb-1.5 ml-1">Nombre de usuario</label>
                      <input
                        id="edit-username"
                        name="edit-username"
                        type="text" 
                        value={editUsername} 
                        onChange={(e)=>setEditUsername(e.target.value)} 
                        className="w-full px-4 py-3 text-[#0A2C25] font-lexend font-normal border border-[#DCE4DF] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#039343] outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-role" className="block font-lexend font-medium text-[13px] text-[#839590] mb-1.5 ml-1">Rol</label>
                      <select
                        id="edit-role"
                        name="edit-role"
                        value={editRole} 
                        onChange={(e)=>setEditRole(e.target.value)} 
                        className="w-full px-4 py-3 text-[#0A2C25] font-lexend font-normal border border-[#DCE4DF] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#039343] outline-none transition-all"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="JEFATURA">JEFATURA</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LADO DERECHO: SEGURIDAD (RESETEO DE CONTRASEÑA) */}
                <div className="bg-[#F4F7F6]/60 p-6 rounded-[20px] border border-gray-100 flex flex-col">
                  <div className="mb-6">
                    <p className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide mb-1">SEGURIDAD</p>
                    <p className="font-lexend font-normal text-[12px] text-[#839590] uppercase tracking-wide">RESETEAR CONTRASEÑA (OPCIONAL)</p>
                  </div>

                  <div className="space-y-5 flex-1">

                    {/* Mensaje Educativo */}
                    <div className="bg-blue-50/60 border border-blue-100/60 p-4 rounded-xl mb-2">
                      <p className="text-[12px] text-blue-800/80 leading-relaxed font-lexend font-normal">
                        Por seguridad, las contraseñas actuales están encriptadas y no son visibles. Si el usuario perdió su acceso, asígnele una nueva contraseña aquí.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="edit-new-password" className="block font-lexend font-medium text-[13px] text-[#839590] mb-1.5 ml-1">Nueva contraseña</label>
                      <div className="relative">
                        <input
                          id="edit-new-password"
                          name="edit-new-password"
                          autoComplete="new-password"
                          type={editShowNewPwd ? "text" : "password"} 
                          value={editNewPassword} 
                          onChange={(e)=>setEditNewPassword(e.target.value)} 
                          placeholder="••••••••••••" 
                          className="w-full px-4 py-3 text-[#0A2C25] font-lexend font-normal border border-[#DCE4DF] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#039343] outline-none transition-all bg-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        />
                        <button 
                          type="button" 
                          onClick={() => setEditShowNewPwd(!editShowNewPwd)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#839590] hover:text-[#039343] transition-colors"
                        >
                          {editShowNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="edit-confirm-password" className="block font-lexend font-medium text-[13px] text-[#839590] mb-1.5 ml-1">Confirmar contraseña nueva</label>
                      <div className="relative">
                        <input
                          id="edit-confirm-password"
                          name="edit-confirm-password"
                          autoComplete="new-password"
                          type={editShowRepNewPwd ? "text" : "password"} 
                          value={editRepeatNewPassword} 
                          onChange={(e)=>setEditRepeatNewPassword(e.target.value)} 
                          placeholder="••••••••••••" 
                          className="w-full px-4 py-3 text-[#0A2C25] font-lexend font-normal border border-[#DCE4DF] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#039343] outline-none transition-all bg-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        />
                        <button 
                          type="button" 
                          onClick={() => setEditShowRepNewPwd(!editShowRepNewPwd)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#839590] hover:text-[#039343] transition-colors"
                        >
                          {editShowRepNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex justify-center gap-4 mt-12 pt-8 border-t border-gray-100 w-full max-w-md mx-auto">
                <button onClick={handleUpdateUser} className="flex-1 px-6 py-3.5 bg-[#3786E6] hover:bg-[#0956B6] text-white rounded-xl font-lexend font-medium transition-all text-[14px] shadow-lg shadow-blue-500/20">
                  Guardar datos
                </button>
                <button onClick={closeEditModal} className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-lexend font-medium transition-all text-[14px]">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Modal de Confirmación para Eliminar Usuario */}
      <DiscardConfirmModal 
        isOpen={showDeleteConfirm}
        title="¿Eliminar usuario?"
        description={
          <>
            Estás a punto de eliminar permanentemente a{' '}
            <span className="font-medium text-[#dc0a0e]">
              {userToDelete?.nombres || userToDelete?.username 
                ? `${userToDelete.nombres || ''} ${userToDelete.apellidos || ''}`.trim() 
                : 'este usuario'} 
              {userToDelete?.username ? ` (${userToDelete.username})` : ''}
            </span>
            . Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onClose={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }
        }
        onConfirm={confirmDelete}
        icon={<Trash2 className="w-8 h-8 text-red-500" />}
        iconBgColor="bg-red-50"
        confirmBtnColor="bg-red-500 hover:bg-red-600 shadow-red-200"
      />
    </>
  );
}
