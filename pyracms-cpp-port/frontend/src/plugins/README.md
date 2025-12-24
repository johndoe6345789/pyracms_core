# Plugin System Documentation

PyraCMS features a powerful plugin architecture that allows you to extend the CMS with custom modules, each with their own routes, data models, and functionality.

## Overview

The plugin system allows addon packages to:
- ✅ Define custom routes and pages
- ✅ Register data models with full CRUD operations
- ✅ Add navigation menu items
- ✅ Extend API endpoints
- ✅ Hook into lifecycle events
- ✅ Manage settings

## Creating a Plugin

### Basic Structure

```typescript
import { createPlugin } from '@/plugins/registry'

export const myPlugin = createPlugin({
  metadata: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'Description of my plugin',
    author: 'Your Name',
  },
  
  // Your plugin configuration
  routes: [...],
  navigation: [...],
  dataModels: [...],
})
```

## Plugin Configuration

### 1. Metadata

Every plugin must have metadata:

```typescript
metadata: {
  id: 'unique-plugin-id',        // Required: Unique identifier
  name: 'Display Name',           // Required: Human-readable name
  version: '1.0.0',              // Required: Semantic version
  description: 'What it does',   // Required: Plugin description
  author: 'Author Name',         // Optional: Plugin author
  homepage: 'https://...',       // Optional: Plugin homepage
}
```

### 2. Routes

Define custom routes for your plugin:

```typescript
routes: [
  {
    path: '/my-plugin',
    component: () => import('./MyComponent'),
    title: 'My Plugin',
    requiresAuth: false,           // Optional: Require authentication
    permissions: ['view_content'], // Optional: Required permissions
  },
  {
    path: '/my-plugin/:id',
    component: () => import('./MyDetailView'),
    title: 'Detail View',
    requiresAuth: true,
  },
]
```

### 3. Navigation

Add items to the navigation menu:

```typescript
import { ArticleOutlined } from '@mui/icons-material'

navigation: [
  {
    label: 'My Plugin',
    path: '/my-plugin',
    icon: ArticleOutlined,
    order: 10,                      // Optional: Display order
    requiresAuth: false,
    permissions: ['view_content'],
  },
]
```

### 4. Data Models

Define data models for your plugin:

```typescript
dataModels: [
  {
    name: 'Article',
    fields: {
      id: { type: 'number', required: true },
      title: { type: 'string', required: true },
      content: { type: 'string', required: true },
      published: { type: 'boolean', default: false },
      publishedAt: { type: 'date' },
      authorId: {
        type: 'relation',
        required: true,
        relation: {
          model: 'User',
          type: 'many-to-one',
        },
      },
      tags: {
        type: 'relation',
        relation: {
          model: 'Tag',
          type: 'many-to-many',
        },
      },
    },
    apiEndpoints: {
      list: '/api/articles',
      create: '/api/articles',
      read: '/api/articles/:id',
      update: '/api/articles/:id',
      delete: '/api/articles/:id',
    },
  },
]
```

#### Field Types

- `string` - Text data
- `number` - Numeric data
- `boolean` - True/false values
- `date` - Date/timestamp
- `json` - JSON data
- `relation` - Relationship to another model

#### Relation Types

- `one-to-one` - Single relationship
- `one-to-many` / `many-to-one` - One side has multiple related records
- `many-to-many` - Both sides can have multiple related records

### 5. API Extensions

Extend the API with custom endpoints:

```typescript
apiExtensions: [
  {
    endpoint: '/api/my-plugin/custom',
    method: 'POST',
    handler: async (req) => {
      // Your custom logic
      return { success: true, data: {...} }
    },
  },
]
```

### 6. Lifecycle Hooks

React to plugin lifecycle events:

```typescript
async onInstall() {
  // Called when plugin is first installed
  console.log('Plugin installed')
  // Create default data, tables, etc.
},

async onUninstall() {
  // Called when plugin is uninstalled
  console.log('Plugin uninstalled')
  // Clean up data, tables, etc.
},

async onActivate() {
  // Called when plugin is activated
  console.log('Plugin activated')
},

async onDeactivate() {
  // Called when plugin is deactivated
  console.log('Plugin deactivated')
},
```

### 7. Settings

Define configurable settings for your plugin:

```typescript
settings: {
  itemsPerPage: {
    type: 'number',
    label: 'Items per page',
    default: 10,
  },
  enableComments: {
    type: 'boolean',
    label: 'Enable comments',
    default: true,
  },
  theme: {
    type: 'select',
    label: 'Theme',
    default: 'light',
    options: ['light', 'dark', 'auto'],
  },
}
```

## Using the Plugin System

### Register a Plugin

```typescript
import { pluginRegistry } from '@/plugins/registry'
import { myPlugin } from './my-plugin'

// Register the plugin
pluginRegistry.register(myPlugin)

// Activate the plugin
await pluginRegistry.activate('my-plugin')
```

### Get Plugin Data

```typescript
// Get all active plugins
const activePlugins = pluginRegistry.getActivePlugins()

// Get all routes from active plugins
const allRoutes = pluginRegistry.getAllRoutes()

// Get all navigation items
const navItems = pluginRegistry.getAllNavigation()

// Get all data models
const dataModels = pluginRegistry.getAllDataModels()

// Get a specific plugin
const plugin = pluginRegistry.getPlugin('my-plugin')
```

## Example: Forum Plugin

See `forum-example.ts` for a complete example of a forum plugin with:
- Multiple routes (list, detail, create)
- Navigation items
- Three data models (Category, Topic, Post)
- Configurable settings
- Lifecycle hooks

## Backend Integration

### Prisma Schema Generation

For each data model, you should generate corresponding Prisma schema:

```prisma
model Article {
  id          Int      @id @default(autoincrement())
  title       String
  content     String
  published   Boolean  @default(false)
  publishedAt DateTime?
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("articles")
}
```

### C++ API Endpoints

Create corresponding C++ handlers for your API endpoints:

```cpp
// article_handler.h
class ArticleHandler {
public:
    std::string handleList(const std::string& request);
    std::string handleCreate(const std::string& request);
    std::string handleRead(int id);
    std::string handleUpdate(int id, const std::string& request);
    std::string handleDelete(int id);
};
```

## Best Practices

1. **Use unique plugin IDs** - Prevent conflicts with other plugins
2. **Version your plugins** - Use semantic versioning
3. **Document your data models** - Make it clear what each field does
4. **Handle errors gracefully** - Always validate input and handle failures
5. **Use permissions** - Protect sensitive routes and operations
6. **Test thoroughly** - Test all routes, data operations, and edge cases
7. **Clean up on uninstall** - Remove data and resources when plugin is uninstalled

## Plugin Structure

Organize your plugin code:

```
my-plugin/
├── index.ts              # Plugin definition
├── components/           # React components
│   ├── List.tsx
│   ├── Detail.tsx
│   └── Form.tsx
├── hooks/               # Custom React hooks
│   └── useArticles.ts
├── types/               # TypeScript types
│   └── index.ts
└── utils/               # Utility functions
    └── helpers.ts
```

## Distribution

Package your plugin as an npm package for easy distribution:

```json
{
  "name": "@pyracms/plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "peerDependencies": {
    "react": "^18.0.0",
    "@mui/material": "^5.0.0"
  }
}
```

Users can then install your plugin:

```bash
bun add @pyracms/plugin-my-plugin
```

## Support

For more examples and support:
- Check the `plugins/` directory for examples
- Read the main README for architecture details
- Open an issue on GitHub for questions
