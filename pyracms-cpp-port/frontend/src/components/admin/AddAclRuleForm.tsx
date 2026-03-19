import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  AddCircleOutline,
} from '@mui/icons-material'

interface AddAclRuleFormProps {
  newAction: 'Allow' | 'Deny'
  newPrincipal: string
  newPermission: string
  onActionChange: (
    val: 'Allow' | 'Deny',
  ) => void
  onPrincipalChange: (
    val: string,
  ) => void
  onPermissionChange: (
    val: string,
  ) => void
  onAdd: () => void
}

export default function AddAclRuleForm({
  newAction,
  newPrincipal,
  newPermission,
  onActionChange,
  onPrincipalChange,
  onPermissionChange,
  onAdd,
}: AddAclRuleFormProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'divider',
        mb: 4,
      }}
      data-testid="add-acl-rule-form"
    >
      <CardContent>
        <Typography
          variant="h5"
          sx={{ mb: 2 }}
        >
          Add New Rule
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          <FormControl
            size="small"
            sx={{ minWidth: 120 }}
          >
            <InputLabel>
              Action
            </InputLabel>
            <Select
              value={newAction}
              label="Action"
              onChange={(e) =>
                onActionChange(
                  e.target.value as
                    'Allow' | 'Deny',
                )
              }
              data-testid={
                'acl-action-select'
              }
            >
              <MenuItem value="Allow">
                Allow
              </MenuItem>
              <MenuItem value="Deny">
                Deny
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Principal"
            size="small"
            value={newPrincipal}
            onChange={(e) =>
              onPrincipalChange(
                e.target.value,
              )
            }
            placeholder={
              'e.g. admin, editor'
            }
            sx={{ minWidth: 200 }}
            data-testid={
              'acl-principal-input'
            }
          />
          <TextField
            label="Permission"
            size="small"
            value={newPermission}
            onChange={(e) =>
              onPermissionChange(
                e.target.value,
              )
            }
            placeholder={
              'e.g. manage_users'
            }
            sx={{ minWidth: 200 }}
            data-testid={
              'acl-permission-input'
            }
          />
          <Button
            variant="contained"
            startIcon={
              <AddCircleOutline />
            }
            onClick={onAdd}
            disabled={
              !newPrincipal.trim() ||
              !newPermission.trim()
            }
            data-testid={
              'add-acl-rule-btn'
            }
          >
            Add Rule
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
