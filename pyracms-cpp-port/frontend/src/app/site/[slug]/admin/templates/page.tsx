'use client'

import { useState } from 'react'
import { Container, Typography, Box, Button, Paper, Divider, FormControl, InputLabel, Select, MenuItem, ToggleButton } from '@mui/material'
import { SaveOutlined, RestoreOutlined, VerticalSplit } from '@mui/icons-material'
import DOMPurify from 'dompurify'
import Editor from '@monaco-editor/react'

type TemplateSection = 'header' | 'footer' | 'sidebar' | 'layout'

const DEFAULT_TEMPLATES: Record<TemplateSection, string> = {
  header: '<header>\n  <nav>\n    <div class="brand"><a href="/">PyraCMS</a></div>\n    <ul class="nav-links">\n      <li><a href="/articles">Articles</a></li>\n      <li><a href="/forum">Forum</a></li>\n      <li><a href="/snippets">Snippets</a></li>\n    </ul>\n  </nav>\n</header>',
  footer: '<footer>\n  <div class="footer-content">\n    <p>Powered by PyraCMS</p>\n    <nav>\n      <a href="/about">About</a>\n      <a href="/contact">Contact</a>\n      <a href="/privacy">Privacy</a>\n    </nav>\n  </div>\n</footer>',
  sidebar: '<aside>\n  <div class="widget">\n    <h3>Recent Articles</h3>\n    <ul>\n      <li><a href="#">Getting Started</a></li>\n      <li><a href="#">Configuration Guide</a></li>\n    </ul>\n  </div>\n  <div class="widget">\n    <h3>Categories</h3>\n    <ul>\n      <li><a href="#">Tutorials</a></li>\n      <li><a href="#">News</a></li>\n    </ul>\n  </div>\n</aside>',
  layout: '<div class="site-layout">\n  <div class="main-content">\n    <main>\n      <!-- Page content renders here -->\n    </main>\n  </div>\n</div>',
}

export default function TemplateEditorPage() {
  const [section, setSection] = useState<TemplateSection>('header')
  const [templates, setTemplates] = useState<Record<TemplateSection, string>>(DEFAULT_TEMPLATES)
  const [showPreview, setShowPreview] = useState(true)

  const handleSave = () => { console.log('Saving templates:', templates) }
  const handleReset = () => { setTemplates(DEFAULT_TEMPLATES) }

  const sanitizedPreview = DOMPurify.sanitize(templates[section])

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>Template Editor</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Edit the HTML templates for your site sections.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Template Section</InputLabel>
          <Select value={section} label="Template Section" onChange={(e) => setSection(e.target.value as TemplateSection)}>
            <MenuItem value="header">Header</MenuItem>
            <MenuItem value="footer">Footer</MenuItem>
            <MenuItem value="sidebar">Sidebar</MenuItem>
            <MenuItem value="layout">Main Layout</MenuItem>
          </Select>
        </FormControl>
        <ToggleButton value="preview" selected={showPreview} onChange={() => setShowPreview(!showPreview)} size="small">
          <VerticalSplit sx={{ mr: 0.5, fontSize: 18 }} />Preview
        </ToggleButton>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RestoreOutlined />} onClick={handleReset}>Reset</Button>
          <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave}>Save</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, minHeight: 500 }}>
        <Box sx={{ flex: 1, minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
          <Editor
            height="500px"
            language="html"
            value={templates[section]}
            onChange={(v) => setTemplates((prev) => ({ ...prev, [section]: v ?? '' }))}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, wordWrap: 'on', fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }}
          />
        </Box>
        {showPreview && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%', overflow: 'auto', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Live Preview - {section}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
                sx={{ fontFamily: 'sans-serif', '& a': { color: 'primary.main' }, '& ul': { pl: 2 }, '& h3': { mt: 2, mb: 1 } }}
              />
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  )
}
