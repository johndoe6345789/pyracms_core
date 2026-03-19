import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ColorMode = 'light' | 'dark' | 'system'

interface FlashMessage {
  id: string
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
  timestamp: number
}

interface UiState {
  colorMode: ColorMode
  flashMessages: FlashMessage[]
  sidebarCollapsed: boolean
  notificationBellOpen: boolean
}

const initialState: UiState = {
  colorMode: 'system',
  flashMessages: [],
  sidebarCollapsed: false,
  notificationBellOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setColorMode: (state, action: PayloadAction<ColorMode>) => {
      state.colorMode = action.payload
    },
    addFlashMessage: (state, action: PayloadAction<Omit<FlashMessage, 'id' | 'timestamp'>>) => {
      state.flashMessages.push({
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      })
    },
    removeFlashMessage: (state, action: PayloadAction<string>) => {
      state.flashMessages = state.flashMessages.filter((m) => m.id !== action.payload)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setNotificationBellOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationBellOpen = action.payload
    },
  },
})

export const { setColorMode, addFlashMessage, removeFlashMessage, toggleSidebar, setNotificationBellOpen } = uiSlice.actions
export default uiSlice.reducer
export type { ColorMode, FlashMessage, UiState }
