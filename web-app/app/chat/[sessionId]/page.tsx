'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatComposer, ChatConversation, ChatLayout, ChatSessionHeader, ChatSessionList, SourcePanel } from '@/components/chat'
import { ROUTES } from '@/lib/routes'
import type { ChatSession, ChatSessionSummary, CitationNavigation, CitationPreview, CitationRef, ConversationMessage, NavigationTarget, SuggestedQuestion } from '@/types/chat'

const PROJECT_ID = 'proj-1'
const PROJECT_NAME = 'Acme Wiki'
type AssistantMessage = Extract<ConversationMessage, { role: 'assistant' }>

const followUp = (id: string, text: string): SuggestedQuestion => ({ id, text })
const userMessage = (sessionId: string, id: string, content: string, createdAt: string): ConversationMessage => ({ id, sessionId, role: 'user', content, createdAt })
const systemMessage = (sessionId: string, id: string, content: string, createdAt: string): ConversationMessage => ({ id, sessionId, role: 'system', variant: 'info', content, createdAt })
const assistantMessage = (sessionId: string, id: string, content: string, createdAt: string, confidence: number, citations: AssistantMessage['citations'], suggestedFollowUps: SuggestedQuestion[]): ConversationMessage => ({ id, sessionId, role: 'assistant', content, modelName: 'gpt-4.1-mini', confidence, citations, suggestedFollowUps, createdAt })
const citation = (id: string, documentId: string, chunkId: string, documentTitle: string, quoteText: string, relevanceScore: number): AssistantMessage['citations'][number] => ({ id, documentId, chunkId, documentTitle, quoteText, relevanceScore, projectId: PROJECT_ID, projectName: PROJECT_NAME })

function buildMockState(sessionId: string) {
  const title = sessionId.startsWith('new-') ? '새 대화' : `세션 ${sessionId}`
  const session: ChatSession = { id: sessionId, title, scope: { kind: 'PROJECT', projectId: PROJECT_ID }, lastMessageAt: '2025-02-18T10:06:00.000Z', createdBy: 'mina.park', createdAt: '2025-02-18T09:48:00.000Z', updatedAt: '2025-02-18T10:06:00.000Z' }
  const sessionsList: ChatSessionSummary[] = [
    { id: sessionId, title, scope: session.scope, lastMessageAt: session.lastMessageAt, createdBy: session.createdBy },
    { id: 'session-workspace', title: '주간 운영 현황 정리', scope: { kind: 'WORKSPACE' }, lastMessageAt: '2025-02-18T09:15:00.000Z', createdBy: 'mina.park' },
    { id: 'session-team', title: '플랫폼 팀 인수인계 요약', scope: { kind: 'TEAM', teamId: 'team-platform' }, lastMessageAt: '2025-02-16T22:05:00.000Z', createdBy: 'jiwon.kim' },
  ]
  const messages: ConversationMessage[] = [
    systemMessage(sessionId, 'msg-system-1', '이 대화는 프로젝트 문서와 운영 노트를 기반으로 답변합니다.', '2025-02-18T09:48:30.000Z'),
    userMessage(sessionId, 'msg-user-1', 'Acme Wiki 프로젝트의 최근 배포 절차를 정리해줘.', '2025-02-18T09:49:10.000Z'),
    assistantMessage(
      sessionId,
      'msg-assistant-1',
      '최근 배포 절차는 세 단계로 정리됩니다.\n\n첫째, main 브랜치 머지 후 CI 파이프라인 상태와 마이그레이션 여부를 확인합니다. 둘째, staging에서 smoke test와 검색 인덱스 동기화 여부를 검증합니다. 셋째, production 배포 직후 헬스체크와 알림 채널 공지를 진행합니다.',
      '2025-02-18T09:49:42.000Z',
      0.88,
      [
        citation('citation-1', 'doc-deploy-runbook', 'chunk-12', 'Deployment Runbook', 'After merging to main, verify CI, database migrations, and release notes before starting staging deploy.', 0.96),
        citation('citation-2', 'doc-release-checklist', 'chunk-4', 'Release Checklist', 'Post-deploy validation includes smoke tests, index sync confirmation, and Slack announcement in #release-ops.', 0.91),
      ],
      [followUp('follow-up-1', '스테이징 검증 항목만 체크리스트로 다시 정리해줘'), followUp('follow-up-2', '배포 실패 시 롤백 절차도 알려줘')],
    ),
    userMessage(sessionId, 'msg-user-2', '담당자와 공지 채널도 같이 알려줘.', '2025-02-18T09:51:05.000Z'),
    assistantMessage(
      sessionId,
      'msg-assistant-2',
      '현재 문서 기준으로 배포 담당자는 플랫폼 온콜 엔지니어이며, 공지 채널은 #release-ops 입니다. 릴리스 후 15분 내 헬스체크 결과를 같은 채널에 공유하도록 되어 있습니다.',
      '2025-02-18T09:51:36.000Z',
      0.79,
      [citation('citation-3', 'doc-oncall-playbook', 'chunk-8', 'On-call Playbook', 'The platform on-call engineer owns the release window and confirms production health after rollout.', 0.89)],
      [followUp('follow-up-3', '이 절차를 신규 입사자용으로 쉽게 다시 써줘'), followUp('follow-up-4', '관련 문서를 표로 비교해줘')],
    ),
  ]

  return { session, sessionsList, messages }
}

