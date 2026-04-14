'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatLayout, ChatSessionList, ChatWelcomeState } from '@/components/chat'
import { chatService } from '@/lib/api/chat-service'
import { ROUTES } from '@/lib/routes'
import type {
  ChatAnswerRequest,
  ChatSessionSummary,
  ProjectOption,
  SuggestedQuestion,
  TeamOption,
} from '@/types/chat'

const mockProjects: ProjectOption[] = [
  { id: 'proj-1', name: 'Acme Wiki' },
  { id: 'proj-2', name: 'Launch Notes' },
]

const mockTeams: TeamOption[] = [
  { id: 'team-platform', name: 'Platform Team' },
]

const mockSuggestions: SuggestedQuestion[] = [
  { id: 'suggestion-1', text: '이번 주 프로젝트 변경 사항을 요약해줘' },
  { id: 'suggestion-2', text: '최근 7일간 업데이트된 문서 중 중요한 내용만 정리해줘' },
  { id: 'suggestion-3', text: '배포 전에 꼭 확인해야 할 체크리스트를 알려줘' },
  { id: 'suggestion-4', text: '플랫폼 팀이 자주 참고하는 운영 가이드를 찾아줘' },
]

export default function ChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [sessionsError, setSessionsError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadSessions() {
      setIsLoadingSessions(true)
      setSessionsError(undefined)

      const res = await chatService.getSessions({ limit: 10 })
      if (!isActive) return

      if (res.error) {
        setSessions([])
        setSessionsError(res.error)
      } else {
        setSessions(res.data ?? [])
      }

      setIsLoadingSessions(false)
    }

    void loadSessions()

    return () => {
      isActive = false
    }
  }, [])

  const handleSelectSession = (id: string) => {
    router.push(ROUTES.chatSession(id))
  }

  const handleCreateSession = () => {}

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
          defaultScope={{ kind: 'WORKSPACE' }}
          projects={mockProjects}
          teams={mockTeams}
          disabledKinds={[]}
          suggestions={mockSuggestions}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </ChatLayout>
    </div>
  )
}
