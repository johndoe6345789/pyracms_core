import type { ApiBuilder } from '../apiBase'
import type { Tenant, CreateTenantRequest } from '@/types'

export const tenantEndpoints = (builder: ApiBuilder) => ({
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
})
