'use client'

import {
  IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText,
} from '@mui/material'
import {
  DarkModeOutlined,
  LightModeOutlined,
  SettingsBrightnessOutlined,
} from '@mui/icons-material'
import { useState } from 'react'
import {
  useDispatch, useSelector,
} from 'react-redux'
import {
  setColorMode, type ColorMode,
} from '@/store/slices/uiSlice'
import type { RootState } from '@/store/store'

const modes: {
  value: ColorMode
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <LightModeOutlined />,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <DarkModeOutlined />,
  },
  {
    value: 'system',
    label: 'System',
    icon: <SettingsBrightnessOutlined />,
  },
]

export default function ThemeToggle() {
  const dispatch = useDispatch()
  const colorMode = useSelector(
    (state: RootState) =>
      state.ui.colorMode,
  )
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null)

  const currentMode = modes.find(
    (m) => m.value === colorMode,
  )
  const currentIcon =
    currentMode?.icon
    || <SettingsBrightnessOutlined />

  return (
    <>
      <IconButton
        onClick={(e) =>
          setAnchorEl(e.currentTarget)
        }
        sx={{ color: 'text.primary' }}
        aria-label={
          `Toggle theme, current: ${
            currentMode?.label || 'System'
          }`
        }
        aria-haspopup="true"
        aria-expanded={
          Boolean(anchorEl)
        }
        data-testid="theme-toggle"
      >
        {currentIcon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        aria-label="Theme selection"
        data-testid="theme-menu"
      >
        {modes.map((mode) => (
          <MenuItem
            key={mode.value}
            selected={
              colorMode === mode.value
            }
            onClick={() => {
              dispatch(
                setColorMode(mode.value),
              )
              setAnchorEl(null)
            }}
            data-testid={
              `theme-${mode.value}`
            }
          >
            <ListItemIcon>
              {mode.icon}
            </ListItemIcon>
            <ListItemText>
              {mode.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
