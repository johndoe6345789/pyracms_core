import { Alert, Box, Button, Chip, Typography } from '@mui/material'
import { RefreshOutlined } from '@mui/icons-material'
import { SearchIndexingTable } from './SearchIndexingTable'
import type { useSearchIndexing } from '@/hooks/admin/useSearchIndexing'

type Props = { s: ReturnType<typeof useSearchIndexing> }

/** Engine, queue and per-type counts, with the rebuild button. */
export function SearchIndexingPanel({ s }: Props) {
  const { status } = s
  const usable = status.configured && status.reachable
  return (
    <Box sx={{ display: 'grid', gap: 3 }} data-testid="search-indexing">
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={status.configured ? 'Elasticsearch' : 'PostgreSQL search'}
          color={status.configured ? 'primary' : 'default'}
          data-testid="search-engine"
        />
        {status.configured && (
          <Chip
            label={status.reachable ? 'Reachable' : 'Unreachable'}
            color={status.reachable ? 'success' : 'error'}
            data-testid="search-reachable"
          />
        )}
        {status.pending > 0 && (
          <Chip
            label={`${status.pending} changes waiting`}
            color="warning"
            data-testid="search-pending"
          />
        )}
      </Box>
      {!status.configured && (
        <Alert severity="info">
          Elasticsearch is not configured, so searches use PostgreSQL full-text
          search and there is no index to rebuild.
        </Alert>
      )}
      {s.queued !== null && (
        <Alert severity="success" data-testid="reindex-started">
          Reindex started: {s.queued} items queued.
        </Alert>
      )}
      <SearchIndexingTable status={status} />
      <Box>
        <Button
          variant="contained"
          startIcon={<RefreshOutlined />}
          disabled={!usable || s.busy}
          onClick={s.reindex}
          data-testid="reindex-btn"
        >
          {s.busy ? 'Reindexing...' : 'Reindex this site'}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Drops this site&apos;s documents from the index and rebuilds them from
          the database. Search keeps working while it runs, but results fill in
          over a few seconds.
        </Typography>
      </Box>
    </Box>
  )
}
