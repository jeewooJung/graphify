'use client'

import React, { useEffect, useState } from 'react'
import { Button, PageHeader } from '@/components/ui'
import { TeamList } from '@/components/team/TeamList'
import { teamService } from '@/lib/api/team-service'
import { Plus } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  joinedDate: string
  status: 'active' | 'inactive'
}

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@graphify.com',
    role: 'admin',
    joinedDate: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@graphify.com',
    role: 'editor',
    joinedDate: '2024-02-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@graphify.com',
    role: 'viewer',
    joinedDate: '2024-03-10',
    status: 'active',
  },
]

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      const response = await teamService.getMembers()

      if (response.error) {
        // Fallback to mock data
        setMembers(MOCK_MEMBERS)
        setError('')
      } else {
        setMembers(response.data || MOCK_MEMBERS)
      }
      setLoading(false)
    }

    fetchMembers()
  }, [])

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
          <Button variant="primary">
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
            onEditMember={(id) => console.log('Edit member', id)}
            onRemoveMember={(id) => console.log('Remove member', id)}
          />
        </div>
      </div>
    </div>
  )
}
