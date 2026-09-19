import type { ApiBuilder } from '../apiBase'
import type { User, ChangePasswordRequest } from '@/types'

export const userEndpoints = (builder: ApiBuilder) => ({
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
  changePassword: builder.mutation<
    void, { id: number; data: ChangePasswordRequest }
  >({
    query: ({ id, data }) => ({
      url: `/users/${id}/password`,
      method: 'PUT',
      body: data,
    }),
  }),
})
