'use client'

import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { useSiteFeatures } from '@/hooks/useSiteFeatures'
import type { FeatureId } from '@/lib/siteFeatures'
import FeatureOff from './FeatureOff'

/** Renders its children only while the site has `feature` switched on. */
export default function FeatureGuard({
  feature,
  name,
  children,
}: {
  feature: FeatureId
  name: string
  children: ReactNode
}) {
  const slug = useParams().slug as string
  const { loading, isOn } = useSiteFeatures(slug)
  if (loading) return null
  if (!isOn(feature)) return <FeatureOff slug={slug} name={name} />
  return <>{children}</>
}
