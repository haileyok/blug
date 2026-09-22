import {DataFunctionArgs} from '@remix-run/node'
import {getPublication} from 'src/atproto'

/**
 * standard.site publication verification endpoint.
 *
 * https://standard.site/docs/verification — the domain of a
 * site.standard.publication record must serve this route, returning the
 * AT-URI of the publication record as text/plain:
 *
 *   at://did:plc:abc123/site.standard.publication/rkey
 *
 * The [.] prefix escapes the leading dot so flat routes match
 * /.well-known/site.standard.publication.
 */
export const loader = async (_args: DataFunctionArgs) => {
  const did = process.env.ATP_DID
  if (!did) {
    throw new Response('ATP_DID is not configured', {status: 500})
  }

  // Resolve the actual publication rkey from the PDS (cached in Redis). Most
  // sites use the "self" rkey convention; fall back to it (or an explicit
  // ATP_PUBLICATION_RKEY) if the PDS can't be reached, so verification
  // checkers always get a well-formed answer.
  let rkey = process.env.ATP_PUBLICATION_RKEY || 'self'
  try {
    const publication = await getPublication()
    if (publication.rkey) {
      rkey = publication.rkey
    }
  } catch {
    // keep the fallback rkey
  }

  // Return the bare AT-URI with no trailing newline — verifiers compare this
  // string against the publication record's URI.
  return new Response(`at://${did}/site.standard.publication/${rkey}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
