#!/usr/bin/env tsx
/**
 * Fix the `site` field on site.standard.document records.
 *
 * Leaflet (and possibly other writers) record `site` as a viewer URL like
 * https://leaflet.pub/p/did:... instead of an at:// URI to the publication
 * record. The standard.site spec allows https for "loose documents", but a
 * document that belongs to a publication must point at its record:
 *
 *   at://{did}/site.standard.publication/{rkey}
 *
 * This script rewrites every document record whose `site` doesn't match the
 * publication AT-URI, preserving every other field (via getRecord + putRecord
 * upsert with the same rkey).
 *
 * Usage:
 *   yarn fix-document-site            # dry run: report what would change
 *   yarn fix-document-site -- --write # apply the rewrites
 *
 * Env (see .env.example):
 *   ATP_SERVICE           PDS endpoint, e.g. https://pds.example.com
 *   ATP_IDENTIFIER        handle / repo name
 *   ATP_DID               DID of the repo
 *   ATP_PUBLICATION_RKEY  publication rkey (default: self)
 *   ATP_AUTH_USERNAME     defaults to ATP_IDENTIFIER
 *   ATP_AUTH_PASSWORD     PDS app password (required for --write)
 */

import {AtpAgent} from '@atproto/api'

const args = process.argv.slice(2)
// Accept --write either as a direct flag or via env (yarn 1's flag
// pass-through to nested binaries is unreliable; env is deterministic).
const WRITE = args.includes('--write') || process.env.FIX_WRITE === '1'

const SERVICE = (process.env.ATP_SERVICE || '').replace(/\/+$/, '')
const REPO = process.env.ATP_IDENTIFIER || ''
const DID = process.env.ATP_DID || ''
const PUBLICATION_RKEY = process.env.ATP_PUBLICATION_RKEY || 'self'
const USERNAME = process.env.ATP_AUTH_USERNAME || REPO
const PASSWORD = process.env.ATP_AUTH_PASSWORD || ''

if (!SERVICE || !REPO || !DID) {
  console.error(
    'ATP_SERVICE, ATP_IDENTIFIER and ATP_DID must be set (see .env.example).',
  )
  process.exit(2)
}

const PUBLICATION_URI = `at://${DID}/site.standard.publication/${PUBLICATION_RKEY}`

async function main() {
  const agent = new AtpAgent({service: SERVICE})

  if (WRITE) {
    if (!PASSWORD) {
      console.error(
        'ATP_AUTH_PASSWORD (a PDS app password) is required for --write.',
      )
      process.exit(2)
    }
    await agent.login({identifier: USERNAME, password: PASSWORD})
    console.log(`logged in as ${agent.session?.did}`)
  }

  console.log(`publication record: ${PUBLICATION_URI}\n`)

  // Collect every document record, following the cursor.
  const records: {uri: string; cid: string; value: any}[] = []
  let cursor: string | undefined
  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: REPO,
      collection: 'site.standard.document',
      cursor,
      limit: 100,
    })
    records.push(...(res.data.records as any))
    cursor = res.data.cursor || undefined
  } while (cursor)

  console.log(`${records.length} document record(s)\n`)

  let fixes = 0
  for (const rec of records) {
    const rkey = rec.uri.split('/').pop()!
    const value = rec.value
    if (value.site === PUBLICATION_URI) {
      console.log(`  ✓ ${rkey}: site already correct`)
      continue
    }

    fixes++
    console.log(
      `  ${WRITE ? 'rewriting' : 'would rewrite'} ${rkey}: site "${value.site}" -> "${PUBLICATION_URI}"`,
    )

    if (WRITE) {
      await agent.com.atproto.repo.putRecord({
        repo: REPO,
        collection: 'site.standard.document',
        rkey,
        record: {...value, site: PUBLICATION_URI},
        swapRecord: rec.cid, // fail if the record changed under us
      })
    }
  }

  console.log(
    `\n${WRITE ? 'done' : 'dry run'}: ${fixes} record(s) ${WRITE ? 'rewritten' : 'to rewrite'}.` +
      (WRITE ? '' : ' Re-run with FIX_WRITE=1 to apply.'),
  )
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
