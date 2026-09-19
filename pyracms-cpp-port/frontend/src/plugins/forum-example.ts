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
import { categoryModel } from './forum/categoryModel'
import { topicModel } from './forum/topicModel'
import { postModel } from './forum/postModel'
import { forumSettings } from './forum/settings'

export const forumPlugin = createPlugin({
  metadata: {
    id: 'forum',
    name: 'Forum Module',
    version: '1.0.0',
    description: 'Discussion forum with topics, posts, and categories',
    author: 'PyraCMS',
  },

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

  navigation: [
    {
      label: 'Forum',
      path: '/forum',
      icon: ForumOutlined as any,
      order: 10,
      requiresAuth: false,
    },
  ],

  dataModels: [categoryModel, topicModel, postModel],

  settings: forumSettings,

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
