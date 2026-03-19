'use client'

import { useState, useEffect } from 'react'

export interface Site {
  slug: string
  name: string
  description: string
  owner: string
}

const PLACEHOLDER_SITES: Site[] = [
  {
    slug: 'acme-corp',
    name: 'Acme Corporation',
    description: 'Official company portal with articles, forums, and knowledge base.',
    owner: 'admin',
  },
  {
    slug: 'dev-community',
    name: 'Dev Community',
    description: 'A community hub for developers to share articles and discuss projects.',
    owner: 'johndoe',
  },
  {
    slug: 'photo-gallery',
    name: 'Photo Gallery Hub',
    description: 'Curated photography galleries and creative showcases.',
    owner: 'janedoe',
  },
  {
    slug: 'gaming-zone',
    name: 'Gaming Zone',
    description: 'Game reviews, forums, and leaderboards for competitive gamers.',
    owner: 'gamer42',
  },
  {
    slug: 'tech-blog',
    name: 'Tech Blog Network',
    description: 'Latest tech articles, tutorials, and industry insights.',
    owner: 'techwriter',
  },
  {
    slug: 'art-collective',
    name: 'Art Collective',
    description: 'Digital art galleries and creative community forums.',
    owner: 'artist01',
  },
]

async function fetchSites(): Promise<Site[]> {
  // TODO: Replace with RTK Query call to backend API
  return new Promise((resolve) => {
    setTimeout(() => resolve(PLACEHOLDER_SITES), 500)
  })
}

export function useTenantList() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites().then((data) => {
      setSites(data)
      setLoading(false)
    })
  }, [])

  return { sites, loading }
}
