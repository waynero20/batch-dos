import { Flow } from '@/components/flow/flow'
import { IntroGate } from '@/components/intro/intro-gate'
import { votingOpen } from '@/lib/config'
import { ROSTER, isMember } from '@/lib/roster'
import { hasVoted, readVotes } from '@/lib/sheets'

// The roster is static, but who has voted is not.
export const revalidate = 30

async function votedNames(): Promise<string[]> {
  try {
    return (await readVotes({ revalidate: 30 })).filter(hasVoted).map((v) => v.name)
  } catch (err) {
    // A spreadsheet hiccup must not take the ballot down — the flow still works,
    // it just cannot show who has already voted.
    console.error('[page] could not read votes', err)
    return []
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>
}) {
  const [{ name }, voted] = await Promise.all([searchParams, votedNames()])

  return (
    <IntroGate>
      <Flow
        roster={ROSTER}
        voted={voted}
        open={votingOpen()}
        initialName={name && isMember(name) ? name : undefined}
      />
    </IntroGate>
  )
}
