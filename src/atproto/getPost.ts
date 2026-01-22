import {ATP_AGENT} from './agent.js'
import {getCachedPost, setCachedPost} from '../redis/redis'
import {LeafletDocument} from 'src/types.js'

export const getPost = async (rkey: string, skipCache?: boolean) => {
  const cachedRes = await getCachedPost(rkey)
  if (!skipCache && cachedRes) {
    return cachedRes
  }

  const repo = process.env.ATP_DID!

  const res = await ATP_AGENT.com.atproto.repo.getRecord({
    collection: 'site.standard.document',
    repo,
    rkey,
  })

  if (!res.success) {
    throw new Error('Failed to get post.')
  }

  const post = res.data.value as LeafletDocument

  await setCachedPost(rkey, post)

  // set the rkey in the post
  post.rkey = rkey

  return post
}
