import { Box } from '@mui/material'

interface HtmlPreviewContentProps {
  /** Must be pre-sanitized with DOMPurify */
  sanitizedHtml: string
  sx?: Record<string, unknown>
}

/**
 * Renders pre-sanitized HTML content.
 * Callers MUST sanitize with DOMPurify before passing.
 */
export function HtmlPreviewContent({
  sanitizedHtml,
  sx,
}: HtmlPreviewContentProps) {
  return (
    <Box
      data-testid="preview-content"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      {...(sx ? { sx } : {})}
    />
  )
}
