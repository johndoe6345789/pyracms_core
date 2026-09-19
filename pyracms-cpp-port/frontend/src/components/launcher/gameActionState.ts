import type { Revision } from '@/hooks/useGameDepDetail'

export type ActionLabel = 'Install' | 'Update' | 'Play'

export interface ActionState {
  versions: Revision[]
  latest: string
  isInstalled: boolean
  needsUpdate: boolean
  label: ActionLabel
}

/** Which action to offer, given the revisions and what is marked. */
export function actionState(
  revisions: Revision[],
  installedVersion: string | undefined,
): ActionState {
  const published = revisions.filter((r) => r.published)
  const versions = published.length ? published : revisions
  const latest = versions[0]?.version ?? ''
  const isInstalled = !!installedVersion
  const needsUpdate = isInstalled && installedVersion !== latest
  const label = !isInstalled ? 'Install' : needsUpdate ? 'Update' : 'Play'
  return { versions, latest, isInstalled, needsUpdate, label }
}

export const MSG_WITH_BINARY =
  'Opening the PyraCMS desktop client; downloading the build for ' +
  'your OS in case it is not installed.'

export const MSG_NO_BINARY =
  'Asked the PyraCMS desktop client to handle this. If nothing ' +
  'opened, install the client.'
