import { Box } from '@mui/material'
import {
  DragIndicatorOutlined,
  SubdirectoryArrowRightOutlined,
} from '@mui/icons-material'

interface Props {
  dragRef: (n: HTMLElement | null) => void
  nested: boolean
}

export default function DragHandle({ dragRef, nested }: Props) {
  return (
    <>
      <Box
        ref={dragRef}
        sx={{ cursor: 'grab', display: 'flex' }}
      >
        <DragIndicatorOutlined
          sx={{ color: 'text.secondary' }}
        />
      </Box>
      {nested && (
        <SubdirectoryArrowRightOutlined sx={{
          fontSize: 16,
          color: 'text.secondary',
        }} />
      )}
    </>
  )
}
