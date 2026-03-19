import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { FlashMessage } from '@/types'

interface UiState {
  darkMode: boolean
  flashMessages: FlashMessage[]
}

const initialState: UiState = {
  darkMode: false,
  flashMessages: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
    },
    addFlashMessage(state, action: PayloadAction<Omit<FlashMessage, 'id' | 'timestamp'>>) {
      state.flashMessages.push({
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      })
    },
    removeFlashMessage(state, action: PayloadAction<string>) {
      state.flashMessages = state.flashMessages.filter(
        (msg) => msg.id !== action.payload
      )
    },
  },
})

export const { toggleDarkMode, addFlashMessage, removeFlashMessage } = uiSlice.actions
export default uiSlice.reducer
