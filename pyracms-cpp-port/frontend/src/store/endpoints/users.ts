import type { ApiBuilder } from '../apiBase'
import type { User, ChangePasswordRequest } from '@/types'
import { adoptFreshToken, type PasswordChangeReply } from './freshToken'
import type { RootState } from '../store'

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
    PasswordChangeReply, { id: number; data: ChangePasswordRequest }
  >({
    query: ({ id, data }) => ({
      url: `/users/${id}/password`,
      method: 'PUT',
      body: data,
    }),
    async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
      try {
        const { data } = await queryFulfilled
        const { user } = (getState() as RootState).auth
        adoptFreshToken(data, user, dispatch)
      } catch {
        // a failed change leaves the session as it was
      }
    },
  }),
})
