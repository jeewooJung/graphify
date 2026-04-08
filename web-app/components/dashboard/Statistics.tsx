import React from 'react'
import { Card, CardContent } from '@/components/ui'

interface Stat {
  label: string
  value: string | number
  trend?: 'up' | 'down'
  trendValue?: string
}

const stats: Stat[] = [
  {
    label: 'Total Graphs',
    value: 12,
    trend: 'up',
    trendValue: '+2 this month',
  },
  {
    label: 'Team Members',
    value: 8,
    trend: 'up',
    trendValue: '+1 this week',
  },
  {
    label: 'Total Nodes',
    value: 1240,
    trend: 'up',
    trendValue: '+89 this week',
  },
]

export function Statistics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
            <h3 className="text-3xl font-semibold text-text-primary mb-2">
              {stat.value}
            </h3>
            {stat.trend && (
              <p
                className={`text-xs font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? '↑' : '↓'} {stat.trendValue}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
