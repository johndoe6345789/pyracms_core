'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  IconButton, Menu, MenuItem, ListItemText, Typography,
} from '@mui/material'
import { TranslateOutlined } from '@mui/icons-material'
import { LANGUAGES } from './languages'
import { LOCALE_COOKIE } from '@/i18n/config'

const YEAR = 60 * 60 * 24 * 365

/** Sets the locale cookie and re-renders the server tree in that language. */
export default function LanguageSelect() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const locale = useLocale()
  const t = useTranslations('common')
  const router = useRouter()

  const handleChange = (code: string) => {
    document.cookie =
      `${LOCALE_COOKIE}=${code}; path=/; max-age=${YEAR}; samesite=lax`
    setAnchorEl(null)
    router.refresh()
  }

  const current = LANGUAGES.find((l) => l.code === locale)

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: 'text.primary' }}
        size="small"
        aria-label={`${t('language')}: ${current?.name || 'English'}`}
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
        aria-label={t('language')}
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
