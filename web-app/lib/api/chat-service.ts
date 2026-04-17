import { api } from '@/lib/api/client'
import type {
  ChatAnswerRequest,
  ChatScope,
  ChatSession,
  ChatSessionSummary,
  Citation,
  ConversationMessage,
  AssistantAnswer,
  UserMessage,
} from '@/types/chat'
import {
  asRecord,
  normalizeDate,
  resolveItems,
  toNumber,
  toString,
} from '@/lib/api/service-utils'

type ServiceResult<T> = {
  data?: T
  error?: string
  status: number
}

function mapScope(value: unknown): ChatScope {
  const raw = asRecord(value)
  const kind = toString(raw.kind ?? raw.scopeType ?? raw.scope_type, 'WORKSPACE').toUpperCase()
  const scopeId = toString(raw.scopeId ?? raw.scope_id ?? raw.projectId ?? raw.project_id ?? raw.teamId ?? raw.team_id)

  if (kind === 'TEAM') {
    return { kind: 'TEAM', teamId: scopeId }
  }

  if (kind === 'PROJECT') {
    return { kind: 'PROJECT', projectId: scopeId }
  }

  return { kind: 'WORKSPACE' }
}

function scopeToParams(scope?: ChatScope) {
  if (!scope) {
    return {}
  }

  if (scope.kind === 'TEAM') {
    return { scopeType: 'TEAM', scopeId: scope.teamId }
  }

  if (scope.kind === 'PROJECT') {
    return { scopeType: 'PROJECT', scopeId: scope.projectId }
  }

  return { scopeType: 'WORKSPACE' }
}

function mapCitation(rawValue: unknown): Citation {
  const relation = asRecord(rawValue)
  const raw = asRecord(relation.citation)
  const source = Object.keys(raw).length > 0 ? raw : relation
  const document = asRecord(source.document ?? relation.document)
  const project = asRecord(source.project ?? document.project ?? relation.project)

  return {
    id: toString(source.id ?? relation.citationId ?? relation.citation_id),
    documentId: toString(source.documentId ?? source.document_id ?? relation.documentId ?? relation.document_id ?? document.id),
    chunkId: toString(source.chunkId ?? source.chunk_id ?? relation.chunkId ?? relation.chunk_id),
    projectId: toString(source.projectId ?? source.project_id ?? relation.projectId ?? relation.project_id ?? project.id),
    projectName: toString(source.projectName ?? source.project_name ?? relation.projectName ?? relation.project_name ?? project.name),
    documentTitle: toString(source.documentTitle ?? source.document_title ?? relation.documentTitle ?? relation.document_title ?? document.title ?? document.name),
    quoteText: toString(source.quoteText ?? source.quote_text ?? relation.quoteText ?? relation.quote_text ?? source.text),
    pageNumber: toNumber(source.pageNumber ?? source.page_number ?? relation.pageNumber ?? relation.page_number),
    relevanceScore: toNumber(source.relevanceScore ?? source.relevance_score ?? relation.relevanceScore ?? relation.relevance_score) ?? 0,
  }
}

function mapAssistantAnswer(rawValue: unknown): AssistantAnswer {
  const raw = asRecord(rawValue)
  const followUps = resolveItems(raw.suggestedFollowUps ?? raw.suggested_follow_ups, ['items'])

  return {
    id: toString(raw.id ?? raw.messageId ?? raw.message_id),
    sessionId: toString(raw.sessionId ?? raw.session_id),
    role: 'assistant',
    content: toString(raw.content ?? raw.answer ?? raw.text),
    modelName: toString(raw.modelName ?? raw.model_name ?? raw.model),
    confidence: toNumber(raw.confidence),
    citations: resolveItems(raw.answer_citations ?? raw.citations, ['items']).map(mapCitation),
    suggestedFollowUps: followUps.map((item, index) => {
      const value = asRecord(item)
      return {
        id: toString(value.id, `follow-up-${index}`),
        text: toString(value.text ?? value.label ?? item),
      }
    }),
    createdAt: normalizeDate(raw.createdAt ?? raw.created_at),
  }
}

function mapConversationMessage(rawValue: unknown): ConversationMessage {
  const raw = asRecord(rawValue)
  const role = toString(raw.role).toLowerCase()
  const base = {
    id: toString(raw.id ?? raw.messageId ?? raw.message_id),
    sessionId: toString(raw.sessionId ?? raw.session_id),
    createdAt: normalizeDate(raw.createdAt ?? raw.created_at),
  }

  if (role === 'user') {
    return {
      ...base,
      role: 'user',
      content: toString(raw.content ?? raw.text),
    }
  }

  if (role === 'assistant') {
    return mapAssistantAnswer({ ...raw, ...base })
  }

  const variant = toString(raw.variant ?? raw.systemVariant ?? raw.system_variant)
  return {
    ...base,
    role: 'system',
    variant:
      variant === 'insufficient_evidence' || variant === 'permission_warning'
        ? variant
        : 'info',
    content: toString(raw.content ?? raw.text),
  }
}

