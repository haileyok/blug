export interface Blob {
  $type: 'blob'
  ref: {
    $link: string
  }
  mimeType: string
  size: number
}

export interface AspectRatio {
  width: number
  height: number
}

export interface BskyProfileView {
  did: string
  handle: string
  displayName: string
  avatar: string
  description: string
  banner: string
}

export interface LeafletIframeBlock {
  $type: 'pub.leaflet.blocks.iframe'
}

export type LeafletFacetFeature =
  | {$type: 'pub.leaflet.richtext.facet#bold'}
  | {$type: 'pub.leaflet.richtext.facet#italic'}
  | {$type: 'pub.leaflet.richtext.facet#strikethrough'}
  | {$type: 'pub.leaflet.richtext.facet#code'}
  | {$type: 'pub.leaflet.richtext.facet#link'; uri: string}

export interface LeafletFacet {
  features: LeafletFacetFeature[]
  index: {
    byteStart: number
    byteEnd: number
  }
}

export interface LeafletTextBlock {
  $type: 'pub.leaflet.blocks.text'
  facets?: LeafletFacet[]
  textSize?: 'default' | 'small' | 'large'
  plaintext: string
}

export interface LeafletBlockquoteBlock {
  $type: 'pub.leaflet.blocks.blockquote'
  facets?: LeafletFacet[]
  plaintext: string
}

export interface LeafletHeaderBlock {
  $type: 'pub.leaflet.blocks.header'
  level?: 1 | 2 | 3 | 4 | 5 | 6
  facets?: LeafletFacet[]
  plaintext: string
}

export interface LeafletImageBlock {
  $type: 'pub.leaflet.blocks.image'
  alt?: string
  image: Blob
  aspectRatio: AspectRatio
}

export interface LeafletUnorderedListBlock {
  $type: 'pub.leaflet.blocks.list'
  children: {
    content: (LeafletTextBlock | LeafletHeaderBlock | LeafletImageBlock)[]
  }
}

export interface LeafletWebsiteBlock {
  $type: 'pub.leaflet.blocks.website'
  src: string
  title?: string
  description?: string
  previewImage?: Blob
}

export interface LeafletMathBlock {
  $type: 'pub.leaflet.blocks.math'
  text: string
}

export interface LeafletCodeBlock {
  $type: 'pub.leaflet.blocks.code'
  plaintext: string
  syntaxHighlightingTheme?: string
}

export interface LeafletHorizontalRuleBlock {
  $type: 'pub.leaflet.blocks.horizontalRule'
}

export interface LeafletBskyPostBlock {
  $type: 'pub.leaflet.blocks.bskyPost'
  postRef: {
    uri: string
    cid: string
  }
}

export interface LeafletPageBlock {
  $type: 'pub.leaflet.blocks.page'
  id: string
}

export interface LeafletPollBlock {
  $type: 'pub.leaflet.blocks.poll'
  pollRef: {
    uri: string
    cid: string
  }
}

export interface LeafletButtonBlock {
  $type: 'pub.leaflet.blocks.button'
  url: string
  text: string
}

export interface LeafletBlock {
  $type: 'pub.leaflet.pages.linearDocument#block'
  block:
    | LeafletIframeBlock
    | LeafletTextBlock
    | LeafletBlockquoteBlock
    | LeafletHeaderBlock
    | LeafletImageBlock
    | LeafletUnorderedListBlock
    | LeafletWebsiteBlock
    | LeafletMathBlock
    | LeafletCodeBlock
    | LeafletHorizontalRuleBlock
    | LeafletBskyPostBlock
    | LeafletPageBlock
    | LeafletPollBlock
    | LeafletButtonBlock
}

export interface LeafletLinearDocument {
  id?: string
  blocks: LeafletBlock[]
}

export interface LeafletCanvas {}

export interface LeafletDocumentContent {
  pages: LeafletLinearDocument[] // TODO: this should support canvas but idk what that is yet
}

export interface LeafletDocument {
  $type: 'site.standard.document'
  author: string
  coverImage?: Blob
  description: string
  content: LeafletDocumentContent
  publishedAt: string // datetime
  tags?: string[]
  theme?: string
  title: any // ignoring for now but included here, pub.leaflet.publication#theme
  publication?: string // aturi

