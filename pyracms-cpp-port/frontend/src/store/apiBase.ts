import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { EndpointBuilder } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

export const tagTypes = ['User', 'Tenant', 'Me'] as const

export type ApiBuilder = EndpointBuilder<
  typeof baseQuery,
  (typeof tagTypes)[number],
  'api'
>
