import type { PluginDataModel } from '../dataModel'

export const categoryModel: PluginDataModel = {
  name: 'ForumCategory',
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    slug: { type: 'string', required: true },
    order: { type: 'number', default: 0 },
    createdAt: { type: 'date' },
  },
  apiEndpoints: {
    list: '/api/forum/categories',
    create: '/api/forum/categories',
    read: '/api/forum/categories/:id',
    update: '/api/forum/categories/:id',
    delete: '/api/forum/categories/:id',
  },
}
