#!/usr/bin/env node
/**
 * Validate this blog as a standard.site publication.
 *
 * Usage:
 *   node --experimental-strip-types scripts/validate-standard-site.ts
 *   BASE_URL=https://your.blog npm run validate:standard-site
 *
 * Env:
 *   BASE_URL             Base URL of the running blog (default http://localhost:3000)
 *   ATP_SERVICE          PDS endpoint, e.g. https://pds.example.com
 *   ATP_IDENTIFIER       Handle / repo name on the PDS
 *   ATP_DID              DID of the repo
 *   ATP_PUBLICATION_RKEY Optional publication rkey (default: self)
 *
 * Checks, per https://standard.site/docs/verification and the
 * site.standard.document / site.standard.publication lexicons:
 *
 *  1. GET {BASE_URL}/.well-known/site.standard.publication returns 200
 *     text/plain with the publication AT-URI.
 *  2. The publication record exists on the PDS and its `url` matches the
 *     blog's BASE_URL origin (no trailing slash).
 *  3. Every site.standard.document record has required fields (site, title,
 *     publishedAt), and `site` points at the publication.
 *  4. GET {BASE_URL}/posts/{rkey} includes
 *     <link rel="site.standard.document" href="at://DID/.../{rkey}">.
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
)
const ATP_SERVICE = (process.env.ATP_SERVICE || '').replace(/\/+$/, '')
const ATP_IDENTIFIER = process.env.ATP_IDENTIFIER || ''
const ATP_DID = process.env.ATP_DID || ''
const PUBLICATION_RKEY = process.env.ATP_PUBLICATION_RKEY || 'self'

let failures = 0
let warnings = 0

function ok(msg: string) {
  console.log(`  ✓ ${msg}`)
}
function fail(msg: string) {
  failures++
  console.log(`  ✗ ${msg}`)
}
function warn(msg: string) {
  warnings++
  console.log(`  ⚠ ${msg}`)
}

function section(name: string) {
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 60 - name.length))}`)
}

/**
 * Fetch a listRecords endpoint, following cursors so every record in the
 * collection is returned (not just the first page).
 */
async function pdsList(path: string): Promise<any[]> {
  const records: any[] = []
  let cursor: string | undefined
  do {
    const separator = path.includes('?') ? '&' : '?'
    const url = `${ATP_SERVICE}/xrpc/${path}${separator}limit=100${
      cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
    }`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`PDS ${path} -> ${res.status}`)
    }
    const page = await res.json()
    records.push(...(page.records || []))
    cursor = page.cursor || undefined
  } while (cursor)
  return records
}

