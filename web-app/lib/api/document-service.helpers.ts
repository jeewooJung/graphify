import type {
  DocumentChunk,
  DocumentDetail,
  DocumentFilterState,
  DocumentSummary,
} from '@/types/document'
import {
  asArray,
  asRecord,
  normalizeDate,
  resolveItems,
  toNumber,
  toString,
} from '@/lib/api/service-utils'

function mapDocumentStatus(value: unknown): DocumentSummary['status'] {
  const status = toString(value, 'UPLOADED').toUpperCase()
  return ['UPLOADED', 'QUEUED', 'PARSING', 'INDEXING', 'READY', 'FAILED'].includes(status)
    ? (status as DocumentSummary['status'])
    : 'UPLOADED'
}

function mapJobStatus(value: unknown): DocumentSummary['jobStatus'] {
  const status = toString(value).toUpperCase()
  return ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'].includes(status)
    ? (status as NonNullable<DocumentSummary['jobStatus']>)
    : undefined
}

function mapTags(value: unknown) {
  return asArray(value)
    .map((tag) => {
      const raw = asRecord(tag)
      return toString(raw.name ?? raw.label ?? tag)
    })
    .filter(Boolean)
}

export function mapDocumentSummary(rawValue: unknown): DocumentSummary {
  const raw = asRecord(rawValue)

  return {
    id: toString(raw.id ?? raw.documentId ?? raw.document_id),
    title: toString(raw.title ?? raw.name ?? raw.filename ?? raw.fileName, 'Untitled document'),
    originalFilename: toString(raw.originalFilename ?? raw.original_filename ?? raw.fileName ?? raw.filename),
    mimeType: toString(raw.mimeType ?? raw.mime_type, 'application/octet-stream'),
    fileSize: toNumber(raw.fileSize ?? raw.file_size ?? raw.sizeBytes ?? raw.size_bytes ?? raw.size) ?? 0,
    status: mapDocumentStatus(raw.status),
    progressPct: toNumber(raw.progressPct ?? raw.progress_pct ?? raw.progress),
    jobStatus: mapJobStatus(raw.jobStatus ?? raw.job_status),
    uploadedBy: toString(raw.uploadedBy ?? raw.uploaded_by ?? raw.createdBy ?? raw.created_by ?? raw.owner, 'Unknown'),
    uploadedAt: normalizeDate(raw.uploadedAt ?? raw.uploaded_at ?? raw.createdAt ?? raw.created_at),
    tags: mapTags(raw.tags),
    summary: toString(raw.summary ?? raw.description),
  }
}

export function mapDocumentDetail(rawValue: unknown): DocumentDetail {
  const raw = asRecord(rawValue)
  const summary = mapDocumentSummary(raw)
  const sourceType = toString(raw.sourceType ?? raw.source_type, 'UPLOAD').toUpperCase()

  return {
    ...summary,
    updatedAt: normalizeDate(raw.updatedAt ?? raw.updated_at ?? raw.uploadedAt ?? raw.uploaded_at),
    storagePath: toString(raw.storagePath ?? raw.storage_path) || undefined,
    sourceType:
      sourceType === 'IMPORT' || sourceType === 'URL' ? sourceType : 'UPLOAD',
    chunkCount: toNumber(raw.chunkCount ?? raw.chunk_count) ?? 0,
    lastAnalysisLog: toString(raw.lastAnalysisLog ?? raw.last_analysis_log) || undefined,
  }
}

export function mapDocumentChunk(rawValue: unknown): DocumentChunk {
  const raw = asRecord(rawValue)
  return {
    id: toString(raw.id ?? raw.chunkId ?? raw.chunk_id),
    documentId: toString(raw.documentId ?? raw.document_id),
    chunkIndex: toNumber(raw.chunkIndex ?? raw.chunk_index ?? raw.index) ?? 0,
    content: toString(raw.content ?? raw.text),
    tokenCount: toNumber(raw.tokenCount ?? raw.token_count) ?? 0,
    pageNumber: toNumber(raw.pageNumber ?? raw.page_number),
    sectionTitle: toString(raw.sectionTitle ?? raw.section_title) || undefined,
  }
}

export function buildDocumentQuery(
  filter: Partial<DocumentFilterState>,
  options: { limit?: number; offset?: number; sort?: 'recent' | 'title' }
) {
  const params = new URLSearchParams()

  for (const status of filter.statuses ?? []) params.append('statuses', status)
  for (const docType of filter.docTypes ?? []) params.append('docTypes', docType)
  for (const tag of filter.tags ?? []) params.append('tags', tag)
  if (filter.query) params.set('q', filter.query)
  if (filter.uploadedFrom) params.set('uploadedFrom', new Date(filter.uploadedFrom).toISOString())
  if (filter.uploadedTo) params.set('uploadedTo', new Date(filter.uploadedTo).toISOString())
  if (typeof options.limit === 'number') params.set('limit', String(options.limit))
  if (typeof options.offset === 'number') params.set('offset', String(options.offset))
  if (options.sort) params.set('sort', options.sort)

  return params.toString()
}

export { asRecord, resolveItems }
