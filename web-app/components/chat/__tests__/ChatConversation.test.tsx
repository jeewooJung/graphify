import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatConversation } from '@/components/chat/ChatConversation'
import type {
  AssistantAnswer,
  ChatSession,
  Citation,
  ConversationMessage,
  SystemMessage,
  UserMessage,
} from '@/types/chat'

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
  writable: true,
})

const session: ChatSession = {
  id: 'session-1',
  title: 'Deployment chat',
  scope: { kind: 'WORKSPACE' },
  createdAt: '2026-04-13T10:00:00.000Z',
  updatedAt: '2026-04-13T10:05:00.000Z',
  lastMessageAt: '2026-04-13T10:05:00.000Z',
  createdBy: 'demo@graphify.com',
}

function createCitation(overrides: Partial<Citation> = {}): Citation {
  return {
    id: 'citation-1',
    documentId: 'document-1',
    chunkId: 'chunk-1',
    projectId: 'project-1',
    projectName: 'Acme Wiki',
    documentTitle: 'Deployment Guide',
    quoteText: 'Deploy with the standard release checklist.',
    relevanceScore: 0.92,
    ...overrides,
  }
}

function createUserMessage(overrides: Partial<UserMessage> = {}): UserMessage {
  return {
    id: 'user-1',
    sessionId: session.id,
    role: 'user',
    content: 'What is the deployment process?',
    createdAt: '2026-04-13T10:01:00.000Z',
    ...overrides,
  }
}

function createAssistantMessage(overrides: Partial<AssistantAnswer> = {}): AssistantAnswer {
  return {
    id: 'assistant-1',
    sessionId: session.id,
    role: 'assistant',
    content: 'Use the release checklist and validate the health checks before rollout.',
    modelName: 'graphify-assistant',
    confidence: 0.86,
    citations: [createCitation(), createCitation({ id: 'citation-2', chunkId: 'chunk-2', documentTitle: 'Release Checklist' })],
    suggestedFollowUps: [],
    createdAt: '2026-04-13T10:02:00.000Z',
    ...overrides,
  }
}

function createSystemMessage(overrides: Partial<SystemMessage> = {}): SystemMessage {
  return {
    id: 'system-1',
    sessionId: session.id,
    role: 'system',
    variant: 'insufficient_evidence',
    content: '\uCC38\uACE0\uD560 \uBB38\uC11C\uAC00 \uBD80\uC871\uD569\uB2C8\uB2E4. \uAD00\uB828 \uBB38\uC11C\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
    createdAt: '2026-04-13T10:03:00.000Z',
    ...overrides,
  }
}

function renderConversation(messages: ConversationMessage[], onUploadSuggested = jest.fn()) {
  render(
    <ChatConversation
      session={session}
      messages={messages}
      isStreaming={false}
      onUploadSuggested={onUploadSuggested}
      onSelectCitation={jest.fn()}
      onFollowUp={jest.fn()}
      onNavigate={jest.fn()}
    />
  )

  return { onUploadSuggested }
}

describe('ChatConversation', () => {
  it('renders user, assistant, and insufficient-evidence system messages', () => {
    renderConversation([
      createUserMessage(),
      createAssistantMessage(),
      createSystemMessage(),
    ])

    expect(screen.getByText('What is the deployment process?')).toBeInTheDocument()
    expect(screen.getByText('used 2 docs')).toBeInTheDocument()
    expect(
      screen.getByText(
        '\uCC38\uACE0\uD560 \uBB38\uC11C\uAC00 \uBD80\uC871\uD569\uB2C8\uB2E4. \uAD00\uB828 \uBB38\uC11C\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.'
      )
    ).toBeInTheDocument()
  })

  it('fires onUploadSuggested from the insufficient-evidence system message', async () => {
    const user = userEvent.setup()
    const { onUploadSuggested } = renderConversation([createSystemMessage()])

    await user.click(screen.getByRole('button', { name: '\uBB38\uC11C \uC5C5\uB85C\uB4DC' }))

    expect(onUploadSuggested).toHaveBeenCalledTimes(1)
  })

  it('fires onUploadSuggested from the zero-citation warning strip', async () => {
    const user = userEvent.setup()
    const { onUploadSuggested } = renderConversation([
      createAssistantMessage({ citations: [] }),
    ])

    expect(
      screen.getByText('\uADFC\uAC70\uAC00 \uB418\uB294 \uBB38\uC11C\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4')
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: '\uAD00\uB828 \uBB38\uC11C \uC5C5\uB85C\uB4DC' })
    )

    expect(onUploadSuggested).toHaveBeenCalledTimes(1)
  })
})