async function main() {
  if (!ATP_SERVICE || !ATP_IDENTIFIER || !ATP_DID) {
    console.error(
      'ATP_SERVICE, ATP_IDENTIFIER and ATP_DID must be set (see .env.example).',
    )
    process.exit(2)
  }

  const expectedPublicationUri = `at://${ATP_DID}/site.standard.publication/${PUBLICATION_RKEY}`

  // --- 1. well-known endpoint ---------------------------------------------
  section('1. /.well-known/site.standard.publication')
  let wellKnownUri: string | undefined
  try {
    const res = await fetch(
      `${BASE_URL}/.well-known/site.standard.publication`,
    )
    if (res.status === 200) {
      const text = (await res.text()).trim()
      const contentType = res.headers.get('content-type') || ''
      if (contentType.startsWith('text/plain')) {
        ok(`responds 200 text/plain`)
      } else {
        warn(`content-type is "${contentType}", expected text/plain`)
      }
      if (/^at:\/\/[^\s]+$/.test(text)) {
        ok(`returns an AT-URI: ${text}`)
        wellKnownUri = text
      } else {
        fail(`response is not a bare AT-URI: "${text}"`)
      }
      if (text === expectedPublicationUri) {
        ok(`matches expected publication AT-URI`)
      } else {
        warn(
          `differs from expected ${expectedPublicationUri} (fine if your publication rkey isn't "${PUBLICATION_RKEY}")`,
        )
      }
    } else {
      fail(`responds ${res.status}, expected 200`)
    }
  } catch (e: any) {
    fail(`could not reach ${BASE_URL}: ${e.message}`)
  }

  // --- 2. publication record ----------------------------------------------
  section('2. site.standard.publication record')
  let publication: any
  try {
    const records = await pdsList(
      `com.atproto.repo.listRecords?repo=${encodeURIComponent(
        ATP_IDENTIFIER,
      )}&collection=site.standard.publication`,
    )
    const byRkey = records.find(
      r => r.uri === expectedPublicationUri || r.uri.endsWith('/' + PUBLICATION_RKEY),
    )
    publication = byRkey ?? records[0]
    if (publication) {
      ok(`found publication record ${publication.uri}`)
      if (wellKnownUri && wellKnownUri !== publication.uri) {
        fail(
          `well-known AT-URI (${wellKnownUri}) does not match record URI (${publication.uri})`,
        )
      } else if (wellKnownUri) {
        ok(`well-known AT-URI matches the record URI`)
      }
      const value = publication.value || {}
      if (typeof value.url === 'string' && value.url.length > 0) {
        if (/\/+$/.test(value.url)) {
          warn(
            `publication url "${value.url}" has a trailing slash — standard.site recommends against it`,
          )
        }
        const trimmed = value.url.replace(/\/+$/, '')
        if (trimmed === BASE_URL) {
          ok(`publication url "${value.url}" matches BASE_URL`)
        } else {
          fail(
            `publication url "${value.url}" does not match BASE_URL "${BASE_URL}"`,
          )
        }
      } else {
        fail('publication record is missing required field "url"')
      }
      if (typeof value.name === 'string' && value.name.length > 0) {
        ok(`publication name "${value.name}"`)
      } else {
        fail('publication record is missing required field "name"')
      }
    } else {
      fail(
        `no site.standard.publication record found in ${ATP_IDENTIFIER}'s repo`,
      )
    }
  } catch (e: any) {
    fail(`could not read publication record from PDS: ${e.message}`)
  }

  // --- 3. document records -------------------------------------------------
  section('3. site.standard.document records')
  let docs: any[] = []
  try {
    docs = await pdsList(
      `com.atproto.repo.listRecords?repo=${encodeURIComponent(
        ATP_IDENTIFIER,
      )}&collection=site.standard.document`,
    )
    if (docs.length === 0) {
      fail('no site.standard.document records found')
    } else {
      ok(`${docs.length} document record(s)`)
    }
  } catch (e: any) {
    fail(`could not list documents from PDS: ${e.message}`)
  }

  const publicationUri = publication?.uri
  for (const doc of docs) {
    const rkey = doc.uri.split('/').pop()
    const v = doc.value || {}
    const problems: string[] = []
    if (!v.site) problems.push('missing required "site"')
    if (!v.title) problems.push('missing required "title"')
    if (!v.publishedAt) problems.push('missing required "publishedAt"')
    if (typeof v.title === 'string' && v.title.length > 5000)
      problems.push('title exceeds maxLength 5000')
    if (
      typeof v.description === 'string' &&
      v.description.length > 30000
    )
      problems.push('description exceeds maxLength 30000')
    if (publicationUri && v.site && v.site !== publicationUri) {
      problems.push(`site "${v.site}" != publication ${publicationUri}`)
    }
    if (v.path && !String(v.path).startsWith('/'))
      problems.push(`path "${v.path}" should start with a leading slash`)
    if (v.content && !v.content.$type)
      problems.push('content union entry is missing $type')
    if (problems.length === 0) {
      ok(`${rkey}: "${v.title}"`)
    } else {
      fail(`${rkey}: ${problems.join('; ')}`)
    }
  }

  // --- 4. document link tags on the blog -----------------------------------
  section('4. site.standard.document link tags')
  for (const doc of docs.slice(0, 10)) {
    const rkey = doc.uri.split('/').pop()
    try {
      const res = await fetch(`${BASE_URL}/posts/${rkey}`)
      if (res.status !== 200) {
        fail(`/posts/${rkey} responds ${res.status}`)
        continue
      }
      const html = await res.text()
      const docTag = new RegExp(
        `<link[^>]*rel="site\\.standard\\.document"[^>]*href="at://${ATP_DID.replaceAll(
          /[^a-z0-9]/gi,
          '\\$&',
        )}/site\\.standard\\.document/${rkey}"[^>]*>`,
      ).test(html) ||
        new RegExp(
          `<link[^>]*href="at://${ATP_DID.replaceAll(
            /[^a-z0-9]/gi,
            '\\$&',
          )}/site\\.standard\\.document/${rkey}"[^>]*rel="site\\.standard\\.document"[^>]*>`,
        ).test(html)
      const pubTag = /<link[^>]+rel="site\.standard\.publication"[^>]*>/.exec(
        html,
      )
      if (docTag) {
        ok(`/posts/${rkey} has its site.standard.document link tag`)
      } else {
        fail(`/posts/${rkey} is missing its site.standard.document link tag`)
      }
      if (pubTag) {
        ok(`/posts/${rkey} has a site.standard.publication link tag`)
      } else {
        warn(`/posts/${rkey} is missing a site.standard.publication link tag`)
      }
    } catch (e: any) {
      fail(`could not fetch /posts/${rkey}: ${e.message}`)
    }
  }

  // --- summary --------------------------------------------------------------
  console.log(
    `\n${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failure(s), ${warnings} warning(s)`,
  )
  process.exit(failures === 0 ? 0 : 1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
