import { Box, Button, Divider } from '@mui/material'
import Link from 'next/link'

export interface FooterAction {
  label: string
  href: string
  icon: React.ReactNode
}

/** Secondary action pinned to the bottom of the drawer. */
export default function DrawerFooter({
  footer,
  onClose,
}: {
  footer: FooterAction
  onClose: () => void
}) {
  return (
    <>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          component={Link}
          href={footer.href}
          onClick={onClose}
          fullWidth
          variant="outlined"
          startIcon={footer.icon}
          data-testid="drawer-portal"
        >
          {footer.label}
        </Button>
      </Box>
    </>
  )
}
