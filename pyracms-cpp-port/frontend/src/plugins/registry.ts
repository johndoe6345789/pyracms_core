/**
 * Plugin System for PyraCMS
 * 
 * This file defines the plugin architecture that allows addons to:
 * - Register routes
 * - Define data models
 * - Add navigation items
 * - Extend the CMS functionality
 */

import { ReactNode } from 'react'

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

// Data model definition
export interface PluginDataModel {
  name: string
  fields: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'relation'
      required?: boolean
      default?: any
      relation?: {
        model: string
        type: 'one-to-one' | 'one-to-many' | 'many-to-many'
      }
    }
  }
  apiEndpoints?: {
    list?: string
    create?: string
    read?: string
    update?: string
    delete?: string
  }
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

// Plugin registry
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private activePlugins: Set<string> = new Set()

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin ${plugin.metadata.id} is already registered`)
    }
    this.plugins.set(plugin.metadata.id, plugin)
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId)
    this.activePlugins.delete(pluginId)
  }

  async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }
    
    if (plugin.onActivate) {
      await plugin.onActivate()
    }
    
    this.activePlugins.add(pluginId)
  }

  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }
    
    if (plugin.onDeactivate) {
      await plugin.onDeactivate()
    }
    
    this.activePlugins.delete(pluginId)
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getActivePlugins(): Plugin[] {
    return Array.from(this.activePlugins)
      .map(id => this.plugins.get(id))
      .filter((p): p is Plugin => p !== undefined)
  }

  getAllRoutes(): PluginRoute[] {
    return this.getActivePlugins().flatMap(p => p.routes || [])
  }

  getAllNavigation(): PluginNavItem[] {
    return this.getActivePlugins()
      .flatMap(p => p.navigation || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  getAllDataModels(): PluginDataModel[] {
    return this.getActivePlugins().flatMap(p => p.dataModels || [])
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry()

// Helper function to create a plugin
export function createPlugin(config: Plugin): Plugin {
  return config
}
