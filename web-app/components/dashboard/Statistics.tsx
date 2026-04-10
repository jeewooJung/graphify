import React from 'react'
import { Activity, Network, ShieldCheck, Users } from 'lucide-react'

interface Stat {
  label: string
  value: string | number
  description: string
  trend?: 'up' | 'down'
  trendValue?: string
  icon: React.ReactNode
}

const stats: Stat[] = [
  {
    label: 'Active graphs',
    value: 12,
    description: 'Production workspaces currently in circulation.',
    trend: 'up',
    trendValue: '+2 this month',
    icon: <Network size={18} />,
  },
  {
    label: 'Reviewers online',
    value: 8,
    description: 'Editors and reviewers available for collaboration.',
    trend: 'up',
    trendValue: '+1 this week',
    icon: <Users size={18} />,
  },
  {
    label: 'Connected nodes',
    value: '1,240',
    description: 'Structured entities and relationships in the active graph set.',
    trend: 'up',
    trendValue: '+89 this week',
    icon: <Activity size={18} />,
  },
  {
    label: 'Schema health',
    value: '98.4%',
    description: 'Coverage of typed properties and validated references.',
    trend: 'up',
    trendValue: 'Stable this week',
    icon: <ShieldCheck size={18} />,
  },
]

export function Statistics() {
  return (
    <div className="app-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <div className="panel-heading">Workspace health</div>
          <p className="mt-1 text-[13px] leading-6 text-text-secondary">
            A tight read on graph volume, reviewers, and schema health.
          </p>
        </div>
        <span className="app-chip">Live</span>
      </div>

      <div
        className="grid gap-px md:grid-cols-2 2xl:grid-cols-4"
        style={{ backgroundColor: 'rgba(17, 24, 39, 0.06)' }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kpi-label">{stat.label}</p>
                <h3 className="mt-3 text-[28px] font-semibold tracking-[-0.06em] text-text-primary">
                  {stat.value}
                </h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                {stat.icon}
              </div>
            </div>

            <p className="mt-2 text-[13px] leading-6 text-text-secondary">
              {stat.description}
            </p>

            {stat.trend && (
              <p
                className={`mt-3 text-[12px] font-medium ${
                  stat.trend === 'up' ? 'text-success-500' : 'text-error-500'
                }`}
              >
                {stat.trend === 'up' ? '↑' : '↓'} {stat.trendValue}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
