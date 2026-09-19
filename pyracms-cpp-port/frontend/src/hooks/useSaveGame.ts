'use client'

import { useSaveGameDep } from '@/hooks/useSaveGameDep'

/** Saves the edited game, then returns to its page. */
export function useSaveGame(slug: string, name: string) {
  return useSaveGameDep('game', slug, name)
}
