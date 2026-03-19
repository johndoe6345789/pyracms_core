'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Container, Typography, Box, TextField, Button, Divider } from '@mui/material'
import { SaveOutlined, PlayArrowOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { CodeEditor } from '@/components/code/CodeEditor'
import { CodeOutput } from '@/components/code/CodeOutput'
import { BackButton } from '@/components/common/BackButton'

export default function NewSnippetPage() {
  const params = useParams()
  const slug = params.slug as string
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<{ stdout?: string; stderr?: string; exitCode?: number; executionTime?: number } | null>(null)

  const handleRun = () => {
    setIsRunning(true)
    // Placeholder: simulate execution
    setTimeout(() => {
      setOutput({
        stdout: '# Output would appear here after execution\n# This is a placeholder for the actual code runner',
        exitCode: 0,
        executionTime: 142,
      })
      setIsRunning(false)
    }, 1500)
  }

  const handleSave = () => {
    // TODO: Wire up API call
    console.log('Saving snippet:', { title, code, language })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 2 }}><BackButton href={`/site/${slug}/snippets`} label="Back to Snippets" /></Box>
      <Typography variant="h3" component="h1" gutterBottom>New Code Snippet</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth placeholder="Enter a title for your snippet..." />

        <CodeEditor value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="success" startIcon={<PlayArrowOutlined />} onClick={handleRun} disabled={!code || isRunning}>
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} disabled={!title || !code}>
            Save Snippet
          </Button>
          <Button variant="outlined" component={Link} href={`/site/${slug}/snippets`}>Cancel</Button>
        </Box>

        {(isRunning || output) && (
          <>
            <Divider />
            <CodeOutput
              stdout={output?.stdout}
              stderr={output?.stderr}
              exitCode={output?.exitCode ?? undefined}
              executionTime={output?.executionTime ?? undefined}
              isLoading={isRunning}
            />
          </>
        )}
      </Box>
    </Container>
  )
}
