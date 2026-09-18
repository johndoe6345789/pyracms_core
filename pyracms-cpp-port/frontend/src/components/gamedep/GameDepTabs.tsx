import { Box, Tabs, Tab } from '@mui/material'

interface GameDepTabsProps {
  tabIndex: number
  onTabChange: (index: number) => void
}

export default function GameDepTabs({
  tabIndex, onTabChange,
}: GameDepTabsProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={tabIndex}
        onChange={(_, v) => onTabChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        data-testid="detail-tabs">
        <Tab label="Revisions" data-testid="tab-revisions" />
        <Tab label="Binaries" data-testid="tab-binaries" />
        <Tab label="Dependencies" data-testid="tab-dependencies" />
        <Tab label="Screenshots" data-testid="tab-screenshots" />
      </Tabs>
    </Box>
  )
}
