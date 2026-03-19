'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Paper,
  List, ListItem, ListItemIcon, ListItemText, Chip, Pagination, Grid,
} from '@mui/material'
import {
  ArticleOutlined, ForumOutlined, CodeOutlined, PersonOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'
import api from '@/lib/api'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
import FacetSidebar from '@/components/search/FacetSidebar'
import PageTransition from '@/components/common/PageTransition'
import AnimatedList from '@/components/common/AnimatedList'

interface SearchResult {
  type: string
  id: number
  title: string
  snippet: string
  url: string
  rank: number
  createdAt: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined />,
  forum_post: <ForumOutlined />,
  snippet: <CodeOutlined />,
  gamedep: <SportsEsportsOutlined />,
  user: <PersonOutlined />,
}

const TYPE_COLORS: Record<string, string> = {
  article: '#1976d2',
  forum_post: '#ed6c02',
  snippet: '#2e7d32',
  gamedep: '#0097a7',
  user: '#9c27b0',
}

const ITEMS_PER_PAGE = 10

function highlightMatch(text: string, highlight: string): string {
  if (!highlight) return text
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  // DOMPurify sanitizes the output to prevent XSS from search result content
  return DOMPurify.sanitize(text.replace(regex, '<mark>$1</mark>'))
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [facets, setFacets] = useState<Record<string, number>>({})
  const [activeType, setActiveType] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const performSearch = useCallback(async (q: string, type: string, pg: number) => {
    if (!q) {
      setResults([])
      setTotalCount(0)
      setFacets({})
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q,
        tenant_id: '1',
        type: type === 'all' ? '' : type,
        limit: String(ITEMS_PER_PAGE),
        offset: String((pg - 1) * ITEMS_PER_PAGE),
      })
      const res = await api.get(`/api/search?${params}`)
      setResults(res.data.items || [])
      setTotalCount(res.data.totalCount || 0)
      setFacets(res.data.facets || {})
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeType, page)
    }
  }, [initialQuery, activeType, page, performSearch])

  const handleSearch = (q: string) => {
    setQuery(q)
    setPage(1)
    performSearch(q, activeType, 1)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    setPage(1)
    performSearch(query, type, 1)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>Search</Typography>

        <Box sx={{ mb: 4, maxWidth: 600 }}>
          <SearchAutocomplete
            onSearch={handleSearch}
            onSelect={(url) => router.push(url)}
            placeholder="Search everything..."
          />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FacetSidebar
              facets={facets}
              activeType={activeType}
              onTypeChange={handleTypeChange}
              totalCount={totalCount}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            {loading ? (
              <Typography color="text.secondary">Searching...</Typography>
            ) : results.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderColor: 'divider' }}>
                <Typography color="text.secondary">
                  {query ? `No results found for "${query}"` : 'Enter a search query to find content.'}
                </Typography>
              </Paper>
            ) : (
              <List disablePadding>
                <AnimatedList>
                  {results.map((result, idx) => (
                    <ListItem
                      key={`${result.type}-${result.id}`}
                      component="a"
                      href={result.url}
                      divider={idx < results.length - 1}
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 0, py: 2, textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: TYPE_COLORS[result.type] || '#666', mt: 0.5 }}>
                        {TYPE_ICONS[result.type] || <ArticleOutlined />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{result.title}</Typography>
                            <Chip label={result.type} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: (TYPE_COLORS[result.type] || '#666') + '20', color: TYPE_COLORS[result.type] || '#666' }} />
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            component="span"
                            // Content is sanitized through DOMPurify above
                            dangerouslySetInnerHTML={{ __html: highlightMatch(result.snippet || '', query) }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </AnimatedList>
              </List>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  )
}
