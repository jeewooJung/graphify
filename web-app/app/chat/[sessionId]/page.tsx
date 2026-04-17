'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatComposer, ChatConversation, ChatLayout, ChatSessionHeader, ChatSessionList, SourcePanel } from '@/components/chat'
import { Skeleton } from '@/components/feedback'
import { chatService } from '@/lib/api/chat-service'
import { useUser } from '@/lib/auth/user-context'
import { ROUTES } from '@/lib/routes'
import type { ChatSession, ChatSessionSummary, CitationPreview, CitationRef, ConversationMessage, NavigationTarget, UserMessage } from '@/types/chat'

export default function ChatSessionPage() {
  const router = useRouter()
  useUser()
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId
  const [session, setSession] = useState<ChatSession>()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [error, setError] = useState<string>()
  const [selectedCitation, setSelectedCitation] = useState<CitationRef>()
  const [composerValue, setComposerValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadChatSession() {
      setIsLoadingSession(true)
      setIsLoadingMessages(true)
      setError(undefined)
      setSelectedCitation(undefined)

      const [sessionRes, messagesRes, sessionsRes] = await Promise.all([
        chatService.getSession(sessionId),
        chatService.getMessages(sessionId),
        chatService.getSessions({ limit: 20 }),
      ])

      if (!isActive) return

      if (sessionRes.status === 404) {
        console.warn(`Chat session not found: ${sessionId}`)
        window.setTimeout(() => router.push(ROUTES.chat), 300)
        setSession(undefined)
        setMessages([])
        setSessions(sessionsRes.data ?? [])
        setIsLoadingSession(false)
        setIsLoadingMessages(false)
        return
      }

      if (sessionRes.error || !sessionRes.data) {
        setError(sessionRes.error ?? '채팅 세션을 불러오지 못했습니다.')
        setSession(undefined)
      } else {
        setSession(sessionRes.data)
      }

      if (messagesRes.error) {
        setError(messagesRes.error)
        setMessages([])
      } else {
        setMessages(messagesRes.data ?? [])
      }

      setSessions(sessionsRes.data ?? [])
      setIsLoadingSession(false)
      setIsLoadingMessages(false)
    }

    void loadChatSession()

    return () => {
      isActive = false
    }
  }, [router, sessionId])

  const handleComposerSubmit = async () => {
    const content = composerValue.trim()
    if (!content) return

    const optimisticUser: UserMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticUser])
    setIsSubmitting(true)
    setComposerValue('')

    try {
      const res = await chatService.postMessage(sessionId, { content })
      const messagePair = res.data

      if (messagePair) {
        setMessages((prev) => [
          ...prev.filter((message) => message.id !== optimisticUser.id),
          messagePair.user,
          messagePair.answer,
        ])
        return
      }

      setMessages((prev) => prev.filter((message) => message.id !== optimisticUser.id))
      alert(res.error ?? '메시지를 전송하지 못했습니다.')
    } catch (submitError) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticUser.id))
      alert(submitError instanceof Error ? submitError.message : '메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectCitation = (ref: CitationRef) => setSelectedCitation(ref)
  const handleFollowUp = (text: string) => setComposerValue(text)
  const handleUploadSuggested = () => {
    const scope = session?.scope

    if (scope?.kind === 'PROJECT') {
      router.push(ROUTES.projectDocuments(scope.projectId))
      return
    }

    router.push('/projects')
  }

  const handleNavigate = (target: NavigationTarget) => {
    if (target.kind === 'document') {
      const { projectId, documentId, chunkId } = target.payload
      const chunkQuery = chunkId ? `&chunkId=${chunkId}` : ''
      router.push(`${ROUTES.projectDocuments(projectId)}?documentId=${documentId}${chunkQuery}`)
      return
    }

    if (target.kind === 'search') {
      router.push(`/search?q=${encodeURIComponent(target.payload.query)}`)
      return
    }

    console.log('Graph navigation not wired yet:', target.payload)
  }

  const handleRenameSession = (title: string) => {
    setSession((current) => (current ? { ...current, title } : current))
    setSessions((current) => current.map((item) => (item.id === sessionId ? { ...item, title } : item)))
    console.warn('Session rename API not wired yet')
  }

  const sourcePanelPreviews = useMemo<CitationPreview[]>(() => {
    const selectedMessage = messages
      .filter((message): message is Extract<ConversationMessage, { role: 'assistant' }> => message.role === 'assistant')
      .find((message) => message.id === selectedCitation?.messageId)
    return selectedMessage?.citations.map((citation) => ({ ...citation, surroundingText: citation.quoteText })) ?? []
  }, [messages, selectedCitation])

  return (
    <div className="page-shell">
      <ChatLayout
        sessionId={sessionId}
        scope={session?.scope}
        leftSlot={(
          <ChatSessionList
            sessions={sessions}
            activeSessionId={sessionId}
            isLoading={false}
            onCreateSession={() => router.push(ROUTES.chat)}
            onSelect={(id) => router.push(ROUTES.chatSession(id))}
          />
        )}
        rightSlot={selectedCitation ? (
          <SourcePanel selection={selectedCitation} previews={sourcePanelPreviews} isLoading={false} onClose={() => setSelectedCitation(undefined)} onOpenDocument={(nav) => handleNavigate({ kind: 'document', payload: nav })} />
        ) : undefined}
      >
        {isLoadingSession || isLoadingMessages ? (
          <div className="flex min-h-[320px] flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
            <Skeleton className="ml-auto" width="75%" height={64} rounded="lg" />
            <Skeleton width="100%" height={128} rounded="lg" />
            <Skeleton className="ml-auto" width="75%" height={64} rounded="lg" />
            <Skeleton width="100%" height={128} rounded="lg" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-error-500/20 bg-error-50 p-6 text-sm text-error-500">
            <p>{error}</p>
            <button
              type="button"
              className="mt-4 rounded-full border border-error-500/20 px-4 py-2 text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : !session ? null : (
          <div className="flex min-h-[70vh] flex-col gap-4">
            <ChatSessionHeader session={session} onRename={handleRenameSession} />
            <ChatConversation session={session} messages={messages} isStreaming={isSubmitting} onUploadSuggested={handleUploadSuggested} onSelectCitation={handleSelectCitation} onFollowUp={handleFollowUp} onNavigate={handleNavigate} />
            <ChatComposer value={composerValue} onChange={setComposerValue} onSubmit={handleComposerSubmit} isSubmitting={isSubmitting} />
          </div>
        )}
      </ChatLayout>
    </div>
  )
}
