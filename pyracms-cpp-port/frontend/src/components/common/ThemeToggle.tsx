'use client'

import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { DarkModeOutlined, LightModeOutlined, SettingsBrightnessOutlined } from '@mui/icons-material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setColorMode, type ColorMode } from '@/store/slices/uiSlice'
import type { RootState } from '@/store/store'

const modes: { value: ColorMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <LightModeOutlined /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeOutlined /> },
  { value: 'system', label: 'System', icon: <SettingsBrightnessOutlined /> },
]

export default function ThemeToggle() {
  const dispatch = useDispatch()
  const colorMode = useSelector((state: RootState) => state.ui.colorMode)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const currentIcon = modes.find((m) => m.value === colorMode)?.icon || <SettingsBrightnessOutlined />

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.primary' }}>
        {currentIcon}
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {modes.map((mode) => (
          <MenuItem
            key={mode.value}
            selected={colorMode === mode.value}
            onClick={() => { dispatch(setColorMode(mode.value)); setAnchorEl(null) }}
          >
            <ListItemIcon>{mode.icon}</ListItemIcon>
            <ListItemText>{mode.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
