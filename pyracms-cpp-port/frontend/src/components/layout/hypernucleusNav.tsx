import {
  DownloadOutlined,
  ExtensionOutlined,
  RocketLaunchOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'
import type { NavEntry } from './navTypes'

/**
 * The one Hypernucleus entry of a site menu: Games, Dependencies and the
 * launcher download all live under it.
 */
export function hypernucleusEntry(slug: string): NavEntry {
  const base = `/site/${slug}`
  return {
    key: 'hypernucleus',
    label: 'Hypernucleus',
    href: `${base}/games`,
    icon: <RocketLaunchOutlined />,
    children: [
      {
        key: 'hypernucleus-games',
        label: 'Games',
        href: `${base}/games`,
        icon: <SportsEsportsOutlined />,
      },
      {
        key: 'hypernucleus-dependencies',
        label: 'Dependencies',
        href: `${base}/dependencies`,
        icon: <ExtensionOutlined />,
      },
      {
        key: 'hypernucleus-download',
        label: 'Download Hypernucleus Client',
        href: `${base}/download`,
        icon: <DownloadOutlined />,
        testId: 'download',
      },
    ],
  }
}
