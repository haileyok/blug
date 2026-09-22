import {AtpAgent, BskyAgent} from '@atproto/api'

const ATP_SERVICE = process.env.ATP_SERVICE!

export const ATP_AGENT = new AtpAgent({
  service: ATP_SERVICE,
})

// The public AppView is used to fetch the author's Bluesky profile (avatar,
// display name). Override with BSKY_APPVIEW_URL if you run your own AppView
// or want to mock it in tests.
export const BSKY_AGENT = new BskyAgent({
  service: process.env.BSKY_APPVIEW_URL || 'https://public.api.bsky.app/',
})
