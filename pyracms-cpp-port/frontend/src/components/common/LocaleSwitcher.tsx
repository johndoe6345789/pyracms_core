'use client'

import { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemText } from '@mui/material'
import { LanguageOutlined } from '@mui/icons-material'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { locales, localeNames, type Locale } from '@/i18n/config'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.primary' }}>
        <LanguageOutlined />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {locales.map((loc) => (
          <MenuItem
            key={loc}
            selected={locale === loc}
            onClick={() => handleLocaleChange(loc)}
          >
            <ListItemText>{localeNames[loc]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
