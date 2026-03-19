'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Container, Typography, Box, Grid, Button, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment } from '@mui/material'
import { AddOutlined, SearchOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { SnippetCard } from '@/components/code/SnippetCard'
import { BackButton } from '@/components/common/BackButton'

const PLACEHOLDER_SNIPPETS = [
  { id: 'snippet-1', title: 'Fibonacci Sequence', language: 'python', code: 'def fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint(fibonacci(10))', author: 'Alice', date: '2026-03-15', runCount: 42 },
  { id: 'snippet-2', title: 'Quick Sort', language: 'python', code: 'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)', author: 'Bob', date: '2026-03-14', runCount: 28 },
  { id: 'snippet-3', title: 'HTTP Server', language: 'javascript', code: 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  res.end("Hello World");\n});\n\nserver.listen(3000);', author: 'Charlie', date: '2026-03-13', runCount: 15 },
  { id: 'snippet-4', title: 'Binary Search', language: 'cpp', code: '#include <vector>\n#include <iostream>\n\nint binarySearch(std::vector<int>& arr, int target) {\n    int lo = 0, hi = arr.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}', author: 'Alice', date: '2026-03-12', runCount: 33 },
  { id: 'snippet-5', title: 'Merge Sort', language: 'rust', code: 'fn merge_sort(arr: &mut Vec<i32>) {\n    let len = arr.len();\n    if len <= 1 { return; }\n    let mid = len / 2;\n    let mut left = arr[..mid].to_vec();\n    let mut right = arr[mid..].to_vec();\n    merge_sort(&mut left);\n    merge_sort(&mut right);\n}', author: 'Dana', date: '2026-03-11', runCount: 9 },
  { id: 'snippet-6', title: 'REST API Handler', language: 'go', code: 'package main\n\nimport (\n    "encoding/json"\n    "net/http"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})\n}\n\nfunc main() {\n    http.HandleFunc("/api", handler)\n    http.ListenAndServe(":8080", nil)\n}', author: 'Eve', date: '2026-03-10', runCount: 21 },
]

export default function SnippetsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [search, setSearch] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const filtered = PLACEHOLDER_SNIPPETS
    .filter((s) => {
      const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
      const matchesLang = !languageFilter || s.language === languageFilter
      return matchesSearch && matchesLang
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.runCount - a.runCount
      return b.date.localeCompare(a.date)
    })

  const languages = [...new Set(PLACEHOLDER_SNIPPETS.map((s) => s.language))]

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