export default function ChatSessionPage() {
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()
  const initial = buildMockState(sessionId)
  const [session, setSession] = useState<ChatSession>(initial.session)
  const [sessionsList, setSessionsList] = useState<ChatSessionSummary[]>(initial.sessionsList)
  const [messages, setMessages] = useState<ConversationMessage[]>(initial.messages)
  const [selectedCitation, setSelectedCitation] = useState<CitationRef>()
  const [composerValue, setComposerValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const next = buildMockState(sessionId)
    setSession(next.session)
    setSessionsList(next.sessionsList)
    setMessages(next.messages)
    setSelectedCitation(undefined)
    setComposerValue('')
    setIsSubmitting(false)
  }, [sessionId])

  const openDocument = (nav: CitationNavigation) => {
    const query = new URLSearchParams({ documentId: nav.documentId })
    if (nav.chunkId) query.set('chunkId', nav.chunkId)
    router.push(`${ROUTES.projectDocuments(nav.projectId)}?${query.toString()}`)
  }

  const handleNavigate = (target: NavigationTarget) => {
    if (target.kind === 'document') return openDocument(target.payload)
    console.log('Placeholder navigation target', target)
  }

  const handleSubmit = () => {
    const content = composerValue.trim()
    if (!content || isSubmitting) return

    setMessages((current) => [...current, userMessage(sessionId, `msg-user-${Date.now()}`, content, new Date().toISOString())])
    setComposerValue('')
    setIsSubmitting(true)

    window.setTimeout(() => {
      const stamp = Date.now()
      setMessages((current) => [
        ...current,
        assistantMessage(
          sessionId,
          `msg-assistant-${stamp}`,
          `요청하신 내용을 바탕으로 "${content}"에 대한 임시 응답입니다. API가 연결되면 실제 검색 결과와 인용을 붙여서 보여줄 예정입니다.`,
          new Date().toISOString(),
          0.64,
          [citation(`citation-${stamp}`, 'doc-deploy-runbook', 'chunk-12', 'Deployment Runbook', 'Verify CI and post-deploy checks before announcing the release.', 0.74)],
          [followUp(`follow-up-${stamp}-1`, '핵심 단계만 3줄로 요약해줘'), followUp(`follow-up-${stamp}-2`, '문서 근거를 더 자세히 보여줘')],
        ),
      ])
      setIsSubmitting(false)
    }, 400)
  }

  const previews: CitationPreview[] = !selectedCitation ? [] : (messages
    .filter((message): message is AssistantMessage => message.role === 'assistant')
    .find((message) => message.id === selectedCitation.messageId)
    ?.citations.map((item) => ({ ...item, surroundingText: item.quoteText })) ?? [])

  return (
    <div className="page-shell">
      <ChatLayout
        sessionId={sessionId}
        scope={session.scope}
        leftSlot={<ChatSessionList sessions={sessionsList} activeSessionId={sessionId} isLoading={false} onCreateSession={() => console.log('Chat session creation is not wired yet')} onSelect={(id) => router.push(ROUTES.chatSession(id))} />}
        rightSlot={<SourcePanel selection={selectedCitation} previews={previews} isLoading={false} onClose={() => setSelectedCitation(undefined)} onOpenDocument={openDocument} />}
      >
        <div className="flex min-h-[70vh] flex-col gap-4">
          <ChatSessionHeader
            session={session}
            readOnly={false}
            onRename={(title) => {
              setSession((current) => ({ ...current, title, updatedAt: new Date().toISOString() }))
              setSessionsList((current) => current.map((item) => (item.id === sessionId ? { ...item, title } : item)))
            }}
          />
          <ChatConversation session={session} messages={messages} isStreaming={isSubmitting} onSelectCitation={setSelectedCitation} onFollowUp={setComposerValue} onNavigate={handleNavigate} />
          <ChatComposer value={composerValue} isSubmitting={isSubmitting} onChange={setComposerValue} onSubmit={handleSubmit} />
        </div>
      </ChatLayout>
    </div>
  )
}
