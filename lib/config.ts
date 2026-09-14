/** Flip VOTING_OPEN to "false" to make every ballot route read-only without a code change. */
export const votingOpen = (): boolean => process.env.VOTING_OPEN !== 'false'
