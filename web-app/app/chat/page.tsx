'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatLayout, ChatSessionList, ChatWelcomeState } from '@/components/chat'
import { chatService } from '@/lib/api/chat-service'
import { projectService } from '@/lib/api/project-service'
import { teamService } from '@/lib/api/team-service'
import { useUser } from '@/lib/auth/user-context'
import { ROUTES } from '@/lib/routes'
import type {
  ChatAnswerRequest,
  ChatSessionSummary,
  ProjectOption,
  ScopeKind,
  SuggestedQuestion,
  TeamOption,
} from '@/types/chat'

const mockSuggestions: SuggestedQuestion[] = [
  { id: 'suggestion-1', text: '이번 주 프로젝트 변경 사항을 요약해줘' },
  { id: 'suggestion-2', text: '최근 7일간 업데이트된 문서 중 중요한 내용만 정리해줘' },
  { id: 'suggestion-3', text: '배포 전에 꼭 확인해야 할 체크리스트를 알려줘' },
  { id: 'suggestion-4', text: '플랫폼 팀이 자주 참고하는 운영 가이드를 찾아줘' },
]

export default function ChatPage() {
  const router = useRouter()
  const { user } = useUser()
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [sessionsError, setSessionsError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [composerKey, setComposerKey] = useState(0)
  const disabledKinds: ScopeKind[] = user?.role === 'viewer' ? ['TEAM', 'PROJECT'] : []

  useEffect(() => {
    let isActive = true

    async function loadAll() {
      setIsLoadingSessions(true)
      setSessionsError(undefined)

      const [sessionsRes, projectsRes, teamRes] = await Promise.all([
        chatService.getSessions({ limit: 10 }),
        projectService.getProjects(),
        teamService.getTeam(),
      ])
      if (!isActive) return

      if (sessionsRes.error) {
        setSessions([])
        setSessionsError(sessionsRes.error)
      } else {
        setSessions(sessionsRes.data ?? [])
      }

      setProjects(
        (projectsRes.data ?? []).map((p) => ({ id: p.id, name: p.name }))
      )

      if (teamRes.data) {
        setTeams([{ id: String(teamRes.data.id), name: teamRes.data.name }])
      }

      setIsLoadingSessions(false)
    }

    void loadAll()

    return () => {
      isActive = false
    }
  }, [])

  const handleSelectSession = (id: string) => {
    router.push(ROUTES.chatSession(id))
  }

  const handleCreateSession = () => {
    setComposerKey((k) => k + 1)
  }

  const handleSubmit = async (input: ChatAnswerRequest) => {
    setIsSubmitting(true)

    try {
      const title = input.content.slice(0, 60)
      const sessionRes = await chatService.createSession({
        scope: input.scope,
        title,
      })

      if (!sessionRes.data) {
        alert(sessionRes.error ?? '채팅 세션을 생성하지 못했습니다.')
        return
      }

      const messageRes = await chatService.postMessage(sessionRes.data.id, {
        content: input.content,
      })

      if (!messageRes.data) {
        alert(messageRes.error ?? '첫 메시지를 전송하지 못했습니다.')
        return
      }

      router.push(ROUTES.chatSession(sessionRes.data.id))
    } catch (error) {
      alert(error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-shell">
      <ChatLayout
        scope={{ kind: 'WORKSPACE' }}
        leftSlot={(
          <ChatSessionList
            sessions={sessions}
            activeSessionId={undefined}
            isLoading={isLoadingSessions}
            error={sessionsError ? new Error(sessionsError) : undefined}
            onCreateSession={handleCreateSession}
            onSelect={handleSelectSession}
          />
        )}
      >
        <ChatWelcomeState
          key={composerKey}
          defaultScope={{ kind: 'WORKSPACE' }}
          projects={projects}
          teams={teams}
          disabledKinds={disabledKinds}
          suggestions={mockSuggestions}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </ChatLayout>
    </div>
  )
}
