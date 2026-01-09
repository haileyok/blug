import {AtpAgent, BskyAgent} from '@atproto/api'

const ATP_SERVICE = process.env.ATP_SERVICE!

export const ATP_AGENT = new AtpAgent({
  service: ATP_SERVICE,
})

export const BSKY_AGENT = new BskyAgent({
  service: 'https://public.api.bsky.app/',
})
