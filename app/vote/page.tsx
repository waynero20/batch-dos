import { redirect } from 'next/navigation'
import { isMember } from '@/lib/roster'

/**
 * The ballot lives at `/` now — identity is its first screen rather than a separate
 * page. This route stays only so the `/vote?name=` links already sent to the group
 * chat land in the right place instead of 404ing.
 */
export default async function VotePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>
}) {
  const { name } = await searchParams
  redirect(name && isMember(name) ? `/?name=${encodeURIComponent(name)}` : '/')
}
