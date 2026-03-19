import { useState } from 'react'
import type { Revision } from './useGameDepDetail'

export interface EditorState {
  displayName: string
  setDisplayName: (v: string) => void
  description: string
  setDescription: (v: string) => void
  tags: string[]
  tagInput: string
  setTagInput: (v: string) => void
  handleAddTag: () => void
  handleDeleteTag: (tag: string) => void
  selectedOs: string
  setSelectedOs: (v: string) => void
  selectedArch: string
  setSelectedArch: (v: string) => void
  revisions: Revision[]
}

export function useGameDepEditor(
  initialName: string,
  initialDescription: string,
  initialTags: string[],
  initialRevisions: Revision[]
): EditorState {
  const [displayName, setDisplayName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState(initialTags)
  const [selectedOs, setSelectedOs] = useState('Windows')
  const [selectedArch, setSelectedArch] = useState('x64')

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((t) => t !== tagToDelete))
  }

  return {
    displayName,
    setDisplayName,
    description,
    setDescription,
    tags,
    tagInput,
    setTagInput,
    handleAddTag,
    handleDeleteTag,
    selectedOs,
    setSelectedOs,
    selectedArch,
    setSelectedArch,
    revisions: initialRevisions,
  }
}
