import { screen, fireEvent } from '@testing-library/react'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'
import { ForumAdminDialog } from '@/components/forum/ForumAdminDialog'
import { useForumAdmin } from '@/hooks/useForumAdmin'

export const refresh = jest.fn()
const cat = {
  id: '1', name: 'Gen',
  forums: [{
    id: '2', name: 'Chat', description: 'talk', threads: 0, posts: 0,
  }],
}
export function Harness() {
  const admin = useForumAdmin(7, refresh)
  return (
    <>
      <CategoryAccordion category={cat} slug="s" admin={admin} />
      <ForumAdminDialog s={admin} />
    </>
  )
}
export const click = (id: string) => fireEvent.click(screen.getByTestId(id))
export const type = (id: string, v: string) => fireEvent.change(
  screen.getByTestId(id), { target: { value: v } })
