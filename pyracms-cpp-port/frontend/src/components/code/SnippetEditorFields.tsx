'use client'

import { TextField } from '@mui/material'
import { ArticleTagEditor } from '@/components/articles/ArticleTagEditor'
import { CodeEditor } from './CodeEditor'
import { SnippetSummaryField } from './SnippetSummaryField'
import type { SnippetEditor } from '@/hooks/useSnippetEditor'

/** Title, code, tags and (for a saved snippet) the change note. */
export function SnippetEditorFields({ editor: e }: { editor: SnippetEditor }) {
  return (
    <>
      <TextField
        label="Title"
        value={e.title}
        onChange={(ev) => e.setTitle(ev.target.value)}
        fullWidth
        placeholder="Enter a title for your snippet..."
        data-testid="snippet-title-input"
      />
      <CodeEditor
        value={e.code}
        onChange={e.setCode}
        language={e.language}
        onLanguageChange={e.setLanguage}
      />
      <ArticleTagEditor
        tagsInput={e.tagsInput}
        setTagsInput={e.setTagsInput}
        tags={e.tags}
      />
      {e.savedId && <SnippetSummaryField editor={e} />}
    </>
  )
}
