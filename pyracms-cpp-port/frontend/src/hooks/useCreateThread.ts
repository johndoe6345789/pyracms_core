'use client'

import { useState } from 'react'

export function useCreateThread() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')

  return { title, setTitle, description, setDescription, content, setContent }
}
