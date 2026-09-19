import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      role="main"
      style={{ padding: '4rem 1rem', textAlign: 'center' }}
    >
      <h1>404 - Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link href="/">Back to the home page</Link>
    </main>
  )
}
