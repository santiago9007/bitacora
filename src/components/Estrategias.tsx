import { useState, useEffect } from 'react'
import { Plus, X, Trash2, Edit2, Target, TrendingUp } from 'lucide-react'
import { getStrategies, saveStrategy, deleteStrategy, generateId } from '../store'
import type { Strategy } from '../types'

const EMPTY: Omit<Strategy, 'id' | 'createdAt'> = {
  nombre: '',
  descripcion: '',
  activos: [],
  winRate: null,
}

export default function Estrategias() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Strategy, 'id' | 'createdAt'>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [assetInput, setAssetInput] = useState('')

  useEffect(() => { setStrategies(getStrategies()) }, [])
  const refresh = () => setStrategies(getStrategies())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const strategy: Strategy = {
      id: editId ?? generateId(),
      createdAt: editId ? (strategies.find(s => s.id === editId)?.createdAt ?? new Date().toISOString()) : new Date().toISOString(),
      ...form,
    }
    saveStrategy(strategy)
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
    setAssetInput('')
    refresh()
  }

  function handleEdit(s: Strategy) {
    const { id, createdAt, ...rest } = s
    setForm(rest)
    setEditId(id)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar esta estrategia?')) { deleteStrategy(id); refresh() }
  }

  function addAsset() {
    const a = assetInput.trim().toUpperCase()
    if (a && !form.activos.includes(a)) {
      setForm(prev => ({ ...prev, activos: [...prev.activos, a] }))
    }
    setAssetInput('')
  }

  function removeAsset(a: string) {
    setForm(prev => ({ ...prev, activos: prev.activos.filter(x => x !== a) }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estrategias</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona y documenta tus sistemas de trading</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY); setAssetInput('') }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Nueva Estrategia
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">{editId ? 'Editar Estrategia' : 'Nueva Estrategia'}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre *</label>
                <input type="text" required placeholder="Ej: Pullback en tendencia" value={form.nombre}
                  onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="input-base" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate Histórico (%)</label>
                <input type="number" step="0.1" min="0" max="100" placeholder="Ej: 62.5" value={form.winRate ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, winRate: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="input-base font-mono" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Descripción</label>
              <textarea rows={3} placeholder="Describe la lógica de entrada, salida, gestión de riesgo…" value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className="input-base resize-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Activos</label>
              <div className="flex gap-2">
                <input type="text" placeholder="EURUSD, BTC/USDT…" value={assetInput}
                  onChange={e => setAssetInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAsset() } }}
                  className="input-base flex-1" />
                <button type="button" onClick={addAsset}
                  className="px-4 py-2 bg-muted text-foreground border border-border rounded-md hover:border-primary/40 transition-colors text-sm">
                  Agregar
                </button>
              </div>
              {form.activos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.activos.map(a => (
                    <span key={a} className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-md font-mono">
                      {a}
                      <button type="button" onClick={() => removeAsset(a)} className="hover:text-foreground ml-1">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
                {editId ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}
                className="px-6 py-2 bg-muted text-muted-foreground font-semibold rounded-md hover:bg-muted/80 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strategy cards */}
      {strategies.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Target size={40} className="mx-auto mb-3 opacity-20" />
          <p>No hay estrategias registradas.</p>
          <p className="text-sm mt-1">Crea tu primera estrategia para asociarla a tus trades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {strategies.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-5 shadow-card hover:border-primary/30 transition-colors flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={14} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground truncate">{s.nombre}</h3>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(s)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-muted-foreground hover:text-loss transition-colors rounded">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {s.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{s.descripcion}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-auto">
                {s.activos.map(a => (
                  <span key={a} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md font-mono">{a}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                {s.winRate !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Win Rate:</span>
                    <span className={`font-mono font-bold text-sm ${s.winRate >= 50 ? 'text-profit' : 'text-loss'}`}>{s.winRate}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin datos de WR</span>
                )}
                <span className="text-xs text-muted-foreground">{s.createdAt.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}