import { useState } from 'react'

export interface Revision {
  version: string
  published: boolean
  date: string
}

export interface Binary {
  os: string
  arch: string
  size: string
  url: string
}

export interface Dependency {
  name: string
  displayName: string
  version: string
}

export interface Screenshot {
  id: string
  src: string
  title: string
}

export interface GameDepDetailData {
  name: string
  displayName: string
  description: string
  owner: string
  created: string
  views: number
  likes: number
  dislikes: number
  tags: string[]
  revisions: Revision[]
  binaries: Binary[]
  dependencies: Dependency[]
  screenshots: Screenshot[]
}

export function useGameDepDetail(data: GameDepDetailData) {
  const [tabIndex, setTabIndex] = useState(0)

  return { detail: data, tabIndex, setTabIndex }
}
