import { api } from './client'
import { chatService } from '@/lib/api/chat-service'
import { documentService } from '@/lib/api/document-service'
import {
  asArray,
  asRecord,
  normalizeDate,
  resolveItems,
  toNumber,
  toString,
} from '@/lib/api/service-utils'
import type { ChatSessionSummary } from '@/types/chat'
import type {
  DocumentSummary,
  ProjectDetail,
  ProjectMetrics,
} from '@/types/document'

type ServiceResult<T> = {
  data?: T
  error?: string
  status: number
}

type ProjectSummaryData = {
  detail: ProjectDetail
  metrics: ProjectMetrics
  recentDocuments: DocumentSummary[]
  recentSessions: ChatSessionSummary[]
}

export interface Project {
  id: string
  name: string
  description: string
  owner: string
  memberCount: number
  graphCount: number
  createdDate: string
  lastModified: string
  status: 'active' | 'archived'
}

function normalizeStatus(value: unknown): Project['status'] {
  return toString(value).toLowerCase() === 'archived' ? 'archived' : 'active'
}

function mapProjectDetailPayload(rawValue: unknown) {
  const raw = asRecord(rawValue)
  const owner = asRecord(raw.owner)
  const team = asRecord(raw.team)
  const members = asArray(raw.members)

  return {
    detail: {
      id: toString(raw.id ?? raw.projectId ?? raw.project_id),
      name: toString(raw.name, 'Untitled project'),
      description: toString(raw.description) || undefined,
      ownerName: toString(raw.ownerName ?? raw.owner_name ?? owner.name ?? raw.owner, 'Unassigned'),
      teamId: toString(raw.teamId ?? raw.team_id ?? team.id) || undefined,
      teamName: toString(raw.teamName ?? raw.team_name ?? team.name) || undefined,
      status: normalizeStatus(raw.status),
      createdAt: normalizeDate(raw.createdAt ?? raw.created_at),
      updatedAt: normalizeDate(raw.updatedAt ?? raw.updated_at),
    } satisfies ProjectDetail,
    memberCount:
      toNumber(raw.memberCount ?? raw.member_count ?? raw.membersCount ?? raw.members_count) ??
      members.length,
    lastUploadAt:
      normalizeDate(raw.lastUploadAt ?? raw.last_upload_at) || undefined,
  }
}

async function getDocumentsCount(projectId: string) {
  try {
    // Use direct fetch instead of the api helper because we need total-count/x-total-count
    // response headers here, and client.ts does not expose response headers.
    const response = await fetch(
      `/api/backend/projects/${encodeURIComponent(projectId)}/documents?limit=0`,
      { credentials: 'include' }
    )

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      return {
        count: 0,
        error:
          (typeof data === 'object' && data && 'message' in data && typeof data.message === 'string'
            ? data.message
            : `API Error: ${response.status}`),
        status: response.status,
      }
    }

    const headerCount = Number(
      response.headers.get('total-count') ?? response.headers.get('x-total-count') ?? ''
    )

    return {
      count: Number.isFinite(headerCount)
        ? headerCount
        : resolveItems(data, ['documents', 'items', 'data']).length,
      status: response.status,
    }
  } catch (error) {
    return {
      count: 0,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    }
  }
}

export const projectService = {
  async getProjects() {
    const response = await api.get<unknown[]>('/projects')

    if (response.error || !response.data) {
      return {
        ...response,
        data: [],
      }
    }

    return {
      ...response,
      data: response.data.map((project) => {
        const item = asRecord(project)
        return {
          id: toString(item.id),
          name: toString(item.name),
          description: toString(item.description),
          owner: toString(item.owner, 'Unassigned'),
          memberCount: toNumber(item.memberCount) ?? 0,
          graphCount: toNumber(item.graphCount) ?? 0,
          createdDate: item.createdDate
            ? new Date(toString(item.createdDate)).toLocaleDateString('en-CA')
            : '-',
          lastModified: item.lastModified
            ? new Date(toString(item.lastModified)).toLocaleDateString('en-CA')
            : '-',
          status: normalizeStatus(item.status),
        }
      }) as Project[],
    }
  },

  async getProject(projectId: string) {
    return api.get<Project>(`/projects/${projectId}`)
  },

  async createProject(data: Partial<Project>) {
    return api.post<Project>('/projects', data)
  },

  async updateProject(projectId: string, data: Partial<Project>) {
    return api.put<Project>(`/projects/${projectId}`, data)
  },

  async deleteProject(projectId: string) {
    return api.delete(`/projects/${projectId}`)
  },

  async getProjectDetail(projectId: string): Promise<ServiceResult<ProjectDetail>> {
    const response = await api.get<unknown>(`/projects/${encodeURIComponent(projectId)}`)
    if (response.error || !response.data) {
      return response as ServiceResult<ProjectDetail>
    }

    return {
      ...response,
      data: mapProjectDetailPayload(asRecord(response.data).project ?? response.data).detail,
    }
  },

  async getProjectMetrics(projectId: string): Promise<ServiceResult<ProjectMetrics>> {
    const [documentsResult, jobsResponse, detailResponse] = await Promise.all([
      getDocumentsCount(projectId),
      api.get<unknown>(`/projects/${encodeURIComponent(projectId)}/jobs?status=RUNNING,PENDING`),
      api.get<unknown>(`/projects/${encodeURIComponent(projectId)}`),
    ])

    const detail = detailResponse.error || !detailResponse.data
      ? undefined
      : mapProjectDetailPayload(asRecord(detailResponse.data).project ?? detailResponse.data)
    const runningJobs = jobsResponse.error || !jobsResponse.data
      ? 0
      : resolveItems(jobsResponse.data, ['jobs', 'items', 'data']).length
    const error = documentsResult.error || jobsResponse.error || detailResponse.error

    return {
      status:
        documentsResult.status || jobsResponse.status || detailResponse.status,
      error,
      data: {
        documentCount: documentsResult.count,
        lastUploadAt: detail?.lastUploadAt,
        runningJobCount: runningJobs,
        memberCount: detail?.memberCount ?? 0,
      } satisfies ProjectMetrics,
    }
  },

  async getProjectSummary(projectId: string): Promise<ServiceResult<ProjectSummaryData>> {
    const [detailResponse, metricsResponse, documentsResponse, sessionsResponse] = await Promise.all([
      this.getProjectDetail(projectId),
      this.getProjectMetrics(projectId),
      documentService.getProjectDocuments(projectId, {}, { limit: 5, sort: 'recent' }),
      chatService.getSessions({ scope: { kind: 'PROJECT', projectId }, limit: 5 }),
    ])

    if (!detailResponse.data || !metricsResponse.data) {
      return {
        status: detailResponse.status || metricsResponse.status,
        error: detailResponse.error || metricsResponse.error || 'Failed to load project summary',
      }
    }

    return {
      status:
        detailResponse.status ||
        metricsResponse.status ||
        documentsResponse.status ||
        sessionsResponse.status,
      error:
        detailResponse.error ||
        metricsResponse.error ||
        documentsResponse.error ||
        sessionsResponse.error,
      data: {
        detail: detailResponse.data,
        metrics: metricsResponse.data,
        recentDocuments: (documentsResponse.data ?? []) as DocumentSummary[],
        recentSessions: (sessionsResponse.data ?? []) as ChatSessionSummary[],
      } satisfies ProjectSummaryData,
    }
  },
}
