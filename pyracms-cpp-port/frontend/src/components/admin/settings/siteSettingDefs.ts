import type { SiteSettings } from '@/lib/siteSettings'
import { POLICY_GROUPS } from './siteSettingPolicy'

export type FieldKind =
  'text' | 'multiline' | 'url' | 'email' | 'bool' | 'theme'

export interface FieldDef {
  key: keyof SiteSettings
  label: string
  help: string
  kind: FieldKind
}

export interface FieldGroup {
  title: string
  fields: FieldDef[]
}

export const SETTING_GROUPS: FieldGroup[] = [
  {
    title: 'Identity',
    fields: [
      {
        key: 'site_name',
        label: 'Site name',
        kind: 'text',
        help: 'Shown in the header, the menu and the browser tab.',
      },
      {
        key: 'site_description',
        label: 'Site description',
        kind: 'multiline',
        help:
          'One or two sentences under the name in the menu; also the ' +
          'default search-engine description.',
      },
      {
        key: 'site_logo_url',
        label: 'Logo URL',
        kind: 'url',
        help: 'Image used when the site is shared on social networks.',
      },
      {
        key: 'site_favicon_url',
        label: 'Favicon URL',
        kind: 'url',
        help: 'Small icon shown in the browser tab.',
      },
      {
        key: 'contact_email',
        label: 'Contact email',
        kind: 'email',
        help: 'Shown as a "Contact" link in the site footer.',
      },
    ],
  },
  {
    title: 'Appearance',
    fields: [
      {
        key: 'default_theme',
        label: 'Default color mode',
        kind: 'theme',
        help:
          'Used for visitors who have not picked a mode themselves ' +
          '(colors and fonts live under Styles).',
      },
    ],
  },
  ...POLICY_GROUPS,
]
