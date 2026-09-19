import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './apiBase'
import { authEndpoints } from './endpoints/auth'
import { userEndpoints } from './endpoints/users'
import { tenantEndpoints } from './endpoints/tenants'

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [...tagTypes],
  endpoints: (builder) => ({
    ...authEndpoints(builder),
    ...userEndpoints(builder),
    ...tenantEndpoints(builder),
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
