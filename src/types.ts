export interface WhtwndBlogEntryRecord {
  $type: 'com.whtwnd.blog.entry'
  content?: string
  createdAt: string
  theme?: string
  title: string
  ogp?: {
    height: number | null
    url: string | null
    width: number | null
  }
}

export interface WhtwndBlogEntryView {
  rkey: string
  cid: string
  title: string
  content?: string
  createdAt: string
  banner?: string
}

export interface BskyProfileView {
  did: string
  handle: string
  displayName: string
  avatar: string
  description: string
  banner: string
}
