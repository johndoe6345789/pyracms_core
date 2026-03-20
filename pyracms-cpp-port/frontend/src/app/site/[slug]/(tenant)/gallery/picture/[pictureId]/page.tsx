'use client'

import {
  useParams,
  useRouter,
} from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Divider,
} from '@mui/material'
import Link from 'next/link'
import {
  ArrowBackOutlined,
  NavigateNextOutlined,
} from '@mui/icons-material'
import PictureViewer
  from '@/components/gallery/PictureViewer'
import PictureActions
  from '@/components/gallery/PictureActions'
import VoteButtons
  from '@/components/common/VoteButtons'
import TagChips
  from '@/components/common/TagChips'
import {
  useGalleryPicture,
} from '@/hooks/useGalleryPicture'

export default function PictureViewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const pictureId =
    params.pictureId as string
  const {
    picture,
    handleLike,
    handleDislike,
    handleSetCover,
    handleDelete,
  } = useGalleryPicture(pictureId)

  if (!picture) return null

  const albumUrl =
    `/site/${slug}/gallery/${picture.albumId}`

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="picture-view-page"
    >
      <Breadcrumbs
        separator={
          <NavigateNextOutlined
            fontSize="small"
          />
        }
        sx={{ mb: 3 }}
        aria-label="Picture breadcrumb"
        data-testid="picture-breadcrumbs"
      >
        <Link
          href={`/site/${slug}/gallery`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Gallery
        </Link>
        <Link
          href={albumUrl}
          style={{
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          {picture.albumName}
        </Link>
        <Typography color="text.primary">
          {picture.title}
        </Typography>
      </Breadcrumbs>

      <Button
        component={Link}
        href={albumUrl}
        startIcon={<ArrowBackOutlined />}
        sx={{ mb: 3, color: 'text.secondary' }}
        data-testid="back-to-album-btn"
        aria-label="Back to album"
      >
        Back to album
      </Button>

      <PictureViewer
        src={picture.src}
        title={picture.title}
        isVideo={picture.isVideo}
      />

      <Typography
        variant="h3"
        component="h1"
        gutterBottom
      >
        {picture.title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        {picture.description}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TagChips tags={picture.tags} />
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <VoteButtons
          likes={picture.likes}
          dislikes={picture.dislikes}
          onLike={handleLike}
          onDislike={handleDislike}
        />
        <PictureActions
          onSetCover={() =>
            handleSetCover?.()
              .catch(() => {})
          }
          onDelete={() =>
            handleDelete?.()
              .then(() =>
                router.push(albumUrl)
              )
              .catch(() => {})
          }
        />
      </Box>
    </Container>
  )
}
