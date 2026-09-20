'use client'

import { Box } from '@mui/material'
import { MoreHorizOutlined } from '@mui/icons-material'
import { useFitLinks } from '@/hooks/useFitLinks'
import TopBarLinkButton from './TopBarLinkButton'
import TopBarMenu from './TopBarMenu'
import { isActive, type NavEntry } from './navTypes'

/**
 * The top row of links. From the `md` breakpoint up it keeps as many as fit
 * the space it has and folds the rest into "More" (recomputed on resize);
 * below `md` the burger drawer carries every link instead.
 */
export default function TopBarLinks({
  items,
  pathname,
}: {
  items: NavEntry[]
  pathname: string
}) {
  const { ref, count } = useFitLinks(items.map((i) => i.key).join('|'))
  const shown = items.slice(0, count)
  const rest = items.slice(count)
  const more: NavEntry | null = rest.length
    ? {
        key: 'more',
        label: 'More',
        href: '',
        icon: <MoreHorizOutlined />,
        children: rest,
      }
    : null
  return (
    <Box
      ref={ref}
      sx={{
        display: { xs: 'none', md: 'flex' },
        gap: 0.5,
        flexGrow: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {shown.map((item) => {
        const active = isActive(pathname, item)
        return item.children?.length ? (
          <TopBarMenu
            key={item.key}
            item={item}
            active={active}
            pathname={pathname}
          />
        ) : (
          <TopBarLinkButton key={item.key} item={item} active={active} />
        )
      })}
      {more && (
        <TopBarMenu
          item={more}
          active={rest.some((c) => isActive(pathname, c))}
          pathname={pathname}
        />
      )}
    </Box>
  )
}
