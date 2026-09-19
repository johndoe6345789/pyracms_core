import type { PluginDataModel } from '../dataModel'

export const postModel: PluginDataModel = {
  name: 'ForumPost',
  fields: {
    id: { type: 'number', required: true },
    content: { type: 'string', required: true },
    topicId: {
      type: 'relation',
      required: true,
      relation: {
        model: 'ForumTopic',
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
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
  apiEndpoints: {
    list: '/api/forum/posts',
    create: '/api/forum/posts',
    read: '/api/forum/posts/:id',
    update: '/api/forum/posts/:id',
    delete: '/api/forum/posts/:id',
  },
}
