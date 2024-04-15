import Redis from 'ioredis'
import {AppBskyActorDefs} from '@atproto/api'
import {WhtwndBlogEntryView} from '../types'

export const redisClient = new Redis({
  port: 6379,
  host: '127.0.0.1',
})

export const getCachedPosts = async () => {
  const res = await redisClient.get('posts')
  if (!res) {
    return null
  }
  return JSON.parse(res) as WhtwndBlogEntryView[]
}

export const setCachedPosts = async (posts: WhtwndBlogEntryView[]) => {
  await redisClient.set('posts', JSON.stringify(posts), 'EX', 60)
}

export const getCachedPost = async (rkey: string) => {
  const res = await redisClient.get(rkey)
  if (!res) {
    return null
  }
  return JSON.parse(res) as WhtwndBlogEntryView
}

export const setCachedPost = async (post: WhtwndBlogEntryView) => {
  await redisClient.set(post.rkey, JSON.stringify(post), 'EX', 60 * 10)
}

export const getCachedProfile = async () => {
  const res = await redisClient.get('profile')
  if (!res) {
    return null
  }
  return JSON.parse(res) as AppBskyActorDefs.ProfileViewDetailed
}

export const setCachedProfile = async (
  profile: AppBskyActorDefs.ProfileViewDetailed,
) => {
  await redisClient.set('profile', JSON.stringify(profile), 'EX', 60 * 10)
}
