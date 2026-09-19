import type { ApiBuilder } from '../apiBase'
import type {
  User, LoginRequest, RegisterRequest, AuthResponse,
} from '@/types'

export const authEndpoints = (builder: ApiBuilder) => ({
  login: builder.mutation<AuthResponse, LoginRequest>({
    query: (credentials) => ({
      url: '/auth/login',
      method: 'POST',
      body: credentials,
    }),
    invalidatesTags: ['Me'],
  }),
  register: builder.mutation<AuthResponse, RegisterRequest>({
    query: (data) => ({
      url: '/auth/register',
      method: 'POST',
      body: data,
    }),
  }),
  getMe: builder.query<User, void>({
    query: () => '/auth/me',
    providesTags: ['Me'],
  }),
})
