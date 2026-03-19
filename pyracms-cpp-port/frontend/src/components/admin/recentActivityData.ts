import React from 'react'

export interface ActivityItem {
  id: string
  icon: React.ReactNode
  text: string
  time: string
  type: 'create' | 'edit' | 'delete' | 'user'
}

export const ACTIVITY_COLORS: Record<
  string, string
> = {
  create: '#2e7d32',
  edit: '#1976d2',
  delete: '#d32f2f',
  user: '#9c27b0',
}
