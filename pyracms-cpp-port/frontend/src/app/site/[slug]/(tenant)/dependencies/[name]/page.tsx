'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import { NavigateNextOutlined } from '@mui/icons-material'
import GameDepDetail from '@/components/gamedep/GameDepDetail'
import RevisionTable from '@/components/gamedep/RevisionTable'
import BinaryMatrix from '@/components/gamedep/BinaryMatrix'
import DependencyList from '@/components/gamedep/DependencyList'
import ScreenshotGrid from '@/components/gamedep/ScreenshotGrid'
import TabPanel from '@/components/common/TabPanel'
import {
  useGameDepDetail, type GameDepDetailData,
} from '@/hooks/useGameDepDetail'
import { useGameDepItem } from '@/hooks/useGameDepItem'
import ItemGate from '@/components/gamedep/ItemGate'

export default function DependencyDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { item, loading } = useGameDepItem('dep', name)
  return (
    <ItemGate loading={loading} found={!!item}>
      {item && <DepView slug={slug} name={name} data={item} />}
    </ItemGate>
  )
}

function DepView(
  { slug, name, data }: { slug: string; name: string; data: GameDepDetailData },
) {
  const { detail, tabIndex, setTabIndex } = useGameDepDetail(data)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Breadcrumbs sx={{ mb: 3 }}
        separator={<NavigateNextOutlined fontSize="small" />}>
        <Link href={`/site/${slug}/dependencies`}
          style={{ color: 'inherit', textDecoration: 'none' }}>
          Dependencies
        </Link>
        <Typography color="text.primary">
          {detail.displayName}
        </Typography>
      </Breadcrumbs>

      <GameDepDetail
        detail={detail}
        editHref={`/site/${slug}/dependencies/${name}/edit`}
        tabIndex={tabIndex}
        onTabChange={setTabIndex}
      >
        <TabPanel value={tabIndex} index={0}>
          <RevisionTable revisions={detail.revisions} />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <BinaryMatrix binaries={detail.binaries} />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <DependencyList dependencies={detail.dependencies}
            slug={slug} />
        </TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <ScreenshotGrid screenshots={detail.screenshots} />
        </TabPanel>
      </GameDepDetail>
    </Container>
  )
}
