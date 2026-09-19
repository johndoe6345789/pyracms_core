import { render, screen } from '@testing-library/react'
import { pluginRegistry, createPlugin } from '@/plugins/registry'
import { forumPlugin } from '@/plugins/forum-example'
import ForumList from '@/plugins/forum/ForumList'
import NewTopic from '@/plugins/forum/NewTopic'
import TopicView from '@/plugins/forum/TopicView'

const mk = (id: string, order = 0, extra = {}) => createPlugin({
  metadata: { id, name: id, version: '1', description: '' },
  navigation: [{ label: id, path: `/${id}`, order }],
  routes: [{ path: `/${id}`, component: async () => null }],
  dataModels: [{ name: id, fields: {} }],
  ...extra,
})

describe('pluginRegistry', () => {
  afterEach(() => pluginRegistry.getAllPlugins()
    .forEach((p) => pluginRegistry.unregister(p.metadata.id)))

  it('registers, rejects duplicates and unregisters', () => {
    pluginRegistry.register(mk('a'))
    expect(() => pluginRegistry.register(mk('a'))).toThrow(/already/)
    expect(pluginRegistry.getPlugin('a')).toBeDefined()
    pluginRegistry.unregister('a')
    expect(pluginRegistry.getAllPlugins()).toEqual([])
  })

  it('activates with lifecycle hooks and aggregates', async () => {
    const onActivate = jest.fn(); const onDeactivate = jest.fn()
    pluginRegistry.register(mk('a', 2, { onActivate, onDeactivate }))
    pluginRegistry.register(mk('b', 1))
    pluginRegistry.register(mk('c', 0, { navigation: undefined,
      routes: undefined, dataModels: undefined }))
    await pluginRegistry.activate('a')
    await pluginRegistry.activate('b')
    await pluginRegistry.activate('c')
    expect(onActivate).toHaveBeenCalled()
    expect(pluginRegistry.getAllNavigation().map((n) => n.label))
      .toEqual(['b', 'a'])
    expect(pluginRegistry.getAllRoutes()).toHaveLength(2)
    expect(pluginRegistry.getAllDataModels()).toHaveLength(2)
    await pluginRegistry.deactivate('a')
    expect(onDeactivate).toHaveBeenCalled()
    expect(pluginRegistry.getActivePlugins()).toHaveLength(2)
  })

  it('fails on unknown ids and skips unregistered actives', async () => {
    await expect(pluginRegistry.activate('x')).rejects.toThrow(/not found/)
    await expect(pluginRegistry.deactivate('x')).rejects.toThrow(/not found/)
    pluginRegistry.register(mk('z'))
    await pluginRegistry.activate('z')
    pluginRegistry.unregister('z')
    expect(pluginRegistry.getActivePlugins()).toEqual([])
    pluginRegistry.register(mk('n', 0, { onActivate: undefined }))
    await pluginRegistry.activate('n')
    await pluginRegistry.deactivate('n')
  })
})

describe('forum plugin example', () => {
  it('describes routes, models and lifecycle', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    expect(forumPlugin.dataModels!.map((m) => m.name))
      .toEqual(['ForumCategory', 'ForumTopic', 'ForumPost'])
    expect(Object.keys(forumPlugin.settings!)).toHaveLength(3)
    for (const r of forumPlugin.routes!) await r.component()
    await forumPlugin.onInstall!()
    await forumPlugin.onActivate!()
    await forumPlugin.onDeactivate!()
    expect(log).toHaveBeenCalledTimes(3)
    log.mockRestore()
  })

  it('placeholder views render', () => {
    render(<><ForumList /><NewTopic /><TopicView /></>)
    expect(screen.getByText('Forum List')).toBeInTheDocument()
    expect(screen.getByText('Topic View')).toBeInTheDocument()
  })
})
