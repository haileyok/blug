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
