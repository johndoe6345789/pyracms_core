'use client'

import { useState } from 'react'
import {
  useParams,
  useRouter,
} from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
} from '@mui/material'
import {
  SaveOutlined,
  PlayArrowOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import {
  CodeEditor,
} from '@/components/code/CodeEditor'
import {
  CodeOutput,
} from '@/components/code/CodeOutput'
import {
  BackButton,
} from '@/components/common/BackButton'
import { useTenantId } from '@/hooks/useTenantId'
import api from '@/lib/api'

export default function NewSnippetPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] =
    useState('python')
  const [isRunning, setIsRunning] =
    useState(false)
  const [output, setOutput] = useState<{
    stdout?: string
    stderr?: string
    exitCode?: number
    executionTime?: number
  } | null>(null)

  const handleRun = () => {
    setIsRunning(true)
    setOutput(null)
    api.post('/api/snippets', {
      title: title || 'Untitled',
      code,
      language,
      tenant_id: tenantId,
    })
      .then(res => {
        const id = res.data.id
        return api.post(
          `/api/snippets/${id}/run`,
        )
      })
      .then(res => {
        setOutput({
          stdout:
            res.data.output
            || res.data.stdout
            || '',
          stderr:
            res.data.stderr || '',
          exitCode:
            res.data.exitCode ?? 0,
          executionTime:
            res.data.executionTime,
        })
      })
      .catch(() => {
        setOutput({
          stderr:
            'Failed to run snippet',
          exitCode: 1,
        })
      })
      .finally(() => setIsRunning(false))
  }

  const handleSave = () => {
    if (!tenantId) return
    api.post('/api/snippets', {
      title,
      code,
      language,
      tenant_id: tenantId,
    })
      .then(res => {
        const dest =
          `/site/${slug}/snippets/`
          + `${res.data.id}`
        router.push(dest)
      })
      .catch(() => {})
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="new-snippet-page"
    >
      <Box sx={{ mb: 2 }}>
        <BackButton
          href={
            `/site/${slug}/snippets`
          }
          label="Back to Snippets"
        />
      </Box>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
      >
        New Code Snippet
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <TextField
          label="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          fullWidth
          placeholder={
            'Enter a title for your '
            + 'snippet...'
          }
          data-testid="snippet-title-input"
        />

        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          onLanguageChange={setLanguage}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="success"
            startIcon={
              <PlayArrowOutlined />
            }
            onClick={handleRun}
            disabled={
              !code || isRunning
            }
            data-testid="run-btn"
            aria-label="Run snippet"
          >
            {isRunning
              ? 'Running...'
              : 'Run'}
          </Button>
          <Button
            variant="contained"
            startIcon={
              <SaveOutlined />
            }
            onClick={handleSave}
            disabled={
              !title || !code
            }
            data-testid="save-btn"
            aria-label="Save snippet"
          >
            Save Snippet
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href={
              `/site/${slug}/snippets`
            }
            data-testid="cancel-btn"
          >
            Cancel
          </Button>
        </Box>

        {(isRunning || output) && (
          <>
            <Divider />
            <CodeOutput
              stdout={
                output?.stdout
              }
              stderr={
                output?.stderr
              }
              exitCode={
                output?.exitCode
                ?? undefined
              }
              executionTime={
                output?.executionTime
                ?? undefined
              }
              isLoading={isRunning}
            />
          </>
        )}
      </Box>
    </Container>
  )
}
