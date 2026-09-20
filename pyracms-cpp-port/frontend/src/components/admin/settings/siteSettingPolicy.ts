import type { FieldGroup } from './siteSettingDefs'

/** Access rules and search-engine fields. */
export const POLICY_GROUPS: FieldGroup[] = [
  {
    title: 'Access',
    fields: [
      {
        key: 'registration_open',
        label: 'Registration open',
        kind: 'bool',
        help:
          'When off, nobody can create a new account on this site. ' +
          'Existing members can still sign in.',
      },
      {
        key: 'comments_enabled',
        label: 'Comments enabled',
        kind: 'bool',
        help:
          'When off, no new comments can be posted anywhere on this ' +
          'site. Existing comments stay visible.',
      },
    ],
  },
  {
    title: 'Search engines (SEO)',
    fields: [
      {
        key: 'seo_title',
        label: 'SEO title',
        kind: 'text',
        help:
          'Title of the home page in search results. Defaults to the ' +
          'site name.',
      },
      {
        key: 'seo_description',
        label: 'SEO description',
        kind: 'multiline',
        help:
          'Description in search results. Defaults to the site ' +
          'description.',
      },
    ],
  },
]
