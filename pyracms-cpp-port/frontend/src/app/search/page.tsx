'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, Container } from '@mui/material'
import { searchPagePath } from '@/lib/searchUrl'

/** Search lives inside each site; old /search?site=slug links move there. */
function Redirect() {
  const params = useSearchParams()
  const router = useRouter()
  const site = params.get('site') ?? ''
  const q = params.get('q') ?? ''
  useEffect(() => {
    if (site) router.replace(searchPagePath(site, { q }))
  }, [site, q, router])

  return (
    <Container sx={{ py: 6 }} data-testid="search-page">
      {!site && (
        <Alert severity="info" data-testid="search-no-site">
          Search works per site: open a site and use its search box.
        </Alert>
      )}
    </Container>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <Redirect />
    </Suspense>
  )
}
