'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Trash2, Edit } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  joinedDate: string
  status: 'active' | 'inactive'
}

interface TeamListProps {
  members: TeamMember[]
  loading?: boolean
  onAddMember?: () => void
  onEditMember?: (memberId: string) => void
  onRemoveMember?: (memberId: string) => void
}

const roleColors: Record<string, string> = {
  admin: '#3366cc',
  editor: '#10b981',
  viewer: '#f59e0b',
}

export function TeamList({
  members = [],
  loading = false,
  onAddMember,
  onEditMember,
  onRemoveMember,
}: TeamListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading team members...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>No team members yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Name</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Email</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Role</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Joined</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-center px-4 py-3 font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
              <td style={{ color: 'var(--color-text-primary)' }} className="px-4 py-3 text-sm">{member.name}</td>
              <td style={{ color: 'var(--color-text-secondary)' }} className="px-4 py-3 text-sm">{member.email}</td>
              <td className="px-4 py-3 text-sm">
                <Badge variant="primary" style={{ backgroundColor: roleColors[member.role] }}>
                  {member.role}
                </Badge>
              </td>
              <td style={{ color: 'var(--color-text-tertiary)' }} className="px-4 py-3 text-sm">{member.joinedDate}</td>
              <td className="px-4 py-3 text-sm text-center flex gap-2 justify-center">
                <button
                  onClick={() => onEditMember?.(member.id)}
                  className="p-1 hover:bg-surface rounded transition-colors"
                >
                  <Edit size={16} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
                <button
                  onClick={() => onRemoveMember?.(member.id)}
                  className="p-1 hover:bg-surface rounded transition-colors"
                >
                  <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
