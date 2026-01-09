import Redis from 'ioredis'
import {AppBskyActorDefs} from '@atproto/api'
import {LeafletDocument} from '../types'

export const REDIS_CLIENT = new Redis({
  port: 6379,
  host: '127.0.0.1',
})

export const getCachedPosts = async () => {
  const res = await REDIS_CLIENT.get('posts')
  if (!res) {
    return null
  }
  return JSON.parse(res) as LeafletDocument[]
}

export const setCachedPosts = async (posts: LeafletDocument[]) => {
  await REDIS_CLIENT.set('posts', JSON.stringify(posts), 'EX', 60)
}

export const getCachedPost = async (rkey: string) => {
  const res = await REDIS_CLIENT.get(rkey)
  if (!res) {
    return null
  }
  return JSON.parse(res) as LeafletDocument
}

export const setCachedPost = async (rkey: string, post: LeafletDocument) => {
  await REDIS_CLIENT.set(rkey, JSON.stringify(post), 'EX', 60 * 10)
}

export const getCachedProfile = async () => {
  const res = await REDIS_CLIENT.get('profile')
  if (!res) {
    return null
  }
  return JSON.parse(res) as AppBskyActorDefs.ProfileViewDetailed
}

export const setCachedProfile = async (
  profile: AppBskyActorDefs.ProfileViewDetailed,
) => {
  await REDIS_CLIENT.set('profile', JSON.stringify(profile), 'EX', 60 * 10)
}
