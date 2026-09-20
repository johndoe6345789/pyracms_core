'use client'

import { Grid } from '@mui/material'
import ModuleCard from './ModuleCard'
import { MODULES, ADMIN_MODULE } from './moduleData'
import { MODULE_FEATURE } from './navFeatures'
import { useSiteFeatures } from '@/hooks/useSiteFeatures'

interface TenantModuleCardsProps {
  slug: string
  canAdmin?: boolean
}

export default function TenantModuleCards({
  slug,
  canAdmin = false,
}: TenantModuleCardsProps) {
  const { isOn } = useSiteFeatures(slug)
  const shown = MODULES.filter((m) => isOn(MODULE_FEATURE[m.key]))
  const modules = canAdmin ? [...shown, ADMIN_MODULE] : shown
  return (
    <Grid container spacing={3} sx={{ mb: 5 }} data-testid="module-cards">
      {modules.map((mod) => (
        <Grid item xs={12} sm={6} md={4} key={mod.key}>
          <ModuleCard mod={mod} slug={slug} />
        </Grid>
      ))}
    </Grid>
  )
}
