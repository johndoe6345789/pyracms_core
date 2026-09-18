'use client'

import { Box } from '@mui/material'
import { OutputHeader } from './OutputHeader'
import { OutputLoading } from './OutputLoading'
import { OutputPane } from './OutputPane'

interface CodeOutputProps {
  stdout?: string | undefined
  stderr?: string | undefined
  exitCode?: number | null | undefined
  executionTime?: number | null | undefined
  isLoading?: boolean | undefined
}

export function CodeOutput({
  stdout, stderr, exitCode, executionTime, isLoading,
}: CodeOutputProps) {
  if (isLoading) return <OutputLoading />
  if (!(stdout || stderr) && exitCode === undefined) return null

  return (
    <Box
      sx={{
        borderRadius: 1, overflow: 'hidden',
        border: 1, borderColor: 'divider',
      }}
      data-testid="code-output"
      role="region"
      aria-label="Code output"
    >
      <OutputHeader exitCode={exitCode} executionTime={executionTime} />
      {stdout && <OutputPane text={stdout} testId="code-output-stdout" />}
      {stderr && (
        <OutputPane text={stderr} testId="code-output-stderr" error />
      )}
    </Box>
  )
}
