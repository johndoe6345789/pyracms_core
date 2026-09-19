import { Box, Typography, Paper, Chip, Button } from '@mui/material'
import Link from 'next/link'
import BinaryMatrix from '@/components/gamedep/BinaryMatrix'
import TagChips from '@/components/common/TagChips'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'

export default function GameInfo({
  detail,
  slug,
}: {
  detail: GameDepDetailData
  slug: string
}) {
  const latest = detail.revisions.find((r) => r.published)
  return (
    <Box sx={{ display: 'grid', gap: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`${detail.views.toLocaleString()} views`} />
        <Chip label={`Added ${detail.created || 'unknown'}`} />
        <Chip label={`Latest ${latest ? 'v' + latest.version : 'n/a'}`} />
        <Chip label={`${detail.revisions.length} revisions`} />
      </Box>
      <Typography variant="body1">
        {detail.description || 'No description yet.'}
      </Typography>
      <TagChips tags={detail.tags} />
      <Section title="Platforms">
        {detail.binaries.length === 0 ? (
          <Typography color="text.secondary">
            Per-platform builds are not listed here; the desktop client selects
            the right build for your system.
          </Typography>
        ) : (
          <BinaryMatrix binaries={detail.binaries} />
        )}
      </Section>
      <Section title="Dependencies">
        {detail.dependencies.length === 0 ? (
          <Typography color="text.secondary">None listed.</Typography>
        ) : (
          detail.dependencies.map((d) => (
            <Button
              key={d.name}
              component={Link}
              href={`/site/${slug}/dependencies/${d.name}`}
            >
              {d.displayName} {d.version}
            </Button>
          ))
        )}
      </Section>
      {detail.screenshots.length > 0 && (
        <Section title="Screenshots">
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              pb: 1,
            }}
          >
            {detail.screenshots.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.id}
                src={s.src}
                alt={s.title}
                height={180}
                style={{ borderRadius: 4, scrollSnapAlign: 'start' }}
              />
            ))}
          </Box>
        </Section>
      )}
    </Box>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  )
}
