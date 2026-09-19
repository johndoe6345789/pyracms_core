'use client'

import { useRef } from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { MentionAutocomplete } from './MentionAutocomplete'
import { insertMention } from './mentionInsert'

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'inputRef'> & {
  value: string
  onValue: (v: string) => void
}

/** A TextField that suggests users when typing "@name". */
export function MentionTextField({ value, onValue, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const pick = (username: string) => {
    const caret = ref.current?.selectionStart ?? value.length
    onValue(insertMention(value, caret, username))
  }
  return (
    <>
      <TextField
        {...rest}
        value={value}
        inputRef={ref}
        onChange={(e) => onValue(e.target.value)}
      />
      <MentionAutocomplete inputRef={ref} onSelect={pick} />
    </>
  )
}
