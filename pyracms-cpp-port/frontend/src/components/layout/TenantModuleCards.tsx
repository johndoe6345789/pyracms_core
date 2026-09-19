'use client'

import { Grid } from '@mui/material'
import ModuleCard from './ModuleCard'
import { MODULES, ADMIN_MODULE } from './moduleData'

interface TenantModuleCardsProps {
  slug: string
  canAdmin?: boolean
}

export default function TenantModuleCards({
  slug,
  canAdmin = false,
}: TenantModuleCardsProps) {
  const modules = canAdmin ? [...MODULES, ADMIN_MODULE] : MODULES
  return (
    <Grid container spacing={3} data-testid="module-cards">
      {modules.map((mod) => (
        <Grid item xs={12} sm={6} md={4} key={mod.key}>
          <ModuleCard mod={mod} slug={slug} />
        </Grid>
      ))}
    </Grid>
  )
}
