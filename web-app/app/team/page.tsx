'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, ConfirmDialog, PageHeader } from '@/components/ui'
import { TeamList } from '@/components/team/TeamList'
import { TeamMemberModal } from '@/components/team/TeamMemberModal'
import { teamService, type TeamMember } from '@/lib/api/team-service'
import { Plus } from 'lucide-react'

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [memberModal, setMemberModal] = useState<
    { mode: 'create' } | { mode: 'edit'; member: TeamMember } | null
  >(null)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const teamIdPromiseRef = useRef<Promise<string> | null>(null)

  const loadMembers = useCallback(async () => {
    const response = await teamService.getMembers()

    if (response.error) {
      setMembers([])
      setError(response.error)
    } else {
      setMembers(response.data || [])
      setError('')
    }

    setLoading(false)
  }, [])

  const reloadMembers = useCallback(async () => {
    setLoading(true)
    await loadMembers()
  }, [loadMembers])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMembers()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadMembers])

  const resolveCurrentTeamId = useCallback(async () => {
    if (!teamIdPromiseRef.current) {
      teamIdPromiseRef.current = (async () => {
        const response = await teamService.resolveCurrentTeamId()

        if (response.error || !response.data) {
          throw new Error(response.error || 'Failed to resolve current team')
        }

        return response.data
      })()
    }

    try {
      return await teamIdPromiseRef.current
    } catch (resolveError) {
      teamIdPromiseRef.current = null
      throw resolveError
    }
  }, [])

  const openEditModal = (memberId: string) => {
    const member = members.find((item) => item.id === memberId)
    if (!member) return

    setMemberModal({ mode: 'edit', member })
  }

  const openRemoveDialog = (memberId: string) => {
    const member = members.find((item) => item.id === memberId)
    if (!member) return

    setMemberToRemove(member)
  }

  const handleMemberSubmit = async (values: { email: string; role: TeamMember['role'] }) => {
    let teamId = ''

    try {
      teamId = await resolveCurrentTeamId()
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : 'Failed to resolve current team')
      return
    }

    const response = memberModal?.mode === 'edit'
      ? memberModal.member.membershipId
        ? await teamService.updateMember(teamId, memberModal.member.membershipId, values.role)
        : {
            status: 0,
            error: 'Cannot update this member because membership data is missing',
          }
      : await teamService.addMember(teamId, values.email, values.role)

    if (response.error) {
      setError(response.error)
      return
    }

    setError('')
    await reloadMembers()
    setMemberModal(null)
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    let teamId = ''

    try {
      teamId = await resolveCurrentTeamId()
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : 'Failed to resolve current team')
      return
    }

    const response = await teamService.removeMember(teamId, memberToRemove.id)
    if (response.error) {
      setError(response.error)
      return
    }

    setError('')
    await reloadMembers()
    setMemberToRemove(null)
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Collaboration"
        title="Team"
        description="Give editors, viewers, and reviewers a clear home. The layout keeps role signals prominent without turning the table into admin clutter."
        meta={
          <>
            <span className="app-chip">{members.length} members</span>
            <span className="app-chip">Role-aware access</span>
          </>
        }
        actions={(
          <Button variant="primary" onClick={() => setMemberModal({ mode: 'create' })}>
            <Plus size={16} />
            Add member
          </Button>
        )}
      />

      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <div>
          <TeamList
            members={members}
            loading={loading}
            onEditMember={openEditModal}
            onRemoveMember={openRemoveDialog}
          />
        </div>
      </div>

      <TeamMemberModal
        open={memberModal !== null}
        member={memberModal?.mode === 'edit' ? memberModal.member : undefined}
        onCancel={() => setMemberModal(null)}
        onSubmit={handleMemberSubmit}
      />

      <ConfirmDialog
        open={memberToRemove !== null}
        title="Remove team member"
        message={memberToRemove
          ? `Remove ${memberToRemove.email} from the current team?`
          : ''}
        confirmLabel="Remove member"
        destructive
        onConfirm={handleRemoveMember}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  )
}
