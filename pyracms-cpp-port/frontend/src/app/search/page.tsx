'use client'

import {
  Box,
  Container,
  Grid,
  Typography,
} from '@mui/material'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
import PageTransition from '@/components/common/PageTransition'
import FacetSidebar from '@/components/search/FacetSidebar'
import { SearchResultsPanel } from '@/components/search/SearchResultsPanel'
import { useSearchPage } from '@/hooks/useSearchPage'

export default function SearchPage() {
  const search = useSearchPage()

  return (
    <PageTransition>
      <Container
        maxWidth="lg"
        sx={{ py: 6 }}
        data-testid="search-page"
        role="main"
        aria-label="Search page"
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Search
        </Typography>

        <Box sx={{ mb: 4, maxWidth: 600 }} data-testid="search-box">
          <SearchAutocomplete
            onSearch={search.handleSearch}
            onSelect={(url) => search.router.push(url)}
            placeholder="Search everything..."
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FacetSidebar
              facets={search.facets}
              activeType={search.activeType}
              onTypeChange={search.handleTypeChange}
              totalCount={search.totalCount}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <SearchResultsPanel
              loading={search.loading}
              page={search.page}
              query={search.query}
              results={search.results}
              setPage={search.setPage}
              totalCount={search.totalCount}
            />
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  )
}
