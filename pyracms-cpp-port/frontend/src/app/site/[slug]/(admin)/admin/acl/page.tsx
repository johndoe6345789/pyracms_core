'use client'

import { Typography, Box } from '@mui/material'
import { useAclEditor } from '@/hooks/useAclEditor'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'
import AddAclRuleForm from '@/components/admin/AddAclRuleForm'
import AclRuleTable from '@/components/admin/AclRuleTable'

export default function AdminAclPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const {
    rules, newAction, setNewAction,
    newPrincipal, setNewPrincipal,
    newPermission, setNewPermission,
    handleAdd, handleDelete,
  } = useAclEditor(tenantId)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>ACL Editor</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage access control list rules for the platform.
      </Typography>
      <AddAclRuleForm
        newAction={newAction} newPrincipal={newPrincipal} newPermission={newPermission}
        onActionChange={setNewAction} onPrincipalChange={setNewPrincipal}
        onPermissionChange={setNewPermission} onAdd={handleAdd}
      />
      <AclRuleTable rules={rules} onDelete={handleDelete} />
    </Box>
  )
}
