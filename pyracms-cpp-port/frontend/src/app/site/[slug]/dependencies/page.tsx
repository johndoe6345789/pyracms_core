'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import SearchFilterBar from '@/components/common/SearchFilterBar'
import GameDepGrid from '@/components/gamedep/GameDepGrid'
import { useGameDepList } from '@/hooks/useGameDepList'
import { PLACEHOLDER_DEPS, DEP_TAGS } from '@/hooks/data/depPlaceholders'

export default function DependenciesPage() {
  const params = useParams()
  const slug = params.slug as string
  const list = useGameDepList(PLACEHOLDER_DEPS, DEP_TAGS)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dependencies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse shared libraries and dependencies for game development.
        </Typography>
      </Box>

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

      <GameDepGrid
        items={list.filtered}
        hrefPrefix={`/site/${slug}/dependencies`}
      />
    </Container>
  )
}
