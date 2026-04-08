import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { User, MessageSquare, Edit2 } from 'lucide-react'

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
    <Card>
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActivity.map((activity) => {
            const Icon = iconMap[activity.icon]
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon size={14} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
