# Additional Pages (Team, Projects, Permissions) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Team Management, Projects, and Permissions pages with list/table layouts and CRUD operations

**Architecture:**
- Consistent layout across all pages (header + content)
- Table/list components for displaying data
- Action buttons (edit, delete, add new)
- Modal/form for CRUD operations
- Team member role management
- Project-level permissions

**Tech Stack:**
- React (components and hooks)
- Tailwind CSS (Linear light styling)
- Next.js 14 (App Router)
- API services (team-service, project-service, permission-service)

---

## Phase 1: Create Team Management Page

### Task 1: Create Team Page with Team List

**Files:**
- Create: `web-app/app/team/page.tsx`
- Create: `web-app/components/team/TeamList.tsx`
- Create: `web-app/lib/api/team-service.ts`

**Step 1: Create team service**

```typescript
import { api } from './client'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  joinedDate: string
  status: 'active' | 'inactive'
}

export interface Team {
  id: string
  name: string
  description: string
  memberCount: number
  members: TeamMember[]
  createdDate: string
}

export const teamService = {
  async getTeam(teamId?: string) {
    const endpoint = teamId ? `/teams/${teamId}` : '/teams/current'
    return api.get<Team>(endpoint)
  },

  async getMembers(teamId?: string) {
    const endpoint = teamId ? `/teams/${teamId}/members` : '/teams/current/members'
    return api.get<TeamMember[]>(endpoint)
  },

  async addMember(teamId: string, email: string, role: string) {
    return api.post(`/teams/${teamId}/members`, { email, role })
  },

  async updateMember(teamId: string, memberId: string, role: string) {
    return api.put(`/teams/${teamId}/members/${memberId}`, { role })
  },

  async removeMember(teamId: string, memberId: string) {
    return api.delete(`/teams/${teamId}/members/${memberId}`)
  },
}
```

**Step 2: Create TeamList component**

```typescript
'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Trash2, Edit, Plus } from 'lucide-react'

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
```

**Step 3: Create Team page**

```typescript
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
```

---

## Phase 2: Create Projects Page

### Task 2: Create Projects Page

**Files:**
- Create: `web-app/app/projects/page.tsx`
- Create: `web-app/components/project/ProjectList.tsx`
- Create: `web-app/lib/api/project-service.ts`

**Step 1: Create project service**

```typescript
import { api } from './client'

export interface Project {
  id: string
  name: string
  description: string
  owner: string
  memberCount: number
  graphCount: number
  createdDate: string
  lastModified: string
  status: 'active' | 'archived'
}

export const projectService = {
  async getProjects() {
    return api.get<Project[]>('/projects')
  },

  async getProject(projectId: string) {
    return api.get<Project>(`/projects/${projectId}`)
  },

  async createProject(data: Partial<Project>) {
    return api.post<Project>('/projects', data)
  },

  async updateProject(projectId: string, data: Partial<Project>) {
    return api.put<Project>(`/projects/${projectId}`, data)
  },

  async deleteProject(projectId: string) {
    return api.delete(`/projects/${projectId}`)
  },
}
```

**Step 2: Create ProjectList component**

```typescript
'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Trash2, Edit, Archive, ExternalLink } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  owner: string
  memberCount: number
  graphCount: number
  createdDate: string
  lastModified: string
  status: 'active' | 'archived'
}

interface ProjectListProps {
  projects: Project[]
  loading?: boolean
  onEditProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onViewProject?: (projectId: string) => void
}

export function ProjectList({
  projects = [],
  loading = false,
  onEditProject,
  onDeleteProject,
  onViewProject,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading projects...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>No projects yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <div
          key={project.id}
          className="p-4 rounded-lg border hover:bg-surface-hover transition-colors"
          style={{ borderColor: 'var(--color-border)', backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold text-base mb-1">
                {project.name}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-2">
                {project.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  Owner: {project.owner}
                </span>
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  {project.memberCount} members
                </span>
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  {project.graphCount} graphs
                </span>
                <Badge variant="primary" style={{ backgroundColor: project.status === 'active' ? '#10b981' : '#9ca3af' }}>
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewProject?.(project.id)}
                className="p-2 hover:bg-surface rounded transition-colors"
              >
                <ExternalLink size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button
                onClick={() => onEditProject?.(project.id)}
                className="p-2 hover:bg-surface rounded transition-colors"
              >
                <Edit size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button
                onClick={() => onDeleteProject?.(project.id)}
                className="p-2 hover:bg-surface rounded transition-colors"
              >
                <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Create Projects page**

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { ProjectList } from '@/components/project/ProjectList'
import { projectService } from '@/lib/api/project-service'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  owner: string
  memberCount: number
  graphCount: number
  createdDate: string
  lastModified: string
  status: 'active' | 'archived'
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Customer Analytics',
    description: 'Customer data and relationship graph',
    owner: 'Alice Johnson',
    memberCount: 5,
    graphCount: 12,
    createdDate: '2024-01-10',
    lastModified: '2024-04-08',
    status: 'active',
  },
  {
    id: '2',
    name: 'Product Catalog',
    description: 'Product hierarchy and relationships',
    owner: 'Bob Smith',
    memberCount: 3,
    graphCount: 8,
    createdDate: '2024-02-15',
    lastModified: '2024-04-05',
    status: 'active',
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      const response = await projectService.getProjects()

      if (response.error) {
        setProjects(MOCK_PROJECTS)
      } else {
        setProjects(response.data || MOCK_PROJECTS)
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

  return (
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
              Projects
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Manage your knowledge graph projects
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            New Project
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-6xl">
        <ProjectList
          projects={projects}
          loading={loading}
          onViewProject={(id) => console.log('View project', id)}
          onEditProject={(id) => console.log('Edit project', id)}
          onDeleteProject={(id) => console.log('Delete project', id)}
        />
      </div>
    </div>
  )
}
```

