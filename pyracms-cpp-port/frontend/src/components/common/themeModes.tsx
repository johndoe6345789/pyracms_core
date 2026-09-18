import {
  DarkModeOutlined,
  LightModeOutlined,
  SettingsBrightnessOutlined,
} from '@mui/icons-material'
import type { ColorMode } from '@/store/slices/uiSlice'

export const modes: {
  value: ColorMode
  label: string
  icon: React.ReactNode
}[] = [
  { value: 'light', label: 'Light', icon: <LightModeOutlined /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeOutlined /> },
  { value: 'system', label: 'System', icon: <SettingsBrightnessOutlined /> },
]
