'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main role="alert" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again.</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}
