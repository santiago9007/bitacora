import { useState, useEffect, useMemo } from 'react'
import { Search, Trash2, TrendingUp, TrendingDown, ChevronUp, ChevronDown, Download } from 'lucide-react'
import { getTrades, deleteTrade } from '../store'
import type { Trade, Outcome, Direction } from '../types'

// Mapeo de emociones a emojis para mostrar en la tabla
const EMOTION_EMOJI: Record<string, string> = {
  Sereno: '😌', Confiado: '💪', Ansioso: '😰', FOMO: '😱',
  Vengativo: '😡', Disciplinado: '🎯', Impulsivo: '⚡', Dudoso: '🤔',
  Eufórico: '🤩', Frustrado: '😤',
}

// Claves para ordenar la tabla
type SortKey = 'fecha' | 'activo' | 'resultado' | 'pnl' | 'lotaje'
type SortDir = 'asc' | 'desc'

// Componente principal del historial de trades
export default function Historial() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [search, setSearch] = useState('')
  const [filterResultado, setFilterResultado] = useState<Outcome | ''>('')
  const [filterDireccion, setFilterDireccion] = useState<Direction | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => { setTrades(getTrades()) }, [])
  const refresh = () => setTrades(getTrades())

  // Eliminar trade con confirmación
  function handleDelete(id: string) {
    if (confirm('¿Eliminar este trade?')) { deleteTrade(id); refresh() }
  }

  // Cambiar ordenamiento al hacer clic en el encabezado de la tabla
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // Filtrar y ordenar trades según búsqueda, filtros y ordenamiento seleccionado
  const filtered = useMemo(() => {
    return trades
      .filter(t => {
        const q = search.toLowerCase()
        const matchSearch = !q || t.activo.toLowerCase().includes(q) || t.notas.toLowerCase().includes(q) || (t.estrategia?.toLowerCase().includes(q) ?? false)
        const matchResultado = !filterResultado || t.resultado === filterResultado
        const matchDir = !filterDireccion || t.direccion === filterDireccion
        return matchSearch && matchResultado && matchDir
      })
      .sort((a, b) => {
        let av: number | string = 0
        let bv: number | string = 0
        if (sortKey === 'fecha') { av = a.fecha; bv = b.fecha }
        else if (sortKey === 'activo') { av = a.activo; bv = b.activo }
        else if (sortKey === 'resultado') { av = a.resultado; bv = b.resultado }
        else if (sortKey === 'pnl') {
          av = a.ganancia ?? (a.perdida ? -a.perdida : 0)
          bv = b.ganancia ?? (b.perdida ? -b.perdida : 0)
        }
        else if (sortKey === 'lotaje') { av = a.lotaje; bv = b.lotaje }
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [trades, search, filterResultado, filterDireccion, sortKey, sortDir])

  const totalPnl = filtered.reduce((acc, t) => {
    const pnl = t.ganancia ?? (t.perdida ? -t.perdida : 0)
    return acc + pnl
  }, 0)

  function exportCSV() {
    const headers = ['Fecha', 'Activo', 'Dirección', 'Entrada', 'Salida', 'SL', 'TP', 'Lotaje', 'Resultado', 'PnL', 'Emoción', 'Estrategia', 'Notas']
    const rows = filtered.map(t => [
      t.fecha, t.activo, t.direccion, t.precioEntrada, t.precioSalida ?? '', t.stopLoss ?? '', t.takeProfit ?? '',
      t.lotaje, t.resultado, t.ganancia ?? (t.perdida ? -t.perdida : 0), t.emocion ?? '', t.estrategia ?? '', t.notas,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bitacora_trades.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} className="opacity-30" />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} trades · PnL total: <span className={`font-mono font-semibold ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>{totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}$</span></p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground hover:text-foreground border border-border rounded-md text-sm transition-colors">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar activo, notas, estrategia…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-8" />
        </div>
        <select value={filterResultado} onChange={e => setFilterResultado(e.target.value as Outcome | '')} className="input-base w-auto min-w-36">
          <option value="">Todos los resultados</option>
          {(['GANANCIA', 'PERDIDA', 'BREAKEVEN', 'ABIERTO'] as Outcome[]).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select value={filterDireccion} onChange={e => setFilterDireccion(e.target.value as Direction | '')} className="input-base w-auto min-w-32">
          <option value="">Todas las dir.</option>
          <option value="LONG">LONG</option>
          <option value="SHORT">SHORT</option>
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-20" />
          <p>No se encontraron trades con los filtros actuales.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {[
                    { key: 'fecha' as SortKey, label: 'Fecha' },
                    { key: 'activo' as SortKey, label: 'Activo' },
                    { key: 'resultado' as SortKey, label: 'Resultado' },
                    { key: 'pnl' as SortKey, label: 'PnL' },
                    { key: 'lotaje' as SortKey, label: 'Lotaje' },
                  ].map(col => (
                    <th key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none">
                      <span className="flex items-center gap-1">{col.label} <SortIcon k={col.key} /></span>
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide">Emoción</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide">Estrategia</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const pnl = t.ganancia ?? (t.perdida ? -t.perdida : null)
                  return (
                    <tr key={t.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{t.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                            ${t.direccion === 'LONG' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'}`}>
                            {t.direccion === 'LONG' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          </span>
                          <span className="font-semibold">{t.activo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${t.resultado === 'GANANCIA' ? 'bg-profit/20 text-profit'
                            : t.resultado === 'PERDIDA' ? 'bg-loss/20 text-loss'
                            : t.resultado === 'BREAKEVEN' ? 'bg-muted-foreground/20 text-muted-foreground'
                            : 'bg-primary/20 text-primary'}`}>
                          {t.resultado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pnl !== null ? (
                          <span className={`font-mono font-semibold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{t.lotaje}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.emocion ? <span title={t.emocion}>{EMOTION_EMOJI[t.emocion]} {t.emocion}</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{t.estrategia ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-muted-foreground hover:text-loss transition-colors rounded">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}