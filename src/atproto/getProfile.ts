import {BSKY_AGENT} from './agent.js'
import {getCachedProfile, setCachedProfile} from '../redis/redis.js'

export const getProfile = async () => {
  const did = process.env.ATP_DID!

  const cachedProfile = await getCachedProfile()
  if (cachedProfile) {
    return cachedProfile
  }

  const res = await BSKY_AGENT.getProfile({
    actor: did,
  })

  if (!res.success) {
    throw new Error('Failed to get profile.')
  }

  await setCachedProfile(res.data)
  return res.data
}
