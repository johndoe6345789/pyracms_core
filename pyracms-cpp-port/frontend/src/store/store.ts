import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import { api } from './api'

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [api.reducerPath]: api.reducer,
})

// redux-persist needs localStorage which is only available client-side.
// During SSR we use a noop storage so the store can still be created.
const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null)
  },
  setItem(_key: string, _value: string) {
    return Promise.resolve()
  },
  removeItem(_key: string) {
    return Promise.resolve()
  },
})

const storage =
  typeof window !== 'undefined'
    ? require('redux-persist/lib/storage').default
    : createNoopStorage()

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware),
  })

  const persistor = persistStore(store)
  return { store, persistor }
}

// Create a singleton for client-side usage
let storeInstance: ReturnType<typeof makeStore> | undefined

export const getStoreInstance = () => {
  if (!storeInstance) {
    storeInstance = makeStore()
  }
  return storeInstance
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof makeStore>['store']
export type AppDispatch = AppStore['dispatch']
