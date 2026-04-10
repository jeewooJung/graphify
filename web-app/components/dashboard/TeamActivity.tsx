import React from 'react'
import { Edit2, MessageSquare, User, Users2 } from 'lucide-react'

interface Activity {
  id: string
  user: string
  action: string
  timestamp: string
  icon: 'edit' | 'comment' | 'user'
}

const mockActivity: Activity[] = [
  {
    id: '1',
    user: 'Sarah Chen',
    action: 'Updated "Product Architecture" graph',
    timestamp: '1 hour ago',
    icon: 'edit',
  },
  {
    id: '2',
    user: 'James Wilson',
    action: 'Added comment to "Company Knowledge Graph"',
    timestamp: '3 hours ago',
    icon: 'comment',
  },
  {
    id: '3',
    user: 'Emma Davis',
    action: 'Joined the workspace',
    timestamp: '1 day ago',
    icon: 'user',
  },
]

const iconMap = {
  edit: Edit2,
  comment: MessageSquare,
  user: User,
}

export function TeamActivity() {
  return (
    <div className="app-card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
        <div>
          <div className="panel-heading">Team activity</div>
          <p className="mt-1 text-[13px] leading-6 text-text-secondary">
            Collaboration signals from your reviewers and editors.
          </p>
        </div>
        <span className="app-chip">
          <Users2 size={12} />
          3 updates
        </span>
      </div>

      <div className="divide-y divide-border">
        {mockActivity.map((activity) => {
          const Icon = iconMap[activity.icon]
          return (
            <div
              key={activity.id}
              className="flex gap-3 px-4 py-4 transition-colors hover:bg-surface-hover"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-6 text-text-primary">
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  {activity.action}
                </p>
                <p className="mt-1 text-[11px] font-medium text-text-tertiary">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
