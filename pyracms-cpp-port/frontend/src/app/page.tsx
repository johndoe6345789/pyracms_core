import { Container, Typography, Box, Button } from '@mui/material'
import Link from 'next/link'
import { RocketLaunchOutlined, DashboardOutlined } from '@mui/icons-material'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-250px',
          right: '-250px',
          animation: 'float 20s infinite ease-in-out',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-50px, 50px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '-200px',
          left: '-200px',
          animation: 'float 15s infinite ease-in-out reverse',
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            py: 8,
          }}
        >
          {/* Logo/Icon */}
          <Box
            sx={{
              mb: 4,
              animation: 'fadeInDown 1s ease-out',
              '@keyframes fadeInDown': {
                from: {
                  opacity: 0,
                  transform: 'translateY(-20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <RocketLaunchOutlined
              sx={{ fontSize: 80, color: 'white', opacity: 0.9 }}
            />
          </Box>

          {/* Main heading */}
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              animation: 'fadeInUp 1s ease-out 0.2s both',
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Welcome to PyraCMS
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: '700px',
              mb: 6,
              fontWeight: 400,
              animation: 'fadeInUp 1s ease-out 0.4s both',
            }}
          >
            Modern CMS with C++ Backend and React Frontend
            <br />
            <Typography
              component="span"
              sx={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                mt: 2,
                display: 'block',
              }}
            >
              Extensible, Modular, and Lightning Fast
            </Typography>
          </Typography>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
              animation: 'fadeInUp 1s ease-out 0.6s both',
            }}
          >
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/auth/login"
              startIcon={<DashboardOutlined />}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                px: 4,
                py: 2,
                fontSize: '1.125rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/auth/register"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 2,
                fontSize: '1.125rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                },
              }}
            >
              Learn More
            </Button>
          </Box>

          {/* Feature highlights */}
          <Box
            sx={{
              mt: 12,
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              justifyContent: 'center',
              animation: 'fadeInUp 1s ease-out 0.8s both',
            }}
          >
            {[
              { title: 'Modular', desc: 'Plugin architecture' },
              { title: 'Fast', desc: 'C++ backend' },
              { title: 'Modern', desc: 'React & TypeScript' },
            ].map((feature, i) => (
              <Box
                key={i}
                sx={{
                  textAlign: 'center',
                  color: 'white',
                  px: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                >
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