function mapSessionSummary(rawValue: unknown): ChatSessionSummary {
  const raw = asRecord(rawValue)
  return {
    id: toString(raw.id ?? raw.sessionId ?? raw.session_id),
    title: toString(raw.title, 'Untitled chat'),
    scope: mapScope(raw.scope ?? raw),
    lastMessageAt: normalizeDate(raw.lastMessageAt ?? raw.last_message_at ?? raw.updatedAt ?? raw.updated_at),
    createdBy: toString(raw.createdBy ?? raw.created_by ?? raw.owner ?? raw.userName ?? raw.username),
  }
}

function mapSession(rawValue: unknown): ChatSession {
  const raw = asRecord(rawValue)
  const summary = mapSessionSummary(raw)
  return {
    ...summary,
    createdAt: normalizeDate(raw.createdAt ?? raw.created_at),
    updatedAt: normalizeDate(raw.updatedAt ?? raw.updated_at ?? raw.lastMessageAt ?? raw.last_message_at),
  }
}

function mapUserMessage(rawValue: unknown): UserMessage {
  const message = mapConversationMessage({ ...asRecord(rawValue), role: 'user' })
  return message.role === 'user'
    ? message
    : { id: '', sessionId: '', role: 'user', content: '', createdAt: '' }
}

export const chatService = {
  async getSessions(
    options: { scope?: ChatScope; limit?: number } = {}
  ): Promise<ServiceResult<ChatSessionSummary[]>> {
    const params = new URLSearchParams()
    const scopeParams = scopeToParams(options.scope)
    if (scopeParams.scopeType) params.set('scopeType', scopeParams.scopeType)
    if (scopeParams.scopeId) params.set('scopeId', scopeParams.scopeId)
    if (typeof options.limit === 'number') params.set('limit', String(options.limit))
    const query = params.toString()
    const response = await api.get<unknown>(`/chat/sessions${query ? `?${query}` : ''}`)

    if (response.error || !response.data) {
      return { ...response, data: [] as ChatSessionSummary[] }
    }

    return {
      ...response,
      data: resolveItems(response.data, ['sessions', 'items', 'data']).map(mapSessionSummary),
    }
  },

  async getSession(sessionId: string): Promise<ServiceResult<ChatSession>> {
    const response = await api.get<unknown>(`/chat/sessions/${encodeURIComponent(sessionId)}`)
    if (response.error || !response.data) {
      return response as ServiceResult<ChatSession>
    }

    return { ...response, data: mapSession(asRecord(response.data).session ?? response.data) }
  },

  async createSession(
    payload: { scope: ChatScope; title?: string }
  ): Promise<ServiceResult<ChatSession>> {
    const scope = scopeToParams(payload.scope)
    const response = await api.post<unknown>('/chat/sessions', {
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      title: payload.title,
    })

    if (response.error || !response.data) {
      return response as ServiceResult<ChatSession>
    }

    return { ...response, data: mapSession(asRecord(response.data).session ?? response.data) }
  },

  async getMessages(
    sessionId: string,
    options: { before?: string; limit?: number } = {}
  ): Promise<ServiceResult<ConversationMessage[]>> {
    const params = new URLSearchParams()
    if (options.before) params.set('before', options.before)
    if (typeof options.limit === 'number') params.set('limit', String(options.limit))
    const query = params.toString()
    const response = await api.get<unknown>(`/chat/sessions/${encodeURIComponent(sessionId)}/messages${query ? `?${query}` : ''}`)

    if (response.error || !response.data) {
      return { ...response, data: [] as ConversationMessage[] }
    }

    return {
      ...response,
      data: resolveItems(response.data, ['messages', 'items', 'data']).map(mapConversationMessage),
    }
  },

  async postMessage(
    sessionId: string,
    payload: { content: string }
  ): Promise<ServiceResult<{ user: UserMessage; answer: AssistantAnswer }>> {
    const response = await api.post<unknown>(
      `/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
      payload
    )

    if (response.error || !response.data) {
      return response as ServiceResult<{ user: UserMessage; answer: AssistantAnswer }>
    }

    const raw = asRecord(response.data)
    const items = Array.isArray(response.data) ? response.data : []
    const userRaw = raw.userMessage ?? raw.user ?? items[0]
    const answerRaw = raw.assistantAnswer ?? raw.answer ?? items[1]

    return {
      ...response,
      data: {
        user: mapUserMessage(userRaw),
        answer: mapAssistantAnswer({ ...asRecord(answerRaw), role: 'assistant' }),
      },
    }
  },

  async answer(payload: ChatAnswerRequest): Promise<ServiceResult<AssistantAnswer>> {
    const scope = scopeToParams(payload.scope)
    const response = await api.post<unknown>('/chat/answer', {
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      content: payload.content,
      sessionId: payload.sessionId,
    })

    if (response.error || !response.data) {
      return response as ServiceResult<AssistantAnswer>
    }

    return { ...response, data: mapAssistantAnswer({ ...asRecord(response.data), role: 'assistant' }) }
  },
}
