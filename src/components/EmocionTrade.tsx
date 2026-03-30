import { useState, useEffect, useMemo } from 'react'
import { Plus, X, Trash2, Brain } from 'lucide-react'
import { getEmotions, saveEmotion, deleteEmotion, generateId, getTrades } from '../store'
import type { EmotionEntry, Emotion } from '../types'

const EMOTIONS: { value: Emotion; emoji: string; color: string }[] = [
  { value: 'Sereno', emoji: '😌', color: 'bg-profit/20 text-profit border-profit/40' },
  { value: 'Confiado', emoji: '💪', color: 'bg-profit/20 text-profit border-profit/40' },
  { value: 'Disciplinado', emoji: '🎯', color: 'bg-profit/20 text-profit border-profit/40' },
  { value: 'Ansioso', emoji: '😰', color: 'bg-primary/20 text-primary border-primary/40' },
  { value: 'Dudoso', emoji: '🤔', color: 'bg-primary/20 text-primary border-primary/40' },
  { value: 'FOMO', emoji: '😱', color: 'bg-loss/20 text-loss border-loss/40' },
  { value: 'Impulsivo', emoji: '⚡', color: 'bg-loss/20 text-loss border-loss/40' },
  { value: 'Vengativo', emoji: '😡', color: 'bg-loss/20 text-loss border-loss/40' },
  { value: 'Eufórico', emoji: '🤩', color: 'bg-loss/20 text-loss border-loss/40' },
  { value: 'Frustrado', emoji: '😤', color: 'bg-loss/20 text-loss border-loss/40' },
]

const EMOTION_MAP = Object.fromEntries(EMOTIONS.map(e => [e.value, e]))

const EMPTY: Omit<EmotionEntry, 'id'> = {
  fecha: new Date().toISOString().slice(0, 10),
  emocion: 'Sereno',
  descripcion: '',
  tradeId: undefined,
}

export default function EmocionTrade() {
  const [entries, setEntries] = useState<EmotionEntry[]>([])
  const [trades, setTrades] = useState<ReturnType<typeof getTrades>>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<EmotionEntry, 'id'>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    setEntries(getEmotions())
    setTrades(getTrades())
  }, [])

  const refresh = () => setEntries(getEmotions())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const entry: EmotionEntry = { id: editId ?? generateId(), ...form }
    saveEmotion(entry)
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
    refresh()
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar esta entrada?')) { deleteEmotion(id); refresh() }
  }

  // Stats
  const stats = useMemo(() => {
    const count: Record<string, number> = {}
    entries.forEach(e => { count[e.emocion] = (count[e.emocion] ?? 0) + 1 })
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1])
    return { count, sorted, total: entries.length }
  }, [entries])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emoción del Trade</h1>
          <p className="text-muted-foreground text-sm mt-1">Registra tu estado emocional y mejora tu psicología</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Registrar
        </button>
      </div>

      {/* Emotion selector stats */}
      {stats.total > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-card">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Frecuencia Emocional</h2>
          <div className="flex flex-wrap gap-3">
            {EMOTIONS.map(em => {
              const n = stats.count[em.value] ?? 0
              const pct = stats.total > 0 ? Math.round((n / stats.total) * 100) : 0
              return (
                <div key={em.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${n > 0 ? em.color : 'bg-muted border-border text-muted-foreground opacity-40'}`}>
                  <span>{em.emoji}</span>
                  <div>
                    <p className="text-xs font-medium leading-none">{em.value}</p>
                    {n > 0 && <p className="text-xs opacity-80 mt-0.5">{n}x · {pct}%</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Registrar Emoción</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</label>
                <input type="date" value={form.fecha}
                  onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))}
                  className="input-base" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Trade asociado (opcional)</label>
                <select value={form.tradeId ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, tradeId: e.target.value || undefined }))}
                  className="input-base">
                  <option value="">— Sin trade específico —</option>
                  {trades.map(t => (
                    <option key={t.id} value={t.id}>{t.fecha} · {t.activo} · {t.resultado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">Emoción Principal *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {EMOTIONS.map(em => (
                  <button key={em.value} type="button"
                    onClick={() => setForm(prev => ({ ...prev, emocion: em.value }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all
                      ${form.emocion === em.value ? em.color + ' ring-2 ring-current ring-offset-1 ring-offset-background' : 'bg-muted border-border text-muted-foreground hover:border-primary/30'}`}>
                    <span className="text-xl">{em.emoji}</span>
                    <span className="text-xs font-medium">{em.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Descripción / Notas</label>
              <textarea rows={3} placeholder="¿Qué estabas sintiendo? ¿Qué lo desencadenó?…" value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className="input-base resize-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
                {editId ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-muted text-muted-foreground font-semibold rounded-md hover:bg-muted/80 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Brain size={40} className="mx-auto mb-3 opacity-20" />
          <p>Sin registros emocionales todavía.</p>
          <p className="text-sm mt-1">Trackear tus emociones mejora tu disciplina y resultados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => {
            const em = EMOTION_MAP[e.emocion]
            const linkedTrade = trades.find(t => t.id === e.tradeId)
            return (
              <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 hover:border-primary/20 transition-colors">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border ${em?.color ?? 'bg-muted border-border'}`}>
                  {em?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-foreground">{e.emocion}</span>
                    <span className="text-xs text-muted-foreground font-mono">{e.fecha}</span>
                    {linkedTrade && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                        {linkedTrade.activo} · {linkedTrade.resultado}
                      </span>
                    )}
                  </div>
                  {e.descripcion && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{e.descripcion}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(e.id)}
                  className="p-2 text-muted-foreground hover:text-loss transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}