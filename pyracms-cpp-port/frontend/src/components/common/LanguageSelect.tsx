'use client'

import { useState } from 'react'
import {
  IconButton, Menu, MenuItem,
  ListItemText, Typography,
} from '@mui/material'
import {
  TranslateOutlined,
} from '@mui/icons-material'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Espanol', flag: 'ES' },
  { code: 'fr', name: 'Francais', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'ja', name: '\u65E5\u672C\u8A9E', flag: 'JA' },
  { code: 'zh', name: '\u4E2D\u6587', flag: 'ZH' },
  { code: 'nl', name: 'Nederlands', flag: 'NL' },
  { code: 'cy', name: 'Cymraeg', flag: 'CY' },
]

export default function LanguageSelect() {
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null)
  const [locale, setLocale] = useState(
    () => {
      if (typeof window !== 'undefined') {
        return (
          localStorage.getItem('locale')
          || 'en'
        )
      }
      return 'en'
    },
  )

  const handleChange = (code: string) => {
    setLocale(code)
    localStorage.setItem('locale', code)
    setAnchorEl(null)
  }

  const current = LANGUAGES.find(
    (l) => l.code === locale,
  )

  return (
    <>
      <IconButton
        onClick={(e) =>
          setAnchorEl(e.currentTarget)
        }
        sx={{ color: 'text.primary' }}
        size="small"
        aria-label={
          `Change language, current: ${
            current?.name || 'English'
          }`
        }
        aria-haspopup="true"
        aria-expanded={
          Boolean(anchorEl)
        }
        data-testid="language-select"
      >
        <TranslateOutlined
          fontSize="small"
        />
        <Typography
          variant="caption"
          sx={{
            ml: 0.5,
            fontWeight: 600,
            fontSize: '0.65rem',
          }}
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
            selected={
              locale === lang.code
            }
            onClick={() =>
              handleChange(lang.code)
            }
            dense
            data-testid={
              `lang-${lang.code}`
            }
          >
            <ListItemText>
              {lang.name}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
