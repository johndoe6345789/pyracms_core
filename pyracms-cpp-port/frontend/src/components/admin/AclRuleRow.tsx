import {
  TableCell, TableRow, IconButton, Tooltip, Chip,
} from '@mui/material'
import { DeleteOutlined } from '@mui/icons-material'
import { AclRule } from '@/hooks/useAclEditor'

interface AclRuleRowProps {
  rule: AclRule
  onDelete: (id: number) => void
}

export default function AclRuleRow({
  rule,
  onDelete,
}: AclRuleRowProps) {
  const allow = rule.action === 'Allow'
  return (
    <TableRow hover data-testid={`acl-row-${rule.id}`}>
      <TableCell>
        <Chip
          label={rule.action}
          size="small"
          color={allow ? 'success' : 'error'}
          variant="outlined"
        />
      </TableCell>
      <TableCell sx={{ fontWeight: 600 }}>
        {rule.principal}
      </TableCell>
      <TableCell sx={{ fontFamily: 'monospace' }}>
        {rule.permission}
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(rule.id)}
            aria-label={`Delete rule for ${rule.principal}`}
            data-testid={`delete-acl-${rule.id}`}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
