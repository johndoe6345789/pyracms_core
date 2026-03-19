'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Container, Typography, Box, Grid, Button, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment } from '@mui/material'
import { AddOutlined, SearchOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { SnippetCard } from '@/components/code/SnippetCard'
import { BackButton } from '@/components/common/BackButton'
import { useTenantId } from '@/hooks/useTenantId'
import api from '@/lib/api'

interface Snippet {
  id: string
  title: string
  language: string
  code: string
  author: string
  date: string
  runCount: number
}

export default function SnippetsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [search, setSearch] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    if (!tenantId) return
    api.get(`/api/snippets?tenant_id=${tenantId}`)
      .then(res => {
        const items = res.data.items || res.data || []
        setSnippets(items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          title: s.title || '',
          language: s.language || '',
          code: s.code || '',
          author: s.authorUsername || 'Unknown',
          date: typeof s.createdAt === 'string' ? (s.createdAt as string).split('T')[0] : '',
          runCount: s.runCount || 0,
        })))
      })
      .catch(() => {})
  }, [tenantId])

  const filtered = snippets
    .filter((s) => {
      const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
      const matchesLang = !languageFilter || s.language === languageFilter
      return matchesSearch && matchesLang
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.runCount - a.runCount
      return b.date.localeCompare(a.date)
    })

  const languages = [...new Set(snippets.map((s) => s.language))]

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 2 }}><BackButton href={`/site/${slug}`} label="Back to Site" /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">Code Snippets</Typography>
        <Button variant="contained" startIcon={<AddOutlined />} component={Link} href={`/site/${slug}/snippets/new`}>New Snippet</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ flexGrow: 1, minWidth: 200 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Language</InputLabel>
          <Select value={languageFilter} label="Language" onChange={(e) => setLanguageFilter(e.target.value)}>
            <MenuItem value="">All Languages</MenuItem>
            {languages.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="date">Newest</MenuItem>
            <MenuItem value="popularity">Most Runs</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((snippet) => (
          <Grid item xs={12} sm={6} md={4} key={snippet.id}>
            <SnippetCard {...snippet} siteSlug={slug} />
          </Grid>
        ))}
      </Grid>
      {filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No snippets found matching your criteria.</Typography>
      )}
    </Container>
  )
}
