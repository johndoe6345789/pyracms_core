'use client'

import { Typography, Box } from '@mui/material'
import { RocketLaunchOutlined } from '@mui/icons-material'

const fade = (dir: number) => ({
  from: { opacity: 0, transform: `translateY(${dir}px)` },
  to: { opacity: 1, transform: 'translateY(0)' },
})

/** Rocket icon, headline and tagline of the portal hero. */
export default function HeroContent() {
  return (
    <>
      <Box
        sx={{
          mb: 3,
          animation: 'fadeInDown 1s ease-out',
          '@keyframes fadeInDown': fade(-20),
        }}
      >
        <RocketLaunchOutlined
          sx={{ fontSize: 64, color: 'white', opacity: 0.9 }}
        />
      </Box>
      <Typography
        variant="h1"
        component="h1"
        gutterBottom
        sx={{
          color: 'white',
          textShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 1s ease-out 0.2s both',
          '@keyframes fadeInUp': fade(20),
        }}
      >
        Welcome to PyraCMS
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          color: 'rgba(255,255,255,0.95)',
          maxWidth: 600,
          mb: 4,
          fontWeight: 400,
          animation: 'fadeInUp 1s ease-out 0.4s both',
        }}
      >
        Choose a site to explore, or create your own.
        <Typography
          component="span"
          sx={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.8)',
            mt: 1,
            display: 'block',
          }}
        >
          Multi-tenant CMS powered by C++ and React
        </Typography>
      </Typography>
    </>
  )
}
