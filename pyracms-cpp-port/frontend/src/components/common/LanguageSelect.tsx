'use client'

import { useState } from 'react'
import {
  IconButton, Menu, MenuItem, ListItemText, Typography,
} from '@mui/material'
import { TranslateOutlined } from '@mui/icons-material'
import { LANGUAGES } from './languages'

const initialLocale = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('locale') || 'en'
    : 'en'

export default function LanguageSelect() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [locale, setLocale] = useState(initialLocale)

  const handleChange = (code: string) => {
    setLocale(code)
    localStorage.setItem('locale', code)
    setAnchorEl(null)
  }

  const current = LANGUAGES.find((l) => l.code === locale)

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: 'text.primary' }}
        size="small"
        aria-label={`Change language, current: ${
          current?.name || 'English'
        }`}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        data-testid="language-select"
      >
        <TranslateOutlined fontSize="small" />
        <Typography
          variant="caption"
          sx={{ ml: 0.5, fontWeight: 600, fontSize: '0.65rem' }}
          aria-hidden="true"
        >
          {current?.flag}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        aria-label="Language selection"
        data-testid="language-menu"
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={locale === lang.code}
            onClick={() => handleChange(lang.code)}
            dense
            data-testid={`lang-${lang.code}`}
          >
            <ListItemText>{lang.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
