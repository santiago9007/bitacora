import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import kingdomCoders from '../assets/kingdom-coders.png'; // Importa la imagen

type AuthMode = 'login' | 'register' | 'forgot'

const AuthContext = createContext<{
  login: (email: string, password: string, nombre?: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
} | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  async function login(email: string, password: string, nombre?: string) {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    if (!email.trim() || !password.trim()) {
      setIsLoading(false)
      throw new Error('Email y contraseña son requeridos')
    }

    setIsAuthenticated(true)
    setIsLoading(false)
    return Promise.resolve()
  }

  function logout() {
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ login, isLoading, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function Login() {
  const { login, isLoading } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('demo@kingdomtrader.com')
  const [password, setPassword] = useState('Demo@123')
  const [nombre, setNombre] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function isValidPassword(pwd: string): boolean {
    return pwd.length >= 6
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (!email.trim()) throw new Error('El email es requerido')
      if (!isValidEmail(email)) throw new Error('Email inválido')
      if (!password.trim()) throw new Error('La contraseña es requerida')

      if (mode === 'register') {
        if (!nombre.trim()) throw new Error('El nombre es requerido')
        if (!isValidPassword(password)) throw new Error('La contraseña debe tener al menos 6 caracteres')
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden')
      }

      if (mode === 'forgot') {
        setSuccess('Se ha enviado un enlace de recuperación a tu email (simulado)')
        setTimeout(() => setMode('login'), 3000)
        return
      }

      await login(email, password, mode === 'register' ? nombre : undefined)
      setSuccess('¡Bienvenido! Iniciando sesión...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  function handleOAuth(provider: string) {
    setError(`Integración con ${provider} no disponible en demo`)
  }

  function switchMode(newMode: AuthMode) {
    setError('')
    setSuccess('')
    setMode(newMode)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Main container */}
      <div className="w-full max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Logo (Desktop only) */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <img src={kingdomCoders} alt="kingdomCoders" className="w-21 h-21 filter invert brightness-75"/>
            </div>
          </div>

          {/* Right side - Form Card */}
          <div className="w-full max-w-sm mx-auto">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {mode === 'login'
                    ? 'Iniciar Sesión'
                    : mode === 'register'
                      ? 'Crear Cuenta'
                      : 'Recuperar Contraseña'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {mode === 'login'
                    ? 'Bienvenido de vuelta a tu bitacora de trading'
                    : mode === 'register'
                      ? 'Únete a nuestra comunidad'
                      : 'Recupera tu acceso'}
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-2 items-start">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-sm text-green-300">{success}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all disabled:opacity-50"
                      placeholder="nombre@email.com"
                    />
                  </div>
                </div>

                {/* Nombre Input (Register) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">Nombre completo</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all disabled:opacity-50"
                      placeholder="Juan Pérez"
                    />
                  </div>
                )}

                {/* Password Input */}
                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">Contraseña</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all disabled:opacity-50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password Input (Register) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">Confirmar contraseña</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {/* Main Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-6 ${
                    isLoading
                      ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 active:scale-95 shadow-lg hover:shadow-yellow-500/50'
                  }`}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {mode === 'login' && '¿Iniciar Sesión?'}
                  {mode === 'register' && 'Crear Cuenta'}
                  {mode === 'forgot' && 'Enviar Enlace'}
                </button>

              </form>

              {/* Links */}
              <div className="mt-6 text-center space-y-2 text-sm">
                {mode === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      disabled={isLoading}
                      className="block w-full text-yellow-400 hover:text-yellow-300 disabled:opacity-50 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>

                    {/* Register Link */}
                    <div className="pt-2 text-slate-400">
                      ¿No tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        disabled={isLoading}
                        className="text-yellow-400 hover:text-yellow-300 font-semibold disabled:opacity-50"
                      >
                        Crea una cuenta
                      </button>
                    </div>
                  </>
                )}

                {mode === 'register' && (
                  <div className="pt-2 text-slate-400">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      disabled={isLoading}
                      className="text-yellow-400 hover:text-yellow-300 font-semibold disabled:opacity-50"
                    >
                      Inicia sesión
                    </button>
                  </div>
                )}

                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    disabled={isLoading}
                    className="block w-full text-yellow-400 hover:text-yellow-300 disabled:opacity-50 transition-colors"
                  >
                    Volver a iniciar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}