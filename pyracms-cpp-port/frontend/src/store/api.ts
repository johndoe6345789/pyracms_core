import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Tenant,
  CreateTenantRequest,
  ChangePasswordRequest,
} from '@/types'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Tenant', 'Me'],
  endpoints: (builder) => ({
    // Auth endpoints
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

    // User endpoints
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'Me',
      ],
    }),
    changePassword: builder.mutation<void, { id: number; data: ChangePasswordRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}/password`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Tenant endpoints
    getTenants: builder.query<Tenant[], void>({
      query: () => '/tenants',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tenant' as const, id })),
              { type: 'Tenant', id: 'LIST' },
            ]
          : [{ type: 'Tenant', id: 'LIST' }],
    }),
    getTenantBySlug: builder.query<Tenant, string>({
      query: (slug) => `/tenants/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Tenant', id: slug }],
    }),
    createTenant: builder.mutation<Tenant, CreateTenantRequest>({
      query: (data) => ({
        url: '/tenants',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useGetTenantsQuery,
  useGetTenantBySlugQuery,
  useCreateTenantMutation,
} = api
