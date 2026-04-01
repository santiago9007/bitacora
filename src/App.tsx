import { useState } from 'react'
import {
  BookOpen, Calculator, Clock, BarChart2, Target, Brain,
  Menu, X, ChevronRight,
} from 'lucide-react'
import { type Page } from './types'
import RegistroTrade from './components/RegistroTrade'
import CalculadoraRiesgo from './components/CalculadoraRiesgo'
import Historial from './components/Historial'
import Estadisticas from './components/Estadisticas'
import Estrategias from './components/Estrategias'
import EmocionTrade from './components/EmocionTrade'
import kingdomCoders from './assets/kingdom-coders.png';

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'registro', label: 'Registro', icon: BookOpen, desc: 'Registrar operaciones' },
  { id: 'calculadora', label: 'Calculadora', icon: Calculator, desc: 'Calcular riesgo y lotaje' },
  { id: 'historial', label: 'Historial', icon: Clock, desc: 'Ver todos los trades' },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart2, desc: 'Análisis de rendimiento' },
  { id: 'estrategias', label: 'Estrategias', icon: Target, desc: 'Gestionar estrategias' },
  { id: 'emocion', label: 'Emoción', icon: Brain, desc: 'Psicología del trading' },
]

const PAGE_COMPONENTS: Record<Page, React.ComponentType> = {
  registro: RegistroTrade,
  calculadora: CalculadoraRiesgo,
  historial: Historial,
  estadisticas: Estadisticas,
  estrategias: Estrategias,
  emocion: EmocionTrade,
}

export default function App() {
  const [page, setPage] = useState<Page>('registro')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const PageComponent = PAGE_COMPONENTS[page]

  function navigate(id: Page) {
    setPage(id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-60 flex flex-col
        bg-secondary border-r border-border
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <BookOpen size={14} className="text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none text-foreground">Bitácora</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Trading Journal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all group
                  ${active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{item.label}</p>
                </div>
                {active && <ChevronRight size={12} className="flex-shrink-0 opacity-60" />}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-10 py-15 border-t border-border flex-shrink-0">
          <img src={kingdomCoders} alt="kingdomCoders" className="w-25 h-25 filter invert brightness-75"/>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-secondary flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <BookOpen size={10} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Bitácora</span>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{NAV_ITEMS.find(n => n.id === page)?.label}</span>
        </header>

        {/* Desktop page header */}
        <div className="hidden md:flex items-center gap-2 px-6 h-14 border-b border-border flex-shrink-0">
          {NAV_ITEMS.filter(n => n.id === page).map(n => {
            const Icon = n.icon
            return (
              <div key={n.id} className="flex items-center gap-2">
                <Icon size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{n.label}</span>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-xs text-muted-foreground/60">{n.desc}</span>
              </div>
            )
          })}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <PageComponent />
        </main>
      </div>
    </div>
  )
}