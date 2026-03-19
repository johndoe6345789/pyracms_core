'use client'

import { Grid, Typography, Box } from '@mui/material'
import {
  DnsOutlined, PeopleOutlined,
  AddCircleOutline, TuneOutlined,
} from '@mui/icons-material'
import SuperAdminQuickCard from './SuperAdminQuickCard'

const QUICK_LINKS = [
  {
    label: 'Manage Tenants',
    description: 'Create, view and delete sites',
    icon: <DnsOutlined sx={{ fontSize: 32 }} />,
    href: '/super-admin/tenants',
    testId: 'quick-tenants',
  },
  {
    label: 'Global Users',
    description: 'Manage users and assign roles',
    icon: <PeopleOutlined sx={{ fontSize: 32 }} />,
    href: '/super-admin/users',
    testId: 'quick-users',
  },
  {
    label: 'Platform Settings',
    description: 'Configure global PyraCMS settings',
    icon: <TuneOutlined sx={{ fontSize: 32 }} />,
    href: '/super-admin/settings',
    testId: 'quick-settings',
  },
  {
    label: 'Create New Site',
    description: 'Launch the site creation wizard',
    icon: <AddCircleOutline sx={{ fontSize: 32 }} />,
    href: '/create-site',
    testId: 'quick-create-site',
  },
]

export default function SuperAdminDashboard() {
  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
        data-testid="super-admin-dashboard-title"
      >
        Platform Overview
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Manage all PyraCMS tenants, users, and
        platform-wide settings from here.
      </Typography>
      <Grid container spacing={3}>
        {QUICK_LINKS.map((link) => (
          <Grid item xs={12} sm={6} key={link.href}>
            <SuperAdminQuickCard {...link} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
