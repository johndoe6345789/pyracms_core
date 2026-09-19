import type { ApiBuilder } from '../apiBase'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types'

export const authEndpoints = (builder: ApiBuilder) => ({
  login: builder.mutation<AuthResponse, LoginRequest>({
    query: (credentials) => ({
      url: '/api/auth/login',
      method: 'POST',
      body: credentials,
    }),
    invalidatesTags: ['Me'],
  }),
  register: builder.mutation<AuthResponse, RegisterRequest>({
    query: (data) => ({
      url: '/api/auth/register',
      method: 'POST',
      body: data,
    }),
  }),
  getMe: builder.query<User, void>({
    query: () => '/api/auth/me',
    providesTags: ['Me'],
  }),
})
