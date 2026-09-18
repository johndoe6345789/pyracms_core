import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
} from '@mui/material'
import { AclRule } from '@/hooks/useAclEditor'
import AclRuleRow from './AclRuleRow'

interface AclRuleTableProps {
  rules: AclRule[]
  onDelete: (id: number) => void
}

const HEADS = ['Action', 'Principal', 'Permission']

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
      <Table aria-label="ACL rules">
        <TableHead>
          <TableRow>
            {HEADS.map((h) => (
              <TableCell
                key={h}
                scope="col"
                sx={{ fontWeight: 700 }}
              >
                {h}
              </TableCell>
            ))}
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
            <AclRuleRow
              key={rule.id}
              rule={rule}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
