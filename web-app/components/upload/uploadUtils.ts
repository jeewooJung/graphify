export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

export function formatAcceptList(accept: string[]): string {
  return accept
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.startsWith('.')) return item.slice(1).toUpperCase()
      if (item.includes('/')) return item.split('/').pop()?.toUpperCase() ?? item
      return item.toUpperCase()
    })
    .join(', ')
}

export function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)))
}

export function matchesAccept(file: File, accept: string[]): boolean {
  if (accept.length === 0) return true

  const extension = getExtension(file.name)

  return accept.some((rule) => {
    const value = rule.trim().toLowerCase()
    if (!value) return false
    if (value.startsWith('.')) return extension === value
    if (value.endsWith('/*')) return file.type.toLowerCase().startsWith(value.slice(0, -1))
    return file.type.toLowerCase() === value || extension === `.${value.split('/').pop() ?? ''}`
  })
}

function getExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index >= 0 ? filename.slice(index).toLowerCase() : ''
}
