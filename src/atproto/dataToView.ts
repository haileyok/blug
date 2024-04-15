import {WhtwndBlogEntryRecord, WhtwndBlogEntryView} from '../types'
import {uriToRkey} from './uriToRkey'

export const whtwndBlogEntryRecordToView = ({
  uri,
  cid,
  value,
}: {
  uri: string
  cid: string
  value: WhtwndBlogEntryRecord
}): WhtwndBlogEntryView => {
  return {
    rkey: uriToRkey(uri),
    cid,
    title: value.title,
    content: value.content,
    createdAt: value.createdAt,
    banner: value.ogp?.url ?? undefined,
  }
}
