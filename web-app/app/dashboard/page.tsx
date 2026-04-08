'use client'

import React from 'react'
import { RecentGraphs, TeamActivity, Statistics } from '@/components/dashboard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-3xl font-semibold text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-1">
          Welcome back! Here's what's happening with your graphs.
        </p>
      </div>

      {/* Content Section */}
      <div className="px-8 py-8">
        {/* Statistics Grid */}
        <div className="mb-8">
          <Statistics />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Graphs (takes 2 cols on large screens) */}
          <div className="lg:col-span-2">
            <RecentGraphs />
          </div>

          {/* Right Column - Team Activity */}
          <div>
            <TeamActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
