'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

/** Username of a channel's owner; '' until known or when hidden. */
export function useChannelName(userId: number) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (!userId) return
    let live = true
    api
      .get(`/api/users/${userId}`)
      .then((r) => live && setName(String(r.data?.username ?? '')))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [userId])

  return name
}
