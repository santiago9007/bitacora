import { useState, useEffect } from 'react'
import { Trade, Direction, Outcome, Emotion } from '../types'
import { getTrades, saveTrade, deleteTrade, generateId, getStrategies } from '../store'
import { TrendingUp, TrendingDown, Plus, Trash2, X } from 'lucide-react'

const EMOTIONS: Emotion[] = [
  'Sereno', 'Confiado', 'Ansioso', 'Asustado',
  'Vengativo', 'Disciplinado', 'Impulsivo', 'Dudoso', 'Eufórico', 'Frustrado',
]

const EMOTION_EMOJI: Record<Emotion, string> = {
  Sereno: '😌', Confiado: '💪', Ansioso: '😰', Asustado: '😱',
  Vengativo: '😡', Disciplinado: '🎯', Impulsivo: '⚡', Dudoso: '🤔',
  Eufórico: '🤩', Frustrado: '😤',
}

const OUTCOMES: Outcome[] = ['GANANCIA', 'PERDIDA', 'BREAKEVEN', 'ABIERTO']

// Estado inicial para el formulario de trade
const EMPTY: Omit<Trade, 'id'> = {
  fecha: new Date().toLocaleDateString('en-CA'), 
  activo: '',
  direccion: 'LONG',
  precioEntrada: 0,
  precioSalida: null,
  stopLoss: null,
  takeProfit: null,
  lotaje: 0.01,
  ganancia: null,
  perdida: null,
  resultado: 'ABIERTO',
  emocion: null,
  estrategia: null,
  notas: '',
}

