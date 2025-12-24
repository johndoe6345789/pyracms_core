# Frontend README

A modern Next.js frontend for PyraCMS with React, TypeScript, and Material UI.

## Technologies

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Material UI 5**: Component library
- **Axios**: HTTP client
- **SWR**: Data fetching
- **Jest**: Testing framework

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home page
│   │   ├── auth/        # Authentication pages
│   │   └── dashboard/   # Dashboard pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions
│   │   ├── api.ts       # API client
│   │   └── theme.ts     # Material UI theme
│   ├── types/           # TypeScript type definitions
│   └── __tests__/       # Test files
├── public/              # Static files
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
```

## Features

### Authentication
- Login page with form validation
- Registration page
- JWT token management
- Protected routes

### UI Components
- Material UI components
- Responsive design
- Dark/light mode support (theme)
- Loading states
- Error handling

## API Integration

The frontend uses Axios with interceptors for:
- Adding authentication tokens
- Handling expired sessions
- Error handling

See `src/lib/api.ts` for the API client configuration.

## Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Use TypeScript and Material UI components
4. Add tests in `src/__tests__/`

Example:
```tsx
// src/app/my-page/page.tsx
'use client'

import { Container, Typography } from '@mui/material'

export default function MyPage() {
  return (
    <Container>
      <Typography variant="h3">My Page</Typography>
    </Container>
  )
}
```

## Styling

The project uses Material UI for styling. The theme is configured in `src/lib/theme.ts`.

To customize the theme:
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
  },
})
```

## Best Practices

- Use TypeScript for type safety
- Follow React hooks best practices
- Use Material UI components consistently
- Write tests for new features
- Use `'use client'` directive for client components
- Keep components small and focused
- Use proper error handling
- Implement loading states

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t pyracms-frontend .
docker run -p 3000:3000 pyracms-frontend
```

### Static Export

For static hosting:
```bash
# Update next.config.js
output: 'export'

# Build
npm run build
```

## Contributing

Please follow the existing code style and add tests for new features.
