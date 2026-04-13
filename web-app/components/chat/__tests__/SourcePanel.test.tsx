import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CitationPreview } from '@/types/chat'
import { SourcePanel } from '@/components/chat/SourcePanel'

const previews: CitationPreview[] = [
  {
    id: 'c1',
    documentId: 'doc-1',
    chunkId: 'chunk-1',
    projectId: 'project-1',
    projectName: 'Project One',
    documentTitle: 'Document One',
    quoteText: 'First quote',
    relevanceScore: 0.9,
  },
  {
    id: 'c2',
    documentId: 'doc-2',
    chunkId: 'chunk-2',
    projectId: 'project-2',
    projectName: 'Project Two',
    documentTitle: 'Document Two',
    quoteText: 'Second quote',
    relevanceScore: 0.8,
  },
]

describe('SourcePanel', () => {
  it('opens the clicked document preview', async () => {
    const user = userEvent.setup()
    const onOpenDocument = jest.fn()

    render(
      <SourcePanel
        previews={previews}
        isLoading={false}
        onClose={jest.fn()}
        onOpenDocument={onOpenDocument}
      />
    )

    const secondCard = screen.getByText('Document Two').closest('article')
    expect(secondCard).not.toBeNull()

    await user.click(within(secondCard as HTMLElement).getByRole('button', { name: '문서 열기' }))

    expect(onOpenDocument).toHaveBeenCalledWith({
      projectId: 'project-2',
      documentId: 'doc-2',
      chunkId: 'chunk-2',
    })
  })
})
