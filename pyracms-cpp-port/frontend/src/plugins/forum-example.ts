/**
 * Example Forum Plugin
 * 
 * This demonstrates how to create a plugin for PyraCMS with:
 * - Custom routes
 * - Navigation items
 * - Data models
 * - API endpoints
 */

import { createPlugin } from './registry'
import { ForumOutlined } from '@mui/icons-material'

export const forumPlugin = createPlugin({
  metadata: {
    id: 'forum',
    name: 'Forum Module',
    version: '1.0.0',
    description: 'Discussion forum with topics, posts, and categories',
    author: 'PyraCMS',
  },

  // Define routes for the plugin
  routes: [
    {
      path: '/forum',
      component: () => import('./forum/ForumList'),
      title: 'Forum',
      requiresAuth: false,
    },
    {
      path: '/forum/topic/:id',
      component: () => import('./forum/TopicView'),
      title: 'Topic',
      requiresAuth: false,
    },
    {
      path: '/forum/new-topic',
      component: () => import('./forum/NewTopic'),
      title: 'New Topic',
      requiresAuth: true,
    },
  ],

  // Add navigation items
  navigation: [
    {
      label: 'Forum',
      path: '/forum',
      icon: ForumOutlined as any,
      order: 10,
      requiresAuth: false,
    },
  ],

  // Define data models
  dataModels: [
    {
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
    },
    {
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
    },
    {
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
    },
  ],

  // Plugin settings
  settings: {
    postsPerPage: {
      type: 'number',
      label: 'Posts per page',
      default: 20,
    },
    allowAnonymousPosts: {
      type: 'boolean',
      label: 'Allow anonymous posts',
      default: false,
    },
    moderationEnabled: {
      type: 'boolean',
      label: 'Enable moderation',
      default: true,
    },
  },

  // Lifecycle hooks
  async onInstall() {
    console.log('Forum plugin installed')
    // Create default categories, etc.
  },

  async onActivate() {
    console.log('Forum plugin activated')
  },

  async onDeactivate() {
    console.log('Forum plugin deactivated')
  },
})

// Example: Register the plugin
// import { pluginRegistry } from './registry'
// pluginRegistry.register(forumPlugin)
