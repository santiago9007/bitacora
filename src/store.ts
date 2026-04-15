import { Trade, Strategy, EmotionEntry } from './types'
import { supabase } from '../src/lib/supabaseClient'

const KEYS = {
  trades: 'bitacora_trades',
  strategies: 'bitacora_strategies',
  emotions: 'bitacora_emotions',
}

// Funciones genéricas para cargar y guardar datos en localStorage con manejo de errores
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// Trades
export function getTrades(): Trade[] {
  return load<Trade[]>(KEYS.trades, [])
}

export function saveTrade(trade: Trade): void {
  const trades = getTrades()
  const idx = trades.findIndex(t => t.id === trade.id)
  if (idx >= 0) {
    trades[idx] = trade
  } else {
    trades.unshift(trade)
  }
  save(KEYS.trades, trades)
}

export function deleteTrade(id: string): void {
  const trades = getTrades().filter(t => t.id !== id)
  save(KEYS.trades, trades)
}

// Strategies
export function getStrategies(): Strategy[] {
  return load<Strategy[]>(KEYS.strategies, [])
}

export function saveStrategy(strategy: Strategy): void {
  const strategies = getStrategies()
  const idx = strategies.findIndex(s => s.id === strategy.id)
  if (idx >= 0) {
    strategies[idx] = strategy
  } else {
    strategies.unshift(strategy)
  }
  save(KEYS.strategies, strategies)
}

export function deleteStrategy(id: string): void {
  const strategies = getStrategies().filter(s => s.id !== id)
  save(KEYS.strategies, strategies)
}

// Emotion Entries
export function getEmotions(): EmotionEntry[] {
  return load<EmotionEntry[]>(KEYS.emotions, [])
}

export function saveEmotion(entry: EmotionEntry): void {
  const entries = getEmotions()
  const idx = entries.findIndex(e => e.id === entry.id)
  if (idx >= 0) {
    entries[idx] = entry
  } else {
    entries.unshift(entry)
  }
  save(KEYS.emotions, entries)
}

export function deleteEmotion(id: string): void {
  const entries = getEmotions().filter(e => e.id !== id)
  save(KEYS.emotions, entries)
}

// Helpers 
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}