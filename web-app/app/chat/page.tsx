'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChatLayout,
  ChatSessionList,
  ChatWelcomeState,
} from '@/components/chat'
import { ROUTES } from '@/lib/routes'
import type {
  ChatAnswerRequest,
  ChatSessionSummary,
  ProjectOption,
  SuggestedQuestion,
  TeamOption,
} from '@/types/chat'

const mockSessions: ChatSessionSummary[] = [
  {
    id: 'session-workspace',
    title: '주간 운영 현황 정리',
    scope: { kind: 'WORKSPACE' },
    lastMessageAt: '2025-02-18T09:15:00.000Z',
    createdBy: 'mina.park',
  },
  {
    id: 'session-project',
    title: 'Acme Wiki 배포 체크',
    scope: { kind: 'PROJECT', projectId: 'proj-1' },
    lastMessageAt: '2025-02-17T15:40:00.000Z',
    createdBy: 'daniel.choi',
  },
  {
    id: 'session-team',
    title: '플랫폼 팀 인수인계 요약',
    scope: { kind: 'TEAM', teamId: 'team-platform' },
    lastMessageAt: '2025-02-16T22:05:00.000Z',
    createdBy: 'jiwon.kim',
  },
]

const mockProjects: ProjectOption[] = [
  { id: 'proj-1', name: 'Acme Wiki' },
  { id: 'proj-2', name: 'Launch Notes' },
]

const mockTeams: TeamOption[] = [
  { id: 'team-platform', name: 'Platform Team' },
]

const mockSuggestions: SuggestedQuestion[] = [
  { id: 'suggestion-1', text: '이 프로젝트의 배포 절차를 요약해줘' },
  { id: 'suggestion-2', text: '최근 7일간 변경된 문서를 기준으로 위험 요소를 알려줘' },
  { id: 'suggestion-3', text: '온보딩에 필요한 핵심 문서를 우선순위로 정리해줘' },
  { id: 'suggestion-4', text: '플랫폼 팀이 자주 참고하는 운영 가이드를 찾아줘' },
]

export default function ChatPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectSession = (id: string) => {
    router.push(ROUTES.chatSession(id))
  }

  const handleCreateSession = () => {
    console.log('Chat session creation is not wired yet')
  }

  const handleSubmit = (input: ChatAnswerRequest) => {
    setIsSubmitting(true)
    window.setTimeout(() => {
      setIsSubmitting(false)
      router.push(ROUTES.chatSession(`new-${Date.now()}`))
    }, 300)
    console.log('Submitting mock chat request', input)
  }

  return (
    <div className="page-shell">
      <ChatLayout
        scope={{ kind: 'WORKSPACE' }}
        leftSlot={(
          <ChatSessionList
            sessions={mockSessions}
            activeSessionId={undefined}
            isLoading={false}
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
