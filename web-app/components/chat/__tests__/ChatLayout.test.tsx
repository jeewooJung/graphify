import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatLayout } from '@/components/chat/ChatLayout'

function mockMatchMedia(isDesktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)' ? isDesktop : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('ChatLayout', () => {
  it('renders left, center, and right slots on desktop', () => {
    mockMatchMedia(true)

    render(
      <ChatLayout
        leftSlot={<div>left sentinel</div>}
        rightSlot={<div>right sentinel</div>}
      >
        <div>center sentinel</div>
      </ChatLayout>
    )

    expect(screen.getByText('left sentinel')).toBeInTheDocument()
    expect(screen.getByText('center sentinel')).toBeInTheDocument()
    expect(screen.getByText('right sentinel')).toBeInTheDocument()
  })

  it('hides the source panel by default on mobile until opened', async () => {
    mockMatchMedia(false)
    const user = userEvent.setup()

    render(
      <ChatLayout
        leftSlot={<div>left sentinel</div>}
        rightSlot={<div>right sentinel</div>}
      >
        <div>center sentinel</div>
      </ChatLayout>
    )

    expect(screen.queryByText('right sentinel')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open source panel/i }))

    expect(screen.getByText('right sentinel')).toBeInTheDocument()
  })
})
