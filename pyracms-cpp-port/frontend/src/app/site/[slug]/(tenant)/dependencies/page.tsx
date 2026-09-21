'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Alert, Button, Container, Typography, Box } from '@mui/material'
import SearchFilterBar from '@/components/common/SearchFilterBar'
import GameDepGrid from '@/components/gamedep/GameDepGrid'
import { useGameDepList } from '@/hooks/useGameDepList'
import { useGameDepPages } from '@/hooks/useGameDepPages'
import { useSiteSession } from '@/hooks/useSiteSession'

export default function DependenciesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { items, loading, error } = useGameDepPages('dep', slug)
  const tags = Array.from(new Set(items.flatMap((i) => i.tags))).sort()
  const list = useGameDepList(items, tags)
  const signedIn = useSiteSession(slug)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Dependencies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse shared libraries and dependencies for game development.
          </Typography>
        </Box>
        {signedIn && (
          <Button
            variant="contained"
            component={Link}
            href={`/site/${slug}/dependencies/new`}
            data-testid="new-dep-btn"
          >
            New dependency
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <SearchFilterBar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search dependencies..."
        filterTag={list.filterTag}
        onFilterTagChange={list.setFilterTag}
        availableTags={list.availableTags}
        sortBy={list.sortBy}
        onSortByChange={list.setSortBy}
      />

      {!loading && !error && items.length === 0 && (
        <Typography color="text.secondary" data-testid="deps-empty">
          {signedIn
            ? 'No dependencies yet - create the first one.'
            : 'No dependencies have been published yet.'}
        </Typography>
      )}
      <GameDepGrid
        items={list.filtered}
        hrefPrefix={`/site/${slug}/dependencies`}
      />
    </Container>
  )
}
