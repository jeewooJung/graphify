'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
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
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
              Team Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Manage team members and their roles
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            Add Member
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {error && (
          <div style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca', color: 'var(--color-error)' }} className="p-4 rounded mb-6 border">
            {error}
          </div>
        )}

        <div className="bg-white border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
          <TeamList
            members={members}
            loading={loading}
            onAddMember={() => console.log('Add member')}
            onEditMember={(id) => console.log('Edit member', id)}
            onRemoveMember={(id) => console.log('Remove member', id)}
          />
        </div>
      </div>
    </div>
  )
}
