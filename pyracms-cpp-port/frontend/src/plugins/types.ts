import type { ReactNode } from 'react'
import type { PluginDataModel } from './dataModel'

export type { PluginDataModel }

// Plugin metadata interface
export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author?: string
  homepage?: string
}

// Route definition for plugins
export interface PluginRoute {
  path: string
  component: () => Promise<any>
  title?: string
  requiresAuth?: boolean
  permissions?: string[]
}

// Navigation item for plugins
export interface PluginNavItem {
  label: string
  path: string
  icon?: ReactNode
  order?: number
  requiresAuth?: boolean
  permissions?: string[]
}

// API extension for plugins
export interface PluginApiExtension {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  handler: (req: any) => Promise<any>
}

// Main plugin interface
export interface Plugin {
  metadata: PluginMetadata
  routes?: PluginRoute[]
  navigation?: PluginNavItem[]
  dataModels?: PluginDataModel[]
  apiExtensions?: PluginApiExtension[]

  // Lifecycle hooks
  onInstall?: () => Promise<void>
  onUninstall?: () => Promise<void>
  onActivate?: () => Promise<void>
  onDeactivate?: () => Promise<void>

  // Configuration
  settings?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'select'
      label: string
      default: any
      options?: any[]
    }
  }
}
