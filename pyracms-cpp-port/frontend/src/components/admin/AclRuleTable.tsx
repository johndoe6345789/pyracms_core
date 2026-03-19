import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  DeleteOutlined,
} from '@mui/icons-material'
import {
  AclRule,
} from '@/hooks/useAclEditor'

interface AclRuleTableProps {
  rules: AclRule[]
  onDelete: (id: number) => void
}

export default function AclRuleTable({
  rules,
  onDelete,
}: AclRuleTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid="acl-rule-table"
    >
      <Table
        aria-label="ACL rules"
      >
        <TableHead>
          <TableRow>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
            >
              Action
            </TableCell>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
            >
              Principal
            </TableCell>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
            >
              Permission
            </TableCell>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
              align="right"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rules.map((rule) => (
            <TableRow
              key={rule.id}
              hover
              data-testid={
                `acl-row-${rule.id}`
              }
            >
              <TableCell>
                <Chip
                  label={rule.action}
                  size="small"
                  color={
                    rule.action ===
                    'Allow'
                      ? 'success'
                      : 'error'
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
              >
                {rule.principal}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily:
                    'monospace',
                }}
              >
                {rule.permission}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      onDelete(rule.id)
                    }
                    aria-label={
                      `Delete rule ` +
                      `for ` +
                      rule.principal
                    }
                    data-testid={
                      `delete-acl-` +
                      `${rule.id}`
                    }
                  >
                    <DeleteOutlined
                      fontSize="small"
                    />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
