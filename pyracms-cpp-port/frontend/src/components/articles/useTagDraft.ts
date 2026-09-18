import { useMemo, useState } from 'react'

export function normaliseTag(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function tagsToInput(tags: string[]) {
  return tags.join(', ')
}

export function useTagDraft(
  tags: string[],
  setTagsInput: (v: string) => void
) {
  const [draftTag, setDraftTag] = useState('')
  const tagSet = useMemo(
    () => new Set(tags.map((t) => t.toLowerCase())),
    [tags]
  )

  const addTag = (rawValue = draftTag) => {
    const nextTag = normaliseTag(rawValue)
    if (nextTag && !tagSet.has(nextTag.toLowerCase())) {
      setTagsInput(tagsToInput([...tags, nextTag]))
    }
    setDraftTag('')
  }

  const addTags = (rawTags: string[]) => {
    const nextTags = [...tags]
    const seen = new Set(tagSet)
    rawTags.forEach((raw) => {
      const tag = normaliseTag(raw)
      const key = tag.toLowerCase()
      if (!tag || seen.has(key)) return
      nextTags.push(tag)
      seen.add(key)
    })
    setTagsInput(tagsToInput(nextTags))
  }

  const removeTag = (tagToRemove: string) => {
    setTagsInput(
      tagsToInput(tags.filter((t) => t !== tagToRemove))
    )
  }

  const handleDraftChange = (value: string) => {
    if (value.includes(',')) {
      const pieces = value.split(',')
      addTags(pieces.slice(0, -1))
      setDraftTag(pieces[pieces.length - 1] ?? '')
      return
    }
    setDraftTag(value)
  }

  const handleKeyDown = (
    e: { key: string; preventDefault: () => void }
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !draftTag) {
      const last = tags[tags.length - 1]
      if (last) removeTag(last)
    }
  }

  return {
    draftTag,
    addTag,
    removeTag,
    handleDraftChange,
    handleKeyDown,
  }
}
