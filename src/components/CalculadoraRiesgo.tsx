import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import type { RiskCalc } from '../types'

const DEFAULTS: RiskCalc = {
  capitalCuenta: 10000,
  riesgoPorc: 1,
  entradaPrecio: 1.1000,
  stopLossPrecio: 1.0950,
  takeProfitPrecio: 1.1100,
  tipoActivo: 'forex',
  pipValue: 10,
}

const ASSET_TYPES = [
  { value: 'forex', label: 'Forex' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'acciones', label: 'Acciones' },
  { value: 'futuros', label: 'Futuros' },
] as const

export default function CalculadoraRiesgo() {
  const [calc, setCalc] = useState<RiskCalc>(DEFAULTS)

  const set = (key: keyof RiskCalc, val: unknown) =>
    setCalc(prev => ({ ...prev, [key]: val }))

  // Derived calculations
  const riesgoUSD = (calc.capitalCuenta * calc.riesgoPorc) / 100
  const diferenciaSL = Math.abs(calc.entradaPrecio - calc.stopLossPrecio)
  const diferenciaTP = Math.abs(calc.entradaPrecio - calc.takeProfitPrecio)

  let lotaje = 0
  let pipsSL = 0
  let pipsTP = 0
  let rrRatio = 0
  let gananciaUSD = 0

  if (diferenciaSL > 0) {
    if (calc.tipoActivo === 'forex') {
      pipsSL = Math.round(diferenciaSL / 0.0001)
      pipsTP = Math.round(diferenciaTP / 0.0001)
      lotaje = pipsSL > 0 ? riesgoUSD / (pipsSL * calc.pipValue) : 0
      gananciaUSD = lotaje * pipsTP * calc.pipValue
    } else if (calc.tipoActivo === 'crypto') {
      lotaje = riesgoUSD / diferenciaSL
      gananciaUSD = lotaje * diferenciaTP
      pipsSL = diferenciaSL
      pipsTP = diferenciaTP
    } else {
      lotaje = riesgoUSD / diferenciaSL
      gananciaUSD = lotaje * diferenciaTP
      pipsSL = diferenciaSL
      pipsTP = diferenciaTP
    }
    rrRatio = diferenciaTP > 0 ? diferenciaTP / diferenciaSL : 0
  }

  const isLong = calc.takeProfitPrecio > calc.entradaPrecio
  const breakEvenWinRate = rrRatio > 0 ? (1 / (1 + rrRatio)) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calculadora de Riesgo</h1>
        <p className="text-muted-foreground text-sm mt-1">Calcula el lotaje óptimo y ratio R:R en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-card space-y-5">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <Calculator size={16} className="text-primary" />
            Parámetros
          </h2>

          {/* Asset type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo de Activo</label>
            <div className="grid grid-cols-4 gap-2">
              {ASSET_TYPES.map(a => (
                <button key={a.value} type="button"
                  onClick={() => set('tipoActivo', a.value)}
                  className={`py-2 rounded-md text-sm font-medium transition-colors border
                    ${calc.tipoActivo === a.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/40'}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Capital ($)</label>
              <input type="number" step="100" value={calc.capitalCuenta}
                onChange={e => set('capitalCuenta', parseFloat(e.target.value) || 0)}
                className="input-base font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Riesgo (%)</label>
              <input type="number" step="0.1" min="0.1" max="10" value={calc.riesgoPorc}
                onChange={e => set('riesgoPorc', parseFloat(e.target.value) || 1)}
                className="input-base font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Precio Entrada</label>
              <input type="number" step="any" value={calc.entradaPrecio}
                onChange={e => set('entradaPrecio', parseFloat(e.target.value) || 0)}
                className="input-base font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Stop Loss</label>
              <input type="number" step="any" value={calc.stopLossPrecio}
                onChange={e => set('stopLossPrecio', parseFloat(e.target.value) || 0)}
                className="input-base font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Take Profit</label>
              <input type="number" step="any" value={calc.takeProfitPrecio}
                onChange={e => set('takeProfitPrecio', parseFloat(e.target.value) || 0)}
                className="input-base font-mono" />
            </div>
            {calc.tipoActivo === 'forex' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Valor por Pip ($)</label>
                <input type="number" step="any" value={calc.pipValue}
                  onChange={e => set('pipValue', parseFloat(e.target.value) || 10)}
                  className="input-base font-mono" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Main result */}
          <div className="bg-card border border-primary/30 rounded-lg p-6 shadow-glow">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Lotaje Recomendado</p>
            <p className="text-5xl font-mono font-bold text-primary">
              {lotaje > 0 ? lotaje.toFixed(2) : '—'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Riesgo: <span className="font-mono text-loss font-semibold">${riesgoUSD.toFixed(2)}</span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Ratio R:R" value={rrRatio > 0 ? `1:${rrRatio.toFixed(2)}` : '—'}
              color={rrRatio >= 2 ? 'profit' : rrRatio >= 1 ? 'primary' : 'loss'} />
            <StatBox label="Ganancia Est." value={gananciaUSD > 0 ? `$${gananciaUSD.toFixed(2)}` : '—'}
              color="profit" />
            <StatBox label={calc.tipoActivo === 'forex' ? 'Pips SL' : 'Diferencia SL'}
              value={pipsSL > 0 ? (calc.tipoActivo === 'forex' ? `${pipsSL} pips` : pipsSL.toFixed(5)) : '—'}
              color="loss" />
            <StatBox label={calc.tipoActivo === 'forex' ? 'Pips TP' : 'Diferencia TP'}
              value={pipsTP > 0 ? (calc.tipoActivo === 'forex' ? `${pipsTP} pips` : pipsTP.toFixed(5)) : '—'}
              color="profit" />
          </div>

          {/* Direction indicator */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border
            ${isLong ? 'bg-profit/10 border-profit/30' : 'bg-loss/10 border-loss/30'}`}>
            {isLong
              ? <TrendingUp size={20} className="text-profit" />
              : <TrendingDown size={20} className="text-loss" />}
            <div>
              <p className={`font-semibold ${isLong ? 'text-profit' : 'text-loss'}`}>
                Posición {isLong ? 'LONG' : 'SHORT'}
              </p>
              <p className="text-xs text-muted-foreground">
                Win rate de equilibrio: {breakEvenWinRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Advice */}
          {rrRatio > 0 && rrRatio < 1.5 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <AlertTriangle size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary">
                Ratio R:R bajo. Se recomienda mínimo 1:1.5 para operar con consistencia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'profit' | 'loss' | 'primary' }) {
  const colorClass = color === 'profit' ? 'text-profit' : color === 'loss' ? 'text-loss' : 'text-primary'
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-mono font-bold text-xl ${colorClass}`}>{value}</p>
    </div>
  )
}