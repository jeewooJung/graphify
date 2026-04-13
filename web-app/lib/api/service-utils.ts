export type RawRecord = Record<string, unknown>

const EMPTY_RECORD: RawRecord = {}

export function asRecord(value: unknown): RawRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as RawRecord)
    : EMPTY_RECORD
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function toString(value: unknown, fallback = '') {
  return typeof value === 'string'
    ? value
    : typeof value === 'number'
      ? String(value)
      : fallback
}

export function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

export function normalizeDate(value: unknown, fallback = '') {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
    return fallback
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

export function resolveItems(value: unknown, keys: string[]) {
  if (Array.isArray(value)) {
    return value
  }

  const record = asRecord(value)
  for (const key of keys) {
    const items = record[key]
    if (Array.isArray(items)) {
      return items
    }
  }

  return []
}
