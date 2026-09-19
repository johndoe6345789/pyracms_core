'use client'

import { useForumCategories } from '@/hooks/useForumCategories'
import { ThreadActions } from './ThreadActions'

type Props = Parameters<typeof ThreadActions>[0] & {
  tenantId: number | null
}

function Loaded({ tenantId, ...rest }: Props) {
  const { categories } = useForumCategories(tenantId)
  const forums = categories.flatMap((c) =>
    c.forums.map((f) => ({ id: f.id, name: `${c.name} / ${f.name}` })))
  return <ThreadActions {...rest} forums={forums} />
}

/** Thread actions for moderators, with the forums a thread can move to. */
export function ThreadModActions(props: Props) {
  return props.isModerator ? <Loaded {...props} /> : null
}
