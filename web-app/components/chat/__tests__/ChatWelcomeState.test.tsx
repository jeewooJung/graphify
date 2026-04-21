import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWelcomeState } from '@/components/chat/ChatWelcomeState'
import { UserProvider } from '@/lib/auth/user-context'
import type { ChatScope, ProjectOption, SuggestedQuestion, TeamOption } from '@/types/chat'

const defaultScope: ChatScope = { kind: 'WORKSPACE' }

const projects: ProjectOption[] = [
  { id: 'project-1', name: 'Project One' },
]

const teams: TeamOption[] = [
  { id: 'team-1', name: 'Team One' },
]

const suggestions: SuggestedQuestion[] = [
  { id: 'suggestion-1', text: 'What changed this week?' },
  { id: 'suggestion-2', text: 'Show me related documents' },
]

function renderWelcomeState(overrides?: Partial<ComponentProps<typeof ChatWelcomeState>>) {
  const onSubmit = jest.fn()

  render(
    <UserProvider
      initialUser={{
        id: 'user-1',
        email: 'alex@example.com',
        name: 'Alex',
        role: 'admin',
      }}
    >
      <ChatWelcomeState
        defaultScope={defaultScope}
        projects={projects}
        teams={teams}
        suggestions={suggestions}
        isSubmitting={false}
        onSubmit={onSubmit}
        {...overrides}
      />
    </UserProvider>
  )

  return { onSubmit }
}

describe('ChatWelcomeState', () => {
  it('renders the selector, composer, and suggestions by default', () => {
    renderWelcomeState()

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Workspace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: suggestions[0].text })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: suggestions[1].text })).toBeInTheDocument()
  })

  it('disables team and project scope when disabledKinds excludes them', () => {
    renderWelcomeState({ disabledKinds: ['TEAM', 'PROJECT'] })

    expect(screen.getByRole('button', { name: 'Workspace' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Team' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Project' })).toBeDisabled()
  })

  it('submits workspace-scoped content on Enter', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderWelcomeState()

    await user.type(screen.getByRole('textbox'), 'hello{enter}')

    expect(onSubmit).toHaveBeenCalledWith({
      scope: { kind: 'WORKSPACE' },
      content: 'hello',
    })
  })
})
