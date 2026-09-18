import { Box } from '@mui/material'

const floatKeyframes = {
  '@keyframes float': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(-50px, 50px)' },
  },
}

/** Two soft floating circles behind the hero content. */
export default function HeroBackdrop() {
  return (
    <>
      <Box
        sx={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
          top: -250, right: -250,
          animation: 'float 20s infinite ease-in-out',
          ...floatKeyframes,
        }}
      />
      <Box
        sx={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          bottom: -200, left: -200,
          animation: 'float 15s infinite ease-in-out reverse',
        }}
      />
    </>
  )
}
