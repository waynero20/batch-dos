import { redirect } from 'next/navigation'
import { BallotForm } from '@/components/ballot-form'
import { isMember } from '@/lib/roster'
import { votingOpen } from '@/lib/config'

export default async function VotePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>
}) {
  const { name } = await searchParams

  // A hand-typed or stale URL goes back to the picker rather than into a ballot
  // that the server action would only reject at the very end.
  if (!name || !isMember(name)) redirect('/')

  return <BallotForm name={name} open={votingOpen()} />
}
