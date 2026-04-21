'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import type { TeamMember } from '@/lib/api/team-service'
import { Trash2, Edit } from 'lucide-react'

interface TeamListProps {
  members: TeamMember[]
  loading?: boolean
  onEditMember?: (memberId: string) => void
  onRemoveMember?: (memberId: string) => void
}

const roleColors: Record<string, string> = {
  admin: 'primary',
  editor: 'success',
  viewer: 'warning',
}

export function TeamList({
  members = [],
  loading = false,
  onEditMember,
  onRemoveMember,
}: TeamListProps) {
  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading team members...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="empty-state">
        <p>No team members yet</p>
      </div>
    )
  }

  return (
    <div className="app-table-shell overflow-x-auto">
      <table className="app-table">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Email</th>
            <th className="text-left">Role</th>
            <th className="text-left">Joined</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id}>
              <td>
                <div className="font-semibold text-text-primary">{member.name}</div>
                <div className="mt-1 text-xs text-text-tertiary">{member.status}</div>
              </td>
              <td>{member.email}</td>
              <td>
                <Badge variant={roleColors[member.role] as 'primary' | 'success' | 'warning'}>
                  {member.role}
                </Badge>
              </td>
              <td>{member.joinedDate}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEditMember?.(member.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/82 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveMember?.(member.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/82 text-error-500 transition-colors hover:bg-error-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
