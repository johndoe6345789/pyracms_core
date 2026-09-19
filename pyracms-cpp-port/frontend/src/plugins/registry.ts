/**
 * Plugin registry for PyraCMS: lets addons register routes, data
 * models and navigation items, and hook into lifecycle events.
 * The plugin type definitions live in ./types.
 */

import type {
  Plugin, PluginRoute, PluginNavItem, PluginDataModel,
} from './types'

export type * from './types'

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

  private require(pluginId: string): Plugin {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`)
    return plugin
  }

  async activate(pluginId: string): Promise<void> {
    await this.require(pluginId).onActivate?.()
    this.activePlugins.add(pluginId)
  }

  async deactivate(pluginId: string): Promise<void> {
    await this.require(pluginId).onDeactivate?.()
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
