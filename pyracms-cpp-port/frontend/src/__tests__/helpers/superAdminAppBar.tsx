import React from 'react'
import SuperAdminAppBar from
  '@/components/super-admin/SuperAdminAppBar'
import { renderPlain } from './plainStore'

/** Render inside a Redux Provider with a fresh test store. */
export function renderAppBar(
  isMobile: boolean,
  onMenuClick: jest.Mock,
) {
  return renderPlain(
    <SuperAdminAppBar
      isMobile={isMobile}
      onMenuClick={onMenuClick}
    />,
  )
}
