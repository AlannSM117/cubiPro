'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { User, Lock, Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await ApiClient.login({
        username,
        password,
      });

      if (data.access_token) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      
      {/* Left Dark Green Panel */}
      <div className="w-full md:w-[25%] lg:w-[30%] min-h-screen bg-[#0B2519] flex items-center justify-center p-12 text-center text-white relative">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-light tracking-wide mb-4">Bienvenidos a</h2>
          
          {/* Custom SVG Logo mapping exactly the mockup colors */}
          <div className="w-32 h-32 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Back curve element */}
              <path d="M 50 15 C 75 15, 95 35, 90 60 C 85 80, 50 85, 30 75 C 15 65, 10 40, 25 25 C 35 15, 45 15, 50 15 Z" fill="#bbed7c" />
              {/* Front curve element */}
              <path d="M 30 40 C 15 60, 25 85, 45 90 C 70 95, 90 75, 80 50 C 70 25, 45 20, 30 40 Z" fill="#039343" />
              {/* Cutout / inner swoosh */}
              <path d="M 40 45 C 45 35, 55 35, 60 45 C 65 55, 60 70, 50 65 C 40 60, 35 55, 40 45 Z" fill="#0B2519" />
              {/* Orange swoosh line indicator */}
              <path d="M 35 35 C 50 15, 75 25, 80 50" fill="none" stroke="#e05822" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight">Cubi</h1>
          <p className="text-sm font-light text-gray-300 mt-2">Control de Inventario</p>
        </div>
      </div>

      {/* Right White Content Panel */}
      <div className="w-full md:w-[75%] lg:w-[70%] min-h-screen flex items-center justify-center p-8 lg:p-14 bg-white">
        
        <div className="w-full max-w-2xl px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0B2519] mb-2">Iniciar sesión en Cubi</h2>
            <p className="text-sm text-gray-400">
              Inicie sesión con los datos otorgados por el administrador para poder gestionar el inventario
            </p>
          </div>

          {/* Form Box Container */}
          <div className="border border-gray-200 rounded-2xl p-8 lg:p-12 shadow-sm">
            <h3 className="text-xl font-bold text-center text-[#0B2519] mb-8">
              Creedenciales de acceso
            </h3>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${error ? 'text-red-500' : 'text-gray-600'}`}>
                  <User className={`w-4 h-4 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                  Nombre de usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ingrese su nombre de usuario"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors text-sm
                      ${error ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}`}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-[10px] text-red-500 font-medium mt-1 uppercase">POR FAVOR INGRESE UN NOMBRE DE USUARIO VÁLIDO.</p>
                )}
              </div>

              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${error ? 'text-red-500' : 'text-gray-600'}`}>
                  <Lock className={`w-4 h-4 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ingrese su contraseña"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors text-sm pr-12
                      ${error ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPwd ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {error && (
                  <p className="text-[10px] text-red-500 font-medium mt-1 uppercase">POR FAVOR INGRESE UNA CONTRASEÑA VÁLIDA.</p>
                )}
              </div>

              {/* Real API Error Message (Optional display, since mockup shows inline messages) */}
              {error && error !== 'Error al iniciar sesión' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-md text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full py-3.5 bg-[#0bc868] hover:bg-[#0aa355] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link href="#" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
