import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { MoreHorizontal, Star } from 'lucide-react'

interface Graph {
  id: string
  name: string
  description: string
  updatedAt: string
  itemCount: number
}

const mockGraphs: Graph[] = [
  {
    id: '1',
    name: 'Company Knowledge Graph',
    description: 'Main knowledge base for company',
    updatedAt: '2 hours ago',
    itemCount: 245,
  },
  {
    id: '2',
    name: 'Product Architecture',
    description: 'System design and components',
    updatedAt: '1 day ago',
    itemCount: 89,
  },
  {
    id: '3',
    name: 'Team Skills Matrix',
    description: 'Team expertise and capabilities',
    updatedAt: '3 days ago',
    itemCount: 42,
  },
]

export function RecentGraphs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Graphs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockGraphs.map((graph) => (
            <div
              key={graph.id}
              className="flex items-center justify-between p-3 rounded-md hover:bg-surface-hover transition-colors cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-text-primary truncate">
                    {graph.name}
                  </h4>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={14} className="text-text-tertiary" />
                  </button>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {graph.description} • {graph.itemCount} items
                </p>
              </div>
              <span className="text-xs text-text-tertiary ml-4 whitespace-nowrap">
                {graph.updatedAt}
              </span>
              <button className="ml-2 p-1 rounded hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} className="text-text-tertiary" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
