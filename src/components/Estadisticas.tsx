import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts'
import { getTrades } from '../store'
import type { Trade } from '../types'

const COLORS = {
  profit: '#21C45D',
  loss: '#EF4444',
  primary: '#FBBD23',
  neutral: '#6B7280',
}

export default function Estadisticas() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => { setTrades(getTrades()) }, [])

  const stats = useMemo(() => {
    const closed = trades.filter(t => t.resultado !== 'ABIERTO')
    const wins = closed.filter(t => t.resultado === 'GANANCIA')
    const losses = closed.filter(t => t.resultado === 'PERDIDA')
    const be = closed.filter(t => t.resultado === 'BREAKEVEN')
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0

    const totalGain = wins.reduce((s, t) => s + (t.ganancia ?? 0), 0)
    const totalLoss = losses.reduce((s, t) => s + (t.perdida ?? 0), 0)
    const netPnl = totalGain - totalLoss

    const avgWin = wins.length > 0 ? totalGain / wins.length : 0
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0
    const expectancy = wins.length > 0 && losses.length > 0
      ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss
      : 0

    // Equity curve: cumulative PnL per trade (sorted by date)
    const sorted = [...trades]
      .filter(t => t.resultado !== 'ABIERTO')
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    let cumPnl = 0
    const equityCurve = sorted.map(t => {
      const pnl = t.ganancia ?? (t.perdida ? -t.perdida : 0)
      cumPnl += pnl
      return { fecha: t.fecha, pnl: parseFloat(cumPnl.toFixed(2)), trade: t.activo }
    })

    // Monthly PnL
    const byMonth: Record<string, number> = {}
    sorted.forEach(t => {
      const m = t.fecha.slice(0, 7)
      const pnl = t.ganancia ?? (t.perdida ? -t.perdida : 0)
      byMonth[m] = (byMonth[m] ?? 0) + pnl
    })
    const monthlyData = Object.entries(byMonth).map(([month, pnl]) => ({
      month, pnl: parseFloat(pnl.toFixed(2)),
    })).sort((a, b) => a.month.localeCompare(b.month))

    // By asset
    const byAsset: Record<string, { wins: number; losses: number; pnl: number }> = {}
    closed.forEach(t => {
      if (!byAsset[t.activo]) byAsset[t.activo] = { wins: 0, losses: 0, pnl: 0 }
      if (t.resultado === 'GANANCIA') { byAsset[t.activo].wins++; byAsset[t.activo].pnl += t.ganancia ?? 0 }
      if (t.resultado === 'PERDIDA') { byAsset[t.activo].losses++; byAsset[t.activo].pnl -= t.perdida ?? 0 }
    })
    const assetData = Object.entries(byAsset)
      .map(([activo, d]) => ({ activo, ...d, pnl: parseFloat(d.pnl.toFixed(2)) }))
      .sort((a, b) => b.pnl - a.pnl).slice(0, 8)

    // Outcome pie
    const pieData = [
      { name: 'Ganancias', value: wins.length, color: COLORS.profit },
      { name: 'Pérdidas', value: losses.length, color: COLORS.loss },
      { name: 'Breakeven', value: be.length, color: COLORS.neutral },
    ].filter(d => d.value > 0)

    // Emotion performance
    const byEmotion: Record<string, { wins: number; total: number }> = {}
    closed.forEach(t => {
      if (!t.emocion) return
      if (!byEmotion[t.emocion]) byEmotion[t.emocion] = { wins: 0, total: 0 }
      byEmotion[t.emocion].total++
      if (t.resultado === 'GANANCIA') byEmotion[t.emocion].wins++
    })
    const emotionData = Object.entries(byEmotion).map(([emocion, d]) => ({
      emocion, winRate: parseFloat(((d.wins / d.total) * 100).toFixed(1)), total: d.total,
    })).sort((a, b) => b.winRate - a.winRate)

    return { closed, wins, losses, winRate, netPnl, avgWin, avgLoss, expectancy, equityCurve, monthlyData, assetData, pieData, emotionData, totalGain, totalLoss }
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-muted-foreground gap-3">
        <div className="text-4xl opacity-30">📊</div>
        <p>No hay datos suficientes para mostrar estadísticas.</p>
        <p className="text-sm">Registra al menos un trade para empezar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>
        <p className="text-muted-foreground text-sm mt-1">Análisis de rendimiento basado en {stats.closed.length} trades cerrados</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="PnL Neto" value={`${stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}$`}
          color={stats.netPnl >= 0 ? 'profit' : 'loss'} />
        <KpiCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`}
          color={stats.winRate >= 50 ? 'profit' : 'loss'} />
        <KpiCard label="Expectativa" value={`${stats.expectancy >= 0 ? '+' : ''}${stats.expectancy.toFixed(2)}$`}
          color={stats.expectancy >= 0 ? 'profit' : 'loss'} />
        <KpiCard label="Total Trades" value={`${stats.closed.length}`} color="primary" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ganancia Total" value={`+${stats.totalGain.toFixed(2)}$`} color="profit" small />
        <KpiCard label="Pérdida Total" value={`-${stats.totalLoss.toFixed(2)}$`} color="loss" small />
        <KpiCard label="Promedio Ganancia" value={`${stats.avgWin.toFixed(2)}$`} color="profit" small />
        <KpiCard label="Promedio Pérdida" value={`${stats.avgLoss.toFixed(2)}$`} color="loss" small />
      </div>

      {/* Equity curve */}
      {stats.equityCurve.length > 1 && (
        <ChartCard title="Curva de Equidad">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.equityCurve} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ background: 'hsl(220 15% 10%)', border: '1px solid hsl(220 13% 18%)', borderRadius: '6px', fontSize: '12px' }}
                labelStyle={{ color: '#E5E7EB' }} />
              <Line type="monotone" dataKey="pnl" stroke={COLORS.primary} strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: COLORS.primary }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly PnL */}
        {stats.monthlyData.length > 0 && (
          <ChartCard title="PnL Mensual">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ background: 'hsl(220 15% 10%)', border: '1px solid hsl(220 13% 18%)', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {stats.monthlyData.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? COLORS.profit : COLORS.loss} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Outcome pie */}
        {stats.pieData.length > 0 && (
          <ChartCard title="Distribución de Resultados">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {stats.pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10}
                  formatter={(value) => <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{value}</span>} />
                <Tooltip contentStyle={{ background: 'hsl(220 15% 10%)', border: '1px solid hsl(220 13% 18%)', borderRadius: '6px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* By asset */}
        {stats.assetData.length > 0 && (
          <ChartCard title="Rendimiento por Activo">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.assetData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis type="category" dataKey="activo" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ background: 'hsl(220 15% 10%)', border: '1px solid hsl(220 13% 18%)', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                  {stats.assetData.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? COLORS.profit : COLORS.loss} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Emotion performance */}
        {stats.emotionData.length > 0 && (
          <ChartCard title="Win Rate por Emoción">
            <div className="space-y-2 mt-2">
              {stats.emotionData.map(e => (
                <div key={e.emocion} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{e.emocion}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${e.winRate}%`,
                        backgroundColor: e.winRate >= 60 ? COLORS.profit : e.winRate >= 40 ? COLORS.primary : COLORS.loss,
                      }} />
                  </div>
                  <span className="text-xs font-mono text-foreground w-12 text-right">{e.winRate}%</span>
                  <span className="text-xs text-muted-foreground w-8 text-right">{e.total}x</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, color, small }: { label: string; value: string; color: 'profit' | 'loss' | 'primary'; small?: boolean }) {
  const c = color === 'profit' ? 'text-profit' : color === 'loss' ? 'text-loss' : 'text-primary'
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-mono font-bold ${small ? 'text-lg' : 'text-2xl'} ${c}`}>{value}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}