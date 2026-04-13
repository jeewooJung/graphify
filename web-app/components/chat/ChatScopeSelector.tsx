'use client'

import clsx from 'clsx'
import type { ChatScope, ProjectOption, ScopeKind, TeamOption } from '@/types/chat'

type ChatScopeSelectorProps = {
  value: ChatScope
  projects: ProjectOption[]
  teams: TeamOption[]
  disabledKinds?: ScopeKind[]
  onChange: (next: ChatScope) => void
}

export function ChatScopeSelector({
  value,
  projects,
  teams,
  disabledKinds = [],
  onChange,
}: ChatScopeSelectorProps) {
  const disabled = new Set(disabledKinds)
  const currentTeamId = value.kind === 'TEAM' ? value.teamId : teams[0]?.id ?? ''
  const currentProjectId = value.kind === 'PROJECT' ? value.projectId : projects[0]?.id ?? ''

  const selectKind = (kind: ScopeKind) => {
    if (disabled.has(kind)) return
    if (kind === 'WORKSPACE') return onChange({ kind })
    if (kind === 'TEAM' && currentTeamId) return onChange({ kind, teamId: currentTeamId })
    if (kind === 'PROJECT' && currentProjectId) return onChange({ kind, projectId: currentProjectId })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {(['WORKSPACE', 'TEAM', 'PROJECT'] as ScopeKind[]).map((kind) => {
          const isDisabled = disabled.has(kind)
          const isActive = value.kind === kind
          return (
            <button
              key={kind}
              type="button"
              onClick={() => selectKind(kind)}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              title={isDisabled ? 'Not available with current permissions' : undefined}
              className={clsx(
                'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'border-primary-500 bg-primary-soft text-primary-700' : 'border-border bg-white text-text-secondary',
                isDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {kind === 'WORKSPACE' ? 'Workspace' : kind === 'TEAM' ? 'Team' : 'Project'}
            </button>
          )
        })}
      </div>

      {value.kind === 'TEAM' ? (
        <select
          className="input-field h-10"
          value={currentTeamId}
          onChange={(event) => onChange({ kind: 'TEAM', teamId: event.target.value })}
        >
          {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
      ) : null}

      {value.kind === 'PROJECT' ? (
        <select
          className="input-field h-10"
          value={currentProjectId}
          onChange={(event) => onChange({ kind: 'PROJECT', projectId: event.target.value })}
        >
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      ) : null}
    </div>
  )
}
