import React from 'react'

export const dashboardMock = {
  __esModule: true,
  default: function MockSuperAdminDashboard() {
    return (
      <div data-testid="mock-super-admin-dashboard">
        <h1>Platform Overview</h1>
      </div>
    )
  },
}

export const tenantTableMock = {
  __esModule: true,
  default: function MockTenantManagementTable() {
    return <div data-testid="mock-tenant-management-table" />
  },
}

export const usersTableMock = {
  __esModule: true,
  default: function MockGlobalUsersTable() {
    return <div data-testid="mock-global-users-table" />
  },
}
