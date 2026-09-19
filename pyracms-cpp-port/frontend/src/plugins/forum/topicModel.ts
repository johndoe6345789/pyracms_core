import type { PluginDataModel } from '../dataModel'

export const topicModel: PluginDataModel = {
  name: 'ForumTopic',
  fields: {
    id: { type: 'number', required: true },
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    categoryId: {
      type: 'relation',
      required: true,
      relation: {
        model: 'ForumCategory',
        type: 'many-to-one',
      },
    },
    authorId: {
      type: 'relation',
      required: true,
      relation: {
        model: 'User',
        type: 'many-to-one',
      },
    },
    views: { type: 'number', default: 0 },
    isPinned: { type: 'boolean', default: false },
    isLocked: { type: 'boolean', default: false },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
  apiEndpoints: {
    list: '/api/forum/topics',
    create: '/api/forum/topics',
    read: '/api/forum/topics/:id',
    update: '/api/forum/topics/:id',
    delete: '/api/forum/topics/:id',
  },
}
