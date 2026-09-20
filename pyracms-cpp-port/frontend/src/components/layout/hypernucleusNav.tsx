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
    feature: 'hypernucleus',
    children: [
      {
        key: 'hypernucleus-games',
        label: 'Games',
        href: `${base}/games`,
        icon: <SportsEsportsOutlined />,
        feature: 'hypernucleus',
      },
      {
        key: 'hypernucleus-dependencies',
        label: 'Dependencies',
        href: `${base}/dependencies`,
        icon: <ExtensionOutlined />,
        feature: 'hypernucleus',
      },
      {
        key: 'hypernucleus-download',
        label: 'Download Hypernucleus Client',
        href: `${base}/download`,
        icon: <DownloadOutlined />,
        feature: 'hypernucleus',
        testId: 'download',
      },
    ],
  }
}
