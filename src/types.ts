export type Page = 'registro' | 'calculadora' | 'historial' | 'estadisticas' | 'estrategias' | 'emocion' 

export type Direction = 'LONG' | 'SHORT'
export type Outcome = 'GANANCIA' | 'PERDIDA' | 'BREAKEVEN' | 'ABIERTO'

export type Emotion =
  | 'Sereno'
  | 'Confiado'
  | 'Ansioso'
  | 'FOMO'
  | 'Vengativo'
  | 'Disciplinado'
  | 'Impulsivo'
  | 'Dudoso'
  | 'Eufórico'
  | 'Frustrado'

export interface Trade {
  id: string
  fecha: string            // ISO date string
  activo: string           // e.g. EURUSD, BTC/USDT
  direccion: Direction
  precioEntrada: number
  precioSalida: number | null
  stopLoss: number | null
  takeProfit: number | null
  lotaje: number
  ganancia: number | null  // in account currency
  perdida: number | null
  resultado: Outcome
  emocion: Emotion | null
  estrategia: string | null
  notas: string
  screenshotUrl?: string
}

export interface Strategy {
  id: string
  nombre: string
  descripcion: string
  activos: string[]
  winRate: number | null     // percentage
  createdAt: string
}

export interface EmotionEntry {
  id: string
  fecha: string
  emocion: Emotion
  descripcion: string
  tradeId?: string
}

export interface RiskCalc {
  capitalCuenta: number
  riesgoPorc: number
  entradaPrecio: number
  stopLossPrecio: number
  takeProfitPrecio: number
  tipoActivo: 'forex' | 'crypto' | 'acciones' | 'futuros' | 'binaria' | 'blitz' | 'digital' | 'materias primas'
  pipValue: number
}