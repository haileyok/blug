import {ATP_AGENT} from './agent.js'
import {getCachedPublication, setCachedPublication} from '../redis/redis.js'
import {Publication} from 'src/types.js'

/**
 * The rkey convention for a site's singleton publication record. Most
 * standard.site implementations (Leaflet, Offprint, pckt.blog) use "self".
 */
const DEFAULT_PUBLICATION_RKEY = 'self'

/**
 * Fetch the blog's `site.standard.publication` record from the PDS.
 *
 * Tries the conventional `self` rkey first, then falls back to the first
 * record in the collection in case the publication was created with a
 * different rkey.
 */
export const getPublication = async () => {
  const repo = process.env.ATP_DID
  if (!repo) {
    throw new Error('ATP_DID is not configured')
  }
  const configuredRkey =
    process.env.ATP_PUBLICATION_RKEY || DEFAULT_PUBLICATION_RKEY

  // Scope the cache key by repo + rkey so a stale entry from a prior
  // configuration can never be served as authoritative for this one.
  const cacheKey = `publication:${repo}:${configuredRkey}`
  const cachedPublication = await getCachedPublication(cacheKey)
  if (cachedPublication) {
    return cachedPublication
  }

  // Try the conventional rkey first.
  try {
    const res = await ATP_AGENT.com.atproto.repo.getRecord({
      collection: 'site.standard.publication',
      repo,
      rkey: process.env.ATP_PUBLICATION_RKEY || DEFAULT_PUBLICATION_RKEY,
    })
    if (res.success) {
      const publication = res.data.value as Publication
      // Attach the rkey on the happy path too (the well-known route and any
      // future consumer reads it); the fallback path below already does this.
      publication.rkey = configuredRkey
      await setCachedPublication(cacheKey, publication)
      return publication
    }
  } catch {
    // fall through to listing the collection
  }

  // Fall back to listing the collection. This is discovery for the
  // unconfigured case: with no ATP_PUBLICATION_RKEY, the first record wins.
  // When an explicit rkey IS configured, a transient getRecord failure must
  // not silently substitute an unrelated record — accept only the configured
  // one and throw otherwise. listRecords is cursor-paginated, so follow the
  // cursor until the record is found or the collection is exhausted.
  const explicitRkey = process.env.ATP_PUBLICATION_RKEY
  let first: {uri: string; cid: string; value: unknown} | undefined
  let cursor: string | undefined
  do {
    const res = await ATP_AGENT.com.atproto.repo.listRecords({
      collection: 'site.standard.publication',
      repo,
      cursor,
    })
    if (!res.success) {
      throw new Error('Failed to get publication record.')
    }

    const records = res.data.records
    const match = explicitRkey
      ? records.find(r => r.uri.endsWith('/' + explicitRkey))
      : records[0]
    if (match) {
      first = match as {uri: string; cid: string; value: unknown}
      break
    }
    cursor = res.data.cursor || undefined
  } while (cursor)

  if (!first) {
    throw new Error(
      explicitRkey
        ? `No site.standard.publication record with rkey "${explicitRkey}" found in ${repo}'s repo.`
        : 'No site.standard.publication record found. Create one on your PDS (rkey "self" is the convention) so this blog can verify against standard.site.',
    )
  }

  const publication = first.value as Publication
  publication.rkey = first.uri.split('/').pop()!
  await setCachedPublication(cacheKey, publication)
  return publication
}