// Componente principal para el registro de trades
export default function RegistroTrade() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [form, setForm] = useState<Omit<Trade, 'id'>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const strategies = getStrategies()

  // Cargar trades al montar el componente
  useEffect(() => {
    setTrades(getTrades())
  }, [])

  // Función para refrescar la lista de trades después de agregar, editar o eliminar
  const refresh = () => setTrades(getTrades())

  // Manejar el envío del formulario para agregar o editar un trade
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trade: Trade = { id: editId ?? generateId(), ...form }
    saveTrade(trade)
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
    refresh()
  }

  // Manejar la edición de un trade, llenando el formulario con los datos existentes
  function handleEdit(t: Trade) {
    const { id, ...rest } = t
    setForm(rest)
    setEditId(id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar este trade?')) {
      deleteTrade(id)
      refresh()
    }
  }

  // Función auxiliar para actualizar campos del formulario de manera dinámica
  const field = (key: keyof typeof form, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registro de Trade</h1>
          <p className="text-muted-foreground text-sm mt-1">Registra cada operación con detalle</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Nuevo Trade
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">{editId ? 'Editar Trade' : 'Nuevo Trade'}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fecha */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</label>
              <input type="date" value={form.fecha}
                onChange={e => field('fecha', e.target.value)}
                className="input-base" required />
            </div>
            {/* Activo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Activo</label>
              <input type="text" placeholder="EURUSD, BTC/USDT…" value={form.activo}
                onChange={e => field('activo', e.target.value.toUpperCase())}
                className="input-base" required />
            </div>
            {/* Dirección */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Dirección</label>
              <div className="flex gap-2">
                {(['LONG', 'SHORT'] as Direction[]).map(d => (
                  <button key={d} type="button"
                    onClick={() => field('direccion', d)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-semibold text-sm transition-colors border
                      ${form.direccion === d
                        ? d === 'LONG'
                          ? 'bg-profit/20 text-profit border-profit/40'
                          : 'bg-loss/20 text-loss border-loss/40'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
                      }`}>
                    {d === 'LONG' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {/* Precio Entrada */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Precio Entrada</label>
              <input type="number" step="any" placeholder="0.00000" value={form.precioEntrada || ''}
                onChange={e => field('precioEntrada', parseFloat(e.target.value) || 0)}
                className="input-base font-mono" required />
            </div>
            {/* Precio Salida */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Precio Salida</label>
              <input type="number" step="any" placeholder="0.00000" value={form.precioSalida ?? ''}
                onChange={e => field('precioSalida', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-base font-mono" />
            </div>
            {/* Lotaje */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Lotaje</label>
              <input type="number" step="any" placeholder="0.01" value={form.lotaje || ''}
                onChange={e => field('lotaje', parseFloat(e.target.value) || 0)}
                className="input-base font-mono" required />
            </div>
            {/* Stop Loss */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Stop Loss</label>
              <input type="number" step="any" placeholder="0.00000" value={form.stopLoss ?? ''}
                onChange={e => field('stopLoss', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-base font-mono" />
            </div>
            {/* Take Profit */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Take Profit</label>
              <input type="number" step="any" placeholder="0.00000" value={form.takeProfit ?? ''}
                onChange={e => field('takeProfit', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-base font-mono" />
            </div>
            {/* Resultado */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Resultado</label>
              <select value={form.resultado}
                onChange={e => field('resultado', e.target.value as Outcome)}
                className="input-base">
                {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {/* Ganancia */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Ganancia $</label>
              <input type="number" step="any" placeholder="0.00" value={form.ganancia ?? ''}
                onChange={e => field('ganancia', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-base font-mono" />
            </div>
            {/* Pérdida */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Pérdida $</label>
              <input type="number" step="any" placeholder="0.00" value={form.perdida ?? ''}
                onChange={e => field('perdida', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-base font-mono" />
            </div>
            {/* Emoción */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Emoción</label>
              <select value={form.emocion ?? ''}
                onChange={e => field('emocion', e.target.value || null)}
                className="input-base">
                <option value="">— Seleccionar —</option>
                {EMOTIONS.map(em => (
                  <option key={em} value={em}>{EMOTION_EMOJI[em]} {em}</option>
                ))}
              </select>
            </div>
            {/* Estrategia */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Estrategia</label>
              <select value={form.estrategia ?? ''}
                onChange={e => field('estrategia', e.target.value || null)}
                className="input-base">
                <option value="">— Seleccionar —</option>
                {strategies.map(s => (
                  <option key={s.id} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            </div>
            {/* Notas */}
            <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Notas</label>
              <textarea rows={3} placeholder="Observaciones sobre la operación…" value={form.notas}
                onChange={e => field('notas', e.target.value)}
                className="input-base resize-none" />
            </div>
            {/* Submit */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
                {editId ? 'Actualizar Trade' : 'Guardar Trade'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}
                className="px-6 py-2 bg-muted text-muted-foreground font-semibold rounded-md hover:bg-muted/80 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trades recientes */}
      <div className="space-y-3">
        {trades.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay trades registrados. ¡Empieza ahora!</p>
          </div>
        )}
        {trades.slice(0, 10).map(t => (
          <TradeCard key={t.id} trade={t} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
        {trades.length > 10 && (
          <p className="text-center text-sm text-muted-foreground py-2">
            Ve al Historial para ver todos los {trades.length} trades.
          </p>
        )}
      </div>
    </div>
  )
}

function TradeCard({ trade, onEdit, onDelete }: {
  trade: Trade
  onEdit: (t: Trade) => void
  onDelete: (id: string) => void
}) {
  const isWin = trade.resultado === 'GANANCIA'
  const isLoss = trade.resultado === 'PERDIDA'
  const pnl = trade.ganancia ?? (trade.perdida ? -trade.perdida : null)

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${trade.direccion === 'LONG' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'}`}>
        {trade.direccion === 'LONG' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-foreground">{trade.activo}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${isWin ? 'bg-profit/20 text-profit' : isLoss ? 'bg-loss/20 text-loss' : 'bg-primary/20 text-primary'}`}>
            {trade.resultado}
          </span>
          {trade.emocion && <span className="text-xs text-muted-foreground">{EMOTION_EMOJI[trade.emocion]} {trade.emocion}</span>}
        </div>
        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
          <span>{trade.fecha}</span>
          <span>Entrada: <span className="font-mono text-foreground">{trade.precioEntrada}</span></span>
          {trade.precioSalida && <span>Salida: <span className="font-mono text-foreground">{trade.precioSalida}</span></span>}
          <span>Lotes: <span className="font-mono text-foreground">{trade.lotaje}</span></span>
        </div>
      </div>
      {pnl !== null && (
        <div className={`text-right font-mono font-bold text-lg flex-shrink-0 ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$
        </div>
      )}
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(trade)}
          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button onClick={() => onDelete(trade.id)}
          className="p-2 text-muted-foreground hover:text-loss transition-colors rounded">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}