  // not a part of the record, but we're going to stick it in
  rkey: string
}

// ---------------------------------------------------------------------------
// Offprint (app.offprint.*) — block-based document format. Like Leaflet,
// Offprint posts are stored as `site.standard.document` records, but their
// content is `app.offprint.content` with a flat `items[]` array of blocks.
// ---------------------------------------------------------------------------

export type OffprintFacetFeature =
  | {$type: 'app.offprint.richtext.facet#bold'}
  | {$type: 'app.offprint.richtext.facet#italic'}
  | {$type: 'app.offprint.richtext.facet#underline'}
  | {$type: 'app.offprint.richtext.facet#strikethrough'}
  | {$type: 'app.offprint.richtext.facet#code'}
  | {$type: 'app.offprint.richtext.facet#highlight'; color?: string}
  | {$type: 'app.offprint.richtext.facet#link'; uri: string}
  | {$type: 'app.offprint.richtext.facet#mention'; did: string; handle?: string}

export interface OffprintFacet {
  features: OffprintFacetFeature[]
  index: {
    byteStart: number
    byteEnd: number
  }
}

export interface OffprintTextBlock {
  $type: 'app.offprint.block.text'
  plaintext: string
  facets?: OffprintFacet[]
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

export interface OffprintHeadingBlock {
  $type: 'app.offprint.block.heading'
  level: 1 | 2 | 3
  plaintext: string
  facets?: OffprintFacet[]
  textAlign?: 'left' | 'center' | 'right'
}

export interface OffprintBlockquoteBlock {
  $type: 'app.offprint.block.blockquote'
  content: (OffprintTextBlock | OffprintHeadingBlock)[]
}

export interface OffprintCalloutBlock {
  $type: 'app.offprint.block.callout'
  plaintext: string
  emoji?: string
  color?: string
  facets?: OffprintFacet[]
}

export interface OffprintListItem {
  content: OffprintTextBlock
  children?: OffprintListItem[]
}

export interface OffprintTaskItem {
  checked: boolean
  content: OffprintTextBlock
  children?: OffprintTaskItem[]
}

export interface OffprintBulletListBlock {
  $type: 'app.offprint.block.bulletList'
  children: OffprintListItem[]
}

export interface OffprintOrderedListBlock {
  $type: 'app.offprint.block.orderedList'
  children: OffprintListItem[]
  start?: number
}

export interface OffprintTaskListBlock {
  $type: 'app.offprint.block.taskList'
  children: OffprintTaskItem[]
}

export interface OffprintImageBlock {
  $type: 'app.offprint.block.image'
  // The real record uses `image`; the lexicon also documents a `blob` alias.
  image?: Blob
  blob?: Blob
  alt?: string
  caption?: string
  alignment?: 'left' | 'center' | 'right'
  aspectRatio?: AspectRatio
  width?: string
}

export interface OffprintCodeBlock {
  $type: 'app.offprint.block.codeBlock'
  code: string
  language?: string
  showLineNumbers?: boolean
}

export interface OffprintBlueskyPostBlock {
  $type: 'app.offprint.block.blueskyPost'
  post: {
    uri: string
    cid: string
  }
}

export interface OffprintHorizontalRuleBlock {
  $type: 'app.offprint.block.horizontalRule'
}

export type OffprintBlock =
  | OffprintTextBlock
  | OffprintHeadingBlock
  | OffprintBlockquoteBlock
  | OffprintCalloutBlock
  | OffprintBulletListBlock
  | OffprintOrderedListBlock
  | OffprintTaskListBlock
  | OffprintImageBlock
  | OffprintCodeBlock
  | OffprintBlueskyPostBlock
  | OffprintHorizontalRuleBlock

export interface OffprintContent {
  $type: 'app.offprint.content'
  items: OffprintBlock[]
}

export interface OffprintDocument {
  $type: 'site.standard.document'
  title: string
  publishedAt: string
  content: OffprintContent
  path?: string
  site?: string
  textContent?: string
  rkey: string
}

/** A post record from the `site.standard.document` collection — Leaflet or Offprint. */
export type Document = LeafletDocument | OffprintDocument

export function isOffprintDocument(
  doc: Document,
): doc is OffprintDocument {
  return (doc.content as OffprintContent)?.$type === 'app.offprint.content'
}
