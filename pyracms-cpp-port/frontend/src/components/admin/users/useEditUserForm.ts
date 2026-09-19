import { useEffect, useState } from 'react'
import type { UserRow } from '@/hooks/admin/userRow'

export function useEditUserForm(user: UserRow | null) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(1)

  useEffect(() => {
    setFullName(user?.fullName ?? '')
    setEmail(user?.email ?? '')
    setRole(user?.role ?? 1)
  }, [user])

  return { fullName, setFullName, email, setEmail, role, setRole }
}
