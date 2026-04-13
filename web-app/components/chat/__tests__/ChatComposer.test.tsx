import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatComposer } from '@/components/chat/ChatComposer'

function ComposerHarness({
  onSubmit,
  initialValue = '',
}: {
  onSubmit: () => void
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue)

  return (
    <ChatComposer
      value={value}
      isSubmitting={false}
      onChange={setValue}
      onSubmit={onSubmit}
    />
  )
}

describe('ChatComposer', () => {
  it('submits on Enter', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<ComposerHarness onSubmit={onSubmit} initialValue="hello" />)

    await user.type(screen.getByRole('textbox'), '{enter}')

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<ComposerHarness onSubmit={onSubmit} initialValue="hello" />)

    await user.type(screen.getByRole('textbox'), '{shift>}{enter}{/shift}')

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('disables submit when the value is empty', () => {
    render(<ComposerHarness onSubmit={jest.fn()} />)

    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
  })
})