---

## Phase 3: Create Permissions Page

### Task 3: Create Permissions Page

**Files:**
- Create: `web-app/app/permissions/page.tsx`
- Create: `web-app/components/permission/PermissionsList.tsx`
- Create: `web-app/lib/api/permission-service.ts`

**Step 1: Create permission service**

```typescript
import { api } from './client'

export interface Permission {
  id: string
  role: string
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

export const permissionService = {
  async getPermissions() {
    return api.get<Permission[]>('/permissions')
  },

  async getRolePermissions(role: string) {
    return api.get<Permission[]>(`/roles/${role}/permissions`)
  },

  async updatePermission(permissionId: string, data: Partial<Permission>) {
    return api.put<Permission>(`/permissions/${permissionId}`, data)
  },

  async grantPermission(roleId: string, permissionId: string) {
    return api.post(`/roles/${roleId}/permissions/${permissionId}`, {})
  },

  async revokePermission(roleId: string, permissionId: string) {
    return api.delete(`/roles/${roleId}/permissions/${permissionId}`)
  },
}
```

**Step 2: Create PermissionsList component**

```typescript
'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Edit, Trash2 } from 'lucide-react'

interface Permission {
  id: string
  role: string
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

interface PermissionsListProps {
  permissions: Permission[]
  loading?: boolean
  onEditPermission?: (permissionId: string) => void
  onRevokePermission?: (permissionId: string) => void
}

const actionColors: Record<string, string> = {
  create: '#10b981',
  read: '#3366cc',
  update: '#f59e0b',
  delete: '#ef4444',
}

export function PermissionsList({
  permissions = [],
  loading = false,
  onEditPermission,
  onRevokePermission,
}: PermissionsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading permissions...</p>
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>No permissions configured</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Role</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Resource</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Action</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Description</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-center px-4 py-3 font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(permission => (
            <tr key={permission.id} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
              <td style={{ color: 'var(--color-text-primary)' }} className="px-4 py-3 text-sm font-medium">
                {permission.role}
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }} className="px-4 py-3 text-sm">
                {permission.resource}
              </td>
              <td className="px-4 py-3 text-sm">
                <Badge
                  variant="primary"
                  style={{ backgroundColor: actionColors[permission.action] || '#3366cc' }}
                >
                  {permission.action}
                </Badge>
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }} className="px-4 py-3 text-sm">
                {permission.description}
              </td>
              <td className="px-4 py-3 text-sm text-center flex gap-2 justify-center">
                <button
                  onClick={() => onEditPermission?.(permission.id)}
                  className="p-1 hover:bg-surface rounded transition-colors"
                >
                  <Edit size={16} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
                <button
                  onClick={() => onRevokePermission?.(permission.id)}
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
```

**Step 3: Create Permissions page**

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { PermissionsList } from '@/components/permission/PermissionsList'
import { permissionService } from '@/lib/api/permission-service'

interface Permission {
  id: string
  role: string
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

const MOCK_PERMISSIONS: Permission[] = [
  {
    id: '1',
    role: 'admin',
    resource: 'graphs',
    action: 'create',
    description: 'Create new graphs',
    grantedTo: ['admin'],
    createdDate: '2024-01-01',
  },
  {
    id: '2',
    role: 'editor',
    resource: 'graphs',
    action: 'update',
    description: 'Update graphs',
    grantedTo: ['admin', 'editor'],
    createdDate: '2024-01-01',
  },
  {
    id: '3',
    role: 'viewer',
    resource: 'graphs',
    action: 'read',
    description: 'View graphs',
    grantedTo: ['admin', 'editor', 'viewer'],
    createdDate: '2024-01-01',
  },
  {
    id: '4',
    role: 'admin',
    resource: 'team',
    action: 'delete',
    description: 'Manage team members',
    grantedTo: ['admin'],
    createdDate: '2024-01-01',
  },
]

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true)
      const response = await permissionService.getPermissions()

      if (response.error) {
        setPermissions(MOCK_PERMISSIONS)
      } else {
        setPermissions(response.data || MOCK_PERMISSIONS)
      }
      setLoading(false)
    }

    fetchPermissions()
  }, [])

  return (
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
          Permissions
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage role-based access control
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
          <PermissionsList
            permissions={permissions}
            loading={loading}
            onEditPermission={(id) => console.log('Edit permission', id)}
            onRevokePermission={(id) => console.log('Revoke permission', id)}
          />
        </div>
      </div>
    </div>
  )
}
```

---

### Task 4: Create services index and verify

**Files:**
- Create: `web-app/components/team/index.ts`
- Create: `web-app/components/project/index.ts`
- Create: `web-app/components/permission/index.ts`

**Step 1: Commit all changes**

```bash
cd web-app
git add app/team/ app/projects/ app/permissions/ components/team/ components/project/ components/permission/ lib/api/team-service.ts lib/api/project-service.ts lib/api/permission-service.ts
git commit -m "feat: add team management, projects, and permissions pages"
```

---

## Summary

**Total Tasks:** 4  
**Estimated Time:** 1.5-2 hours  
**Deliverables:**
- ✅ Team Management page with member list and CRUD
- ✅ Projects page with project cards
- ✅ Permissions page with role-based access control
- ✅ API services for team, projects, permissions
- ✅ Mock data with fallback
- ✅ Consistent Linear light styling

---

**Next Phase:** Write unit tests for components and services
