export const ROUTES = {
  chat: '/chat' as const,
  chatSession: <T extends string>(sessionId: T): `/chat/${T}` =>
    `/chat/${sessionId}` as `/chat/${T}`,
  project: <T extends string>(projectId: T): `/projects/${T}` =>
    `/projects/${projectId}` as `/projects/${T}`,
  projectDocuments: <T extends string>(
    projectId: T,
  ): `/projects/${T}/documents` =>
    `/projects/${projectId}/documents` as `/projects/${T}/documents`,
} as const

export type Routes = typeof ROUTES
