'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Container, Typography, Box, Grid, Button, Alert,
  FormControl, InputLabel, Select, MenuItem, TextField,
  InputAdornment, Chip, Skeleton,
} from '@mui/material'
import { AddOutlined, SearchOutlined } from '@mui/icons-material'
import { SnippetCard } from '@/components/code/SnippetCard'
import { BackButton } from '@/components/common/BackButton'
import { useSnippets } from '@/hooks/useSnippets'
import { useTenantId } from '@/hooks/useTenantId'

export default function SnippetsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const s = useSnippets(tenantId)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="snippets-page"
    >
      <Box sx={{ mb: 2 }}>
        <BackButton href={`/site/${slug}`} label="Back to Site" />
      </Box>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2,
      }}>
        <Typography variant="h3" component="h1">
          Code Snippets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          component={Link}
          href={`/site/${slug}/snippets/new`}
          data-testid="new-snippet-btn"
          aria-label="Create new snippet"
        >
          New Snippet
        </Button>
      </Box>

      <Box sx={{
        display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap',
      }}>
        <TextField
          placeholder="Search title, author or code..."
          value={s.search}
          onChange={(e) => s.setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
          data-testid="snippet-search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined aria-label="Search" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={s.sortBy}
            label="Sort By"
            onChange={(e) => s.setSortBy(e.target.value)}
            data-testid="sort-select"
          >
            <MenuItem value="date">Newest</MenuItem>
            <MenuItem value="popularity">Most Runs</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}
        data-testid="language-filter"
      >
        <Chip
          label="All"
          color={s.language ? 'default' : 'primary'}
          onClick={() => s.setLanguage('')}
        />
        {s.languages.map((l) => (
          <Chip
            key={l}
            label={l}
            color={s.language === l ? 'primary' : 'default'}
            onClick={() =>
              s.setLanguage(s.language === l ? '' : l)}
          />
        ))}
      </Box>

      {s.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Could not load snippets. Please try again later.
        </Alert>
      )}

      <Grid container spacing={3}>
        {s.loading
          ? [0, 1, 2].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={240} />
            </Grid>
          ))
          : s.snippets.map((snippet) => (
            <Grid item xs={12} sm={6} md={4} key={snippet.id}>
              <SnippetCard {...snippet} siteSlug={slug} />
            </Grid>
          ))}
      </Grid>
      {!s.loading && !s.error && s.snippets.length === 0 && (
        <Box
          sx={{ textAlign: 'center', py: 6 }}
          data-testid="no-snippets-msg"
        >
          <Typography color="text.secondary" gutterBottom>
            {s.total === 0
              ? 'No snippets yet. Share the first one!'
              : 'No snippets match your search.'}
          </Typography>
          {s.total === 0 && (
            <Button
              component={Link}
              href={`/site/${slug}/snippets/new`}
            >
              Create a snippet
            </Button>
          )}
        </Box>
      )}
    </Container>
  )
}
