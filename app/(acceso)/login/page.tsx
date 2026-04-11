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
      <div className="w-full md:w-[30%] lg:w-[40%] min-h-[30vh] md:h-[90vh] md:my-auto bg-[#0B2519] flex items-center justify-center p-8 md:p-12 text-center text-white relative m-0 md:ml-4 rounded-b-[40px] md:rounded-3xl shadow-xl md:shadow-2xl flex-shrink-0 z-10">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-[40px] font-lexend font-light text-[#DBF0DD] mb-4">Bienvenidos a</h2>
          
          {/* Custom SVG Logo mapping exactly the mockup colors */}
          <div className="w-32 h-32 relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="176" viewBox="0 0 200 176" fill="none">
              <circle cx="75.7576" cy="99.9999" r="75.7576" fill="#09934D"/>
              <circle cx="124.242" cy="75.7576" r="75.7576" fill="#AAD080"/>
              <path d="M90.7292 117.835C88.6718 132.923 77.8707 134.001 72.7273 132.654C83.3334 145.455 117.64 153.03 119.697 153.03C145.455 153.03 166.667 139.394 171.212 134.848C165.752 127.202 158.879 65.293 135.734 53.1681C112.589 41.0431 93.3009 98.9735 90.7292 117.835Z" fill="#09934D"/>
              <path d="M66.2186 111.669C71.0467 117.402 75.7576 120.821 78.7879 117.79C81.3132 115.993 84.2424 111.007 75.7576 105.441C73.315 102.673 70.7688 99.6853 69.697 98.0932C66.8737 93.8995 66.3521 90.8829 65.1515 85.972C63.7393 80.1956 63.9705 76.7577 63.6364 70.8205C63.2042 63.1405 63.2595 58.8065 63.6364 51.1235C63.9566 44.5958 65.1515 34.4569 65.1515 34.4569L66.9958 26.0605C62.0672 31.3911 58.2178 40.3696 56.1676 51.3166C54.1174 62.2636 54.007 74.429 55.8569 85.5372C57.7069 96.6453 61.3904 105.935 66.2186 111.669Z" fill="#C7570E"/>
              <path d="M171.198 70.4527C177.73 80.5707 182.617 91.8251 185.343 103.029C186.512 107.833 187.266 112.551 187.599 117.094C184.849 121.212 180.303 127.273 179.006 128.149L173.607 105.421L167.547 90.2699C167.547 90.2699 160.932 69.4021 153.03 59.0909C148.188 52.7723 148.697 53.1535 142.424 46.9697C133.117 37.7934 124.243 40.2699 124.243 40.2699C124.243 40.2699 127.273 37.8788 131.818 37.8788C136.364 37.8788 142.833 41.6116 148.23 45.5401C156.731 51.728 164.666 60.3347 171.198 70.4527Z" fill="#C7570E"/>
            </svg>
          </div>
          
          <h1 className="text-[50px] font-lexend font-medium text-[#DBF0DD] tracking-tight">Cubi</h1>
          <p className="text-[20px] font-lexend font-light text-[#DBF0DD] mt-2">Control de Inventario</p>
        </div>
      </div>

      {/* Right White Content Panel */}
      <div className="w-full md:w-[75%] lg:w-[70%] min-h-screen flex items-center justify-center p-8 lg:p-4 bg-white">
        
        <div className="w-full max-w-2xl px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-roboto font-medium text-[#0A2C25] mb-2">Iniciar sesión en Cubi</h2>
            <p className="text-sm font-roboto font-normal text-[#839590]">
              Inicie sesión con los datos otorgados por el administrador para poder gestionar el inventario
            </p>
          </div>

          {/* Form Box Container */}
          <div className="border border-gray-200 rounded-2xl p-8 lg:p-12 shadow-sm">
            <h3 className="text-2xl font-lexend font-normal text-center text-[#0A2C25] mb-8">
              Creedenciales de acceso
            </h3>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div>
                <label className={`flex items-center gap-2 text-sm font-lexend font-normal mb-2 ${error ? 'text-red-500' : 'text-[#839590]'}`}>
                  <User className={`w-4 h-4 ${error ? 'text-red-500' : 'text-[#839590]'}`} />
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
                {/* Contenedor con altura fija para que el error no empuje el diseño */}
                <div className="h-5 mt-1"> 
                  {error && (
                    <p className="text-[11px] text-red-500 font-lexend font-normal leading-tight">
                      Por favor ingrese un nombre de usuario válido.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={`flex items-center gap-2 text-sm font-lexend font-normal mb-2 ${error ? 'text-red-500' : 'text-[#839590]'}`}>
                  <Lock className={`w-4 h-4 ${error ? 'text-red-500' : 'text-[#839590]'}`} />
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#839590] hover:text-gray-600 focus:outline-none"
                  >
                    {showPwd ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <div className="h-5 mt-1">
                  {error && (
                    <p className="text-[11px] text-red-500 font-lexend font-normal leading-tight">
                      Por favor ingrese una contraseña válida.
                    </p>
                  )}
                </div>
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
                  className="w-full py-3.5 bg-[#0bc868] hover:bg-[#0aa355] text-white font-lexend font-normal rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link href="#" className="text-xs font-lexend font-normal text-[#839590] hover:text-[#0A2C25] transition-colors">
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