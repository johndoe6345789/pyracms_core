import { Card, CardContent, Skeleton } from '@mui/material'

/** Loading placeholder for a site card. */
export default function SkeletonCard() {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: 'divider' }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton
          variant="rectangular"
          width={80}
          height={24}
          sx={{ mt: 2, borderRadius: 1 }}
        />
      </CardContent>
    </Card>
  )
}
