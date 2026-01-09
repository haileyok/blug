import {ATP_AGENT} from './agent.js'
import {getCachedPosts, setCachedPosts} from '../redis/redis.js'
import {LeafletDocument} from 'src/types.js'

export const getPosts = async (
  cursor: string | undefined,
  skipCache?: boolean,
) => {
  const cachedRes = await getCachedPosts()
  if (!skipCache && cachedRes) {
    return cachedRes
  }

  const repo = process.env.ATP_IDENTIFIER!
  const res = await ATP_AGENT.com.atproto.repo.listRecords({
    collection: 'pub.leaflet.document',
    repo,
    cursor,
  })

  if (!res.success) {
    throw new Error('Failed to get posts.')
  }

  const posts = res.data.records.map(data => {
    const post = data.value as LeafletDocument
    const uriPts = data.uri.split('/')
    post.rkey = uriPts[uriPts.length - 1]
    return post
  })

  await setCachedPosts(posts)

  return posts
}
