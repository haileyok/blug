import {atpAgent} from './agent.js'
import {whtwndBlogEntryRecordToView} from './dataToView'
import {WhtwndBlogEntryRecord, WhtwndBlogEntryView} from '../types'
import {getCachedPosts, setCachedPost, setCachedPosts} from '../redis/redis.js'

export const getPosts = async (
  cursor: string | undefined,
  skipCache?: boolean,
) => {
  const cachedRes = await getCachedPosts()
  if (!skipCache && cachedRes) {
    return cachedRes
  }

  const repo = process.env.ATP_IDENTIFIER!
  const res = await atpAgent.com.atproto.repo.listRecords({
    collection: 'com.whtwnd.blog.entry',
    repo,
    cursor,
  })

  if (!res.success) {
    throw new Error('Failed to get posts.')
  }

  const posts = res.data.records.map(data =>
    whtwndBlogEntryRecordToView({
      uri: data.uri,
      cid: data.cid?.toString() ?? '',
      value: data.value as WhtwndBlogEntryRecord,
    }),
  ) as WhtwndBlogEntryView[]

  // Cache them individually too for good measure, why not {
  for (const post of posts) {
    setCachedPost(post)
  }

  await setCachedPosts(posts)
  return posts
}
