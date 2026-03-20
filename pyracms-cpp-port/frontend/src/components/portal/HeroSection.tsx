'use client'

import { Container, Typography, Box } from '@mui/material'
import { RocketLaunchOutlined } from '@mui/icons-material'
import CreateSiteButton from './CreateSiteButton'

const floatKeyframes = {
  '@keyframes float': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(-50px, 50px)' },
  },
}

export default function HeroSection() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 12 },
      }}
    >
      <Box
        sx={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', top: -250, right: -250,
          animation: 'float 20s infinite ease-in-out', ...floatKeyframes,
        }}
      />
      <Box
        sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', bottom: -200, left: -200,
          animation: 'float 15s infinite ease-in-out reverse',
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Box sx={{ mb: 3, animation: 'fadeInDown 1s ease-out',
            '@keyframes fadeInDown': {
              from: { opacity: 0, transform: 'translateY(-20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <RocketLaunchOutlined sx={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
          </Box>
          <Typography variant="h1" component="h1" gutterBottom sx={{
            color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.2)',
            animation: 'fadeInUp 1s ease-out 0.2s both',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            Welcome to PyraCMS
          </Typography>
          <Typography variant="h5" component="h2" sx={{
            color: 'rgba(255,255,255,0.95)', maxWidth: 600, mb: 4, fontWeight: 400,
            animation: 'fadeInUp 1s ease-out 0.4s both',
          }}>
            Choose a site to explore, or create your own.
            <Typography component="span" sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
              Multi-tenant CMS powered by C++ and React
            </Typography>
          </Typography>
          <CreateSiteButton />
        </Box>
      </Container>
    </Box>
  )
}
