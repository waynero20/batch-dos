import type { NextConfig } from 'next'

const config: NextConfig = {
  // The service-account key must never be bundled for the browser; every Sheets
  // call goes through a server action.
  serverExternalPackages: ['google-auth-library'],
}

export default config
