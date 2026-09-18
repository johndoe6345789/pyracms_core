import { redirect } from 'next/navigation'

export default async function CodeAlbumRedirectPage({
  params,
}: {
  params: Promise<{ slug: string; albumId: string }>
}) {
  const { slug } = await params
  redirect(`/site/${slug}/snippets`)
}
