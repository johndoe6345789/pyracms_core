import { MenuItemData } from './menuItemTypes'

const PLACEHOLDER_MENU: MenuItemData[] = [
  {
    id: '1', label: 'Home',
    url: '/', children: [],
  },
  {
    id: '2', label: 'Articles',
    url: '/articles', children: [
      {
        id: '2a', label: 'Tutorials',
        url: '/articles?tag=tutorial',
        children: [],
      },
      {
        id: '2b', label: 'News',
        url: '/articles?tag=news',
        children: [],
      },
    ],
  },
  {
    id: '3', label: 'Forum',
    url: '/forum', children: [],
  },
  {
    id: '4', label: 'Code Snippets',
    url: '/snippets', children: [],
  },
  {
    id: '5', label: 'About',
    url: '/about', children: [
      {
        id: '5a', label: 'Team',
        url: '/about/team', children: [],
      },
      {
        id: '5b', label: 'Contact',
        url: '/about/contact', children: [],
      },
    ],
  },
]

export default PLACEHOLDER_MENU
