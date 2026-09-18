import {
  Box, Button, Card, CardContent, TextField, Typography,
} from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import AclActionSelect from './AclActionSelect'

type Act = 'Allow' | 'Deny'

interface AddAclRuleFormProps {
  newAction: Act
  newPrincipal: string
  newPermission: string
  onActionChange: (val: Act) => void
  onPrincipalChange: (val: string) => void
  onPermissionChange: (val: string) => void
  onAdd: () => void
}

export default function AddAclRuleForm(
  p: AddAclRuleFormProps,
) {
  return (
    <Card
      variant="outlined"
      sx={{ borderColor: 'divider', mb: 4 }}
      data-testid="add-acl-rule-form"
    >
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add New Rule
        </Typography>
        <Box sx={{
          display: 'flex', gap: 2,
          alignItems: 'flex-start', flexWrap: 'wrap',
        }}>
          <AclActionSelect
            value={p.newAction}
            onChange={p.onActionChange}
          />
          <TextField
            label="Principal"
            size="small"
            value={p.newPrincipal}
            onChange={(e) =>
              p.onPrincipalChange(e.target.value)}
            placeholder="e.g. admin, editor"
            sx={{ minWidth: 200 }}
            data-testid="acl-principal-input"
          />
          <TextField
            label="Permission"
            size="small"
            value={p.newPermission}
            onChange={(e) =>
              p.onPermissionChange(e.target.value)}
            placeholder="e.g. manage_users"
            sx={{ minWidth: 200 }}
            data-testid="acl-permission-input"
          />
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={p.onAdd}
            disabled={
              !p.newPrincipal.trim() ||
              !p.newPermission.trim()
            }
            data-testid="add-acl-rule-btn"
          >
            Add Rule
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
