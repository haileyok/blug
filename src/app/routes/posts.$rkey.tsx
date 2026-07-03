import {useLoaderData} from '@remix-run/react'
import {Components} from 'react-markdown'
import {getPost, getProfile} from '../../atproto'
import {json, LoaderFunctionArgs, MetaFunction} from '@remix-run/node'
import {AppBskyActorDefs} from '@atproto/api'
import {
  Document,
  isOffprintDocument,
  LeafletBlock,
  LeafletBlockquoteBlock,
  LeafletCodeBlock,
  LeafletFacet,
  LeafletImageBlock,
  LeafletWebsiteBlock,
  OffprintBlock,
  OffprintBlockquoteBlock,
  OffprintCalloutBlock,
  OffprintCodeBlock,
  OffprintFacet,
  OffprintImageBlock,
  OffprintListItem,
  OffprintTaskItem,
  OffprintTextBlock,
} from 'src/types'
import {getDid} from 'src/atproto/getDid'
import {useEffect, useRef} from 'react'
import {Link} from '../components/link'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const {rkey} = params
  const [post, profile] = await Promise.all([getPost(rkey!), getProfile()])
  return json({did: getDid(), post, profile})
}

function cdnUrl(did: string, link: string, fullsize = true) {
  return `https://cdn.bsky.app/img/feed_${
    fullsize ? 'fullsize' : 'thumbnail'
  }/plain/${did}/${link}@jpeg`
}

/** Best-effort preview text + first image, for meta tags. */
function extractPreview(
  post: Document,
  did: string,
): {postText: string; ogImageUrl?: string} {
  let postText = ''
  let ogImageUrl: string | undefined

  if (isOffprintDocument(post)) {
    for (const block of post.content.items) {
      if (block.$type === 'app.offprint.block.text') {
        postText += `\n${block.plaintext}`
      } else if (
        !ogImageUrl &&
        block.$type === 'app.offprint.block.image' &&
        (block.image ?? block.blob)
      ) {
        ogImageUrl = cdnUrl(did, (block.image ?? block.blob)!.ref.$link)
      }
    }
  } else {
    for (const block of post.content.pages[0].blocks) {
      if (block.block.$type === 'pub.leaflet.blocks.text') {
        postText += `\n${block.block.plaintext}`
      } else if (
        !ogImageUrl &&
        block.block.$type === 'pub.leaflet.blocks.image'
      ) {
        ogImageUrl = cdnUrl(did, block.block.image.ref.$link)
      }
    }
  }

  return {postText, ogImageUrl}
}

/** Leaflet carries `description`; Offprint carries `textContent`. */
function postDescription(post: Document): string | undefined {
  return 'description' in post ? post.description : post.textContent
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const post = data ? (data.post as unknown as Document) : undefined
  const {postText, ogImageUrl} =
    data && post
      ? extractPreview(post, data.did!)
      : {postText: '', ogImageUrl: undefined as string | undefined}

  const description = post ? postDescription(post) : undefined

  return [
    {title: `${data?.post.title} | Hailey's Cool Site`},
    {
      name: 'description',
      content: description
        ? description
        : `${postText.split(' ').slice(0, 100).join(' ')}...`,
    },
    {
      name: 'og:title',
      content: `${data?.post.title}`,
    },
    {
      name: 'og:description',
      content: description
        ? description
        : `${postText.split(' ').slice(0, 100).join(' ')}...`,
    },
    ...(ogImageUrl
      ? [
          {
            property: 'og:image',
            content: ogImageUrl,
          },
        ]
      : []),
  ]
}

export default function Posts() {
  const {did, post, profile} = useLoaderData<{
    did: string
    post: Document
    profile: AppBskyActorDefs.ProfileViewDetailed
  }>()

  // Remix wraps loader data in Jsonify (making some fields optional). The
  // record came straight from the PDS and we know its shape, so cast back.
  const doc = post as unknown as Document

  if (!post) {
    return <Error />
  }

  return (
    <article className="container mx-auto pt-12 md:pt-20 pb-24">
      <header className="flex flex-col gap-5 mb-12 md:mb-16 max-w-prose">
        <a
          href="/"
          className="label hover:text-600 transition-colors w-fit">
          ← Writing
        </a>
        <h1 className="font-display text-950 text-4xl md:text-6xl leading-[1.02]">
          {doc.title}
        </h1>
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider">
          <span className="text-500">{profile.displayName}</span>
          <span className="text-300">·</span>
          <time
            className="text-500"
            dateTime={new Date(doc.publishedAt).toISOString()}>
            {new Date(doc.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </header>

      <div className="flex flex-col gap-5 max-w-prose">
        {isOffprintDocument(doc) ? (
          doc.content.items.map((block, idx) => (
            // @ts-ignore - TODO: jsonify
            <OffprintBlockRenderer block={block} did={did} key={idx} />
          ))
        ) : (
          doc.content.pages.map((page, idx) => (
            <div className="flex flex-col gap-5" key={idx}>
              {page.blocks.map((block, idx) => (
                // @ts-ignore - TODO: jsonify
                <Block block={block} did={did} key={idx} />
              ))}
            </div>
          ))
        )}
      </div>
    </article>
  )
}

function Block({block, did}: {block: LeafletBlock; did: string}) {
  const b = block.block
  switch (b.$type) {
    case 'pub.leaflet.blocks.header':
      return (
        <Header plaintext={b.plaintext} level={b.level} facets={b.facets} />
      )
    case 'pub.leaflet.blocks.text':
      return (
        <Text plaintext={b.plaintext} textSize={b.textSize} facets={b.facets} />
      )
    case 'pub.leaflet.blocks.blockquote':
      return <BlockQuote block={b} />
    case 'pub.leaflet.blocks.image':
      return <Image block={b} did={did} />
    case 'pub.leaflet.blocks.code':
      return <Code block={b} />
    case 'pub.leaflet.blocks.horizontalRule':
      return <HorizontalRule />
    case 'pub.leaflet.blocks.website':
      return <Website block={b} did={did} />
    case 'pub.leaflet.blocks.bskyPost':
      return <BskyPost uri={b.postRef.uri} />
  }
}

function Header({
  plaintext,
  level,
  facets,
}: {
  plaintext: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  facets?: LeafletFacet[] | OffprintFacet[]
}) {
  const children = renderRichText(plaintext, facets)
  switch (level) {
    case 1:
      return (
        <h1 className="font-display text-3xl md:text-4xl text-950 pt-6 mt-2 leading-tight">
          {children}
        </h1>
      )
    case 2:
      return (
        <h2 className="font-display text-2xl md:text-3xl text-950 pt-6 mt-2 leading-tight">
          {children}
        </h2>
      )
    case 3:
      return (
        <h3 className="font-display text-xl md:text-2xl text-900 pt-4 leading-tight">
          {children}
        </h3>
      )
    case 4:
      return (
        <h4 className="font-display text-lg md:text-xl text-900 pt-4 leading-tight">
          {children}
        </h4>
      )
    case 5:
      return (
        <h5 className="font-display text-base md:text-lg text-900 pt-4 leading-tight">
          {children}
        </h5>
      )
    case 6:
      return (
        <h6 className="font-mono uppercase tracking-wider text-sm text-500 pt-4">
          {children}
        </h6>
      )
  }

  throw Error()
}

function Text({
  plaintext,
  facets,
  textSize = 'default',
}: {
  plaintext: string
  facets?: LeafletFacet[] | OffprintFacet[]
  textSize?: 'default' | 'small' | 'large'
}) {
  const sizeClass =
    textSize === 'default'
      ? 'text-lg md:text-xl'
      : textSize === 'small'
        ? 'text-base'
        : 'text-xl md:text-2xl'

  const className = `${sizeClass} font-sans text-900 leading-relaxed`

  return <p className={className}>{renderRichText(plaintext, facets)}</p>
}

function renderRichText(
  text: string,
  facets?: LeafletFacet[] | OffprintFacet[],
): React.ReactNode {
  if (!facets?.length) {
    return text
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const bytes = encoder.encode(text)

  const sortedFacets = [...facets].sort(
    (a, b) => a.index.byteStart - b.index.byteStart,
  )

  const segments: React.ReactNode[] = []
  let lastIndex = 0

  sortedFacets.forEach((facet, i) => {
    const {byteStart, byteEnd} = facet.index

    if (byteStart > lastIndex) {
      segments.push(decoder.decode(bytes.slice(lastIndex, byteStart)))
    }

    const facetText = decoder.decode(bytes.slice(byteStart, byteEnd))

    let element: React.ReactNode = facetText

    for (const feature of facet.features) {
      // Feature types share their suffix (bold, italic, ...) across Leaflet
      // (`pub.leaflet.richtext.facet#bold`) and Offprint
      // (`app.offprint.richtext.facet#bold`), so match on that suffix.
      const kind = feature.$type.split('#')[1]
      switch (kind) {
        case 'bold':
          element = <strong key={`bold-${i}`}>{element}</strong>
          break
        case 'italic':
          element = <em key={`italic-${i}`}>{element}</em>
          break
        case 'underline':
          element = <u key={`underline-${i}`}>{element}</u>
          break
        case 'strikethrough':
          element = <s key={`strike-${i}`}>{element}</s>
          break
        case 'code':
          element = (
            <code
              key={`code-${i}`}
              className="bg-50 text-600 px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-100">
              {element}
            </code>
          )
          break
        case 'highlight':
          element = (
            <mark
              key={`highlight-${i}`}
              className="bg-100 rounded px-1"
              style={
                'color' in feature && feature.color
                  ? {backgroundColor: feature.color}
                  : undefined
              }>
              {element}
            </mark>
          )
          break
        case 'link':
          element = (
            <Link
              key={`link-${i}`}
              href={(feature as {uri: string}).uri}
              className="text-600 hover:text-700 underline underline-offset-2">
              {element}
            </Link>
          )
          break
        case 'mention':
          element = (
            <Link
              key={`mention-${i}`}
              href={`https://bsky.app/profile/${
                (feature as {did: string}).did
              }`}
              className="text-600 hover:text-700">
              {element}
            </Link>
          )
          break
      }
    }

    segments.push(<span key={i}>{element}</span>)
    lastIndex = byteEnd
  })

  if (lastIndex < bytes.length) {
    segments.push(decoder.decode(bytes.slice(lastIndex)))
  }

  return segments
}

function BlockQuote({block}: {block: LeafletBlockquoteBlock}) {
  return (
    <blockquote className="border-l-2 border-600 pl-5 my-2 italic font-sans text-xl md:text-2xl text-900 leading-relaxed">
      {block.plaintext}
    </blockquote>
  )
}

function Code({block}: {block: LeafletCodeBlock}) {
  return (
    <pre className="bg-50 text-900 py-4 px-5 rounded-md overflow-x-auto my-2 font-mono text-sm leading-relaxed border border-100">
      {block.plaintext}
    </pre>
  )
}

function HorizontalRule() {
  return (
    <div className="flex justify-center my-6 text-300 select-none font-mono text-sm tracking-widest">
      <span>· · ·</span>
    </div>
  )
}

function Image({block, did}: {block: LeafletImageBlock; did: string}) {
  const src = cdnUrl(did, block.image.ref.$link)

  return (
    <figure className="my-4 -mx-2 md:-mx-8">
      <img
        src={src}
        alt={block.alt}
        className="rounded-md shadow-2xl shadow-black/40 max-w-full mx-auto"
      />
      {block.alt ? (
        <figcaption className="text-center text-xs font-mono uppercase tracking-wider text-500 mt-3">
          {block.alt}
        </figcaption>
      ) : null}
    </figure>
  )
}

function Website({block, did}: {block: LeafletWebsiteBlock; did: string}) {
  function PreviewImage() {
    if (!block.previewImage) {
      return null
    }

    const src = cdnUrl(did, block.previewImage.ref.$link, false)

    return (
      <img
        src={src}
        className="rounded-lg h-40 object-cover flex-shrink-0"
      />
    )
  }

  return (
    <a
      href={block.src}
      className="border border-100 rounded-md flex gap-4 p-4 bg-50 hover:bg-100 hover:border-300 transition-colors group my-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg md:text-xl text-950 truncate group-hover:text-600 transition-colors">
          {block.title || block.src}
        </h3>
        {block.description ? (
          <p className="text-500 mt-1 line-clamp-2 font-sans text-sm">
            {block.description}
          </p>
        ) : null}
        <p className="text-400 mt-2 font-mono text-xs uppercase tracking-wider truncate">
          {(() => {
            try {
              return new URL(block.src).hostname.replace(/^www\./, '')
            } catch {
              return block.src
            }
          })()}
        </p>
      </div>
      <PreviewImage />
    </a>
  )
}

function BskyPost({uri}: {uri: string}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const blockquote = document.createElement('blockquote')
    blockquote.className = 'bluesky-embed'
    blockquote.dataset.blueskyUri = uri
    containerRef.current.appendChild(blockquote)

    if (
      !document.querySelector(
        'script[src="https://embed.bsky.app/static/embed.js"]',
      )
    ) {
      const script = document.createElement('script')
      script.src = 'https://embed.bsky.app/static/embed.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
    } else {
      ;(window as any).bluesky?.scan?.()
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [uri])

  return <div ref={containerRef} className="flex justify-center my-4" />
}

// ---------------------------------------------------------------------------
// Offprint (app.offprint.*) block rendering.
// ---------------------------------------------------------------------------

function OffprintBlockRenderer({
  block,
  did,
}: {
  block: OffprintBlock
  did: string
}) {
  switch (block.$type) {
    case 'app.offprint.block.text':
      return <OffprintText block={block} />
    case 'app.offprint.block.heading':
      return (
        <Header
          plaintext={block.plaintext}
          level={block.level}
          facets={block.facets}
        />
      )
    case 'app.offprint.block.blockquote':
      return <OffprintBlockquote block={block} />
    case 'app.offprint.block.callout':
      return <OffprintCallout block={block} />
    case 'app.offprint.block.bulletList':
      return <OffprintList children={block.children} ordered={false} />
    case 'app.offprint.block.orderedList':
      return (
        <OffprintList
          children={block.children}
          ordered={true}
          start={block.start}
        />
      )
    case 'app.offprint.block.taskList':
      return <OffprintTaskList children={block.children} />
    case 'app.offprint.block.image':
      return <OffprintImage block={block} did={did} />
    case 'app.offprint.block.codeBlock':
      return <OffprintCode block={block} />
    case 'app.offprint.block.blueskyPost':
      return <BskyPost uri={block.post.uri} />
    case 'app.offprint.block.horizontalRule':
      return <HorizontalRule />
  }
}

function OffprintText({block}: {block: OffprintTextBlock}) {
  const alignClass =
    block.textAlign === 'center'
      ? 'text-center'
      : block.textAlign === 'right'
        ? 'text-right'
        : block.textAlign === 'justify'
          ? 'text-justify'
          : ''

  return (
    <div className={alignClass}>
      <Text plaintext={block.plaintext} facets={block.facets} />
    </div>
  )
}

function OffprintBlockquote({block}: {block: OffprintBlockquoteBlock}) {
  return (
    <blockquote className="border-l-2 border-600 pl-5 my-2 italic font-sans text-xl md:text-2xl text-900 leading-relaxed flex flex-col gap-3">
      {block.content.map((c, i) => {
        if (c.$type === 'app.offprint.block.heading') {
          return (
            <Header
              key={i}
              plaintext={c.plaintext}
              level={c.level}
              facets={c.facets}
            />
          )
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderRichText(c.plaintext, c.facets)}
          </p>
        )
      })}
    </blockquote>
  )
}

function OffprintCallout({block}: {block: OffprintCalloutBlock}) {
  return (
    <div className="my-4 flex gap-3 items-start rounded-md border border-100 bg-50 p-4">
      {block.emoji ? <span className="text-xl leading-none">{block.emoji}</span> : null}
      <p className="font-sans text-900 leading-relaxed text-lg flex-1 m-0">
        {renderRichText(block.plaintext, block.facets)}
      </p>
    </div>
  )
}

function OffprintList({
  children,
  ordered,
  start,
}: {
  children: OffprintListItem[]
  ordered: boolean
  start?: number
}) {
  const className = ordered
    ? 'list-decimal pl-6 text-900 flex flex-col gap-1 font-sans'
    : 'list-disc pl-6 text-900 flex flex-col gap-1 font-sans'

  const items = children.map((item, i) => (
    <li key={i} className="leading-relaxed">
      {renderRichText(item.content.plaintext, item.content.facets)}
      {item.children?.length ? (
        <OffprintList children={item.children} ordered={ordered} />
      ) : null}
    </li>
  ))

  return ordered ? (
    <ol className={className} start={start}>
      {items}
    </ol>
  ) : (
    <ul className={className}>{items}</ul>
  )
}

function OffprintTaskList({children}: {children: OffprintTaskItem[]}) {
  return (
    <ul className="pl-1 flex flex-col gap-1 font-sans text-900">
      {children.map((item, i) => (
        <li key={i} className="flex items-start gap-2 leading-relaxed">
          <span className="mt-1 select-none">{item.checked ? '☑' : '☐'}</span>
          <span>
            {renderRichText(item.content.plaintext, item.content.facets)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function OffprintImage({block, did}: {block: OffprintImageBlock; did: string}) {
  const blob = block.image ?? block.blob
  if (!blob) return null
  const src = cdnUrl(did, blob.ref.$link)

  const caption = block.caption ?? block.alt

  return (
    <figure className="my-4 -mx-2 md:-mx-8">
      <img
        src={src}
        alt={block.alt}
        className="rounded-md shadow-2xl shadow-black/40 max-w-full mx-auto"
      />
      {caption ? (
        <figcaption className="text-center text-xs font-mono uppercase tracking-wider text-500 mt-3">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

function OffprintCode({block}: {block: OffprintCodeBlock}) {
  return (
    <pre className="bg-50 text-900 py-4 px-5 rounded-md overflow-x-auto my-2 font-mono text-sm leading-relaxed border border-100">
      {block.code}
    </pre>
  )
}

function Error() {
  return (
    <div className="container mx-auto pt-16 md:pt-28 pb-24 text-center">
      <p className="label mb-6">404</p>
      <h1 className="font-display text-5xl md:text-7xl text-950 leading-[0.95]">
        That post wandered off.
      </h1>
      <div className="p-10 flex justify-center">
        <img
          src="/monkey.jpg"
          alt="Monkey muppet meme image"
          className="rounded-md shadow-2xl shadow-black/40 max-w-sm"
        />
      </div>
      <a
        href="/"
        className="inline-block font-mono text-xs text-600 hover:text-700 transition-colors">
        ← back to writing
      </a>
    </div>
  )
}

const markdownComponents: Partial<Components> = {
  ul: ({children}) => <ul className="list-disc pl-4 text-900">{children}</ul>,
  ol: ({children}) => (
    <ol className="list-decimal pl-4 text-900">{children}</ol>
  ),
  li: ({children}) => <li className="py-1">{children}</li>,
  pre: ({children}) => (
    <pre className="bg-100 text-900 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm border border-200">
      {children}
    </pre>
  ),
  img: ({src, alt}) => (
    <div className="flex justify-center p-6">
      <img
        src={src as string}
        alt={alt as string}
        className="rounded-lg shadow-md"
      />
    </div>
  ),
  table: ({children}) => (
    <table className="table-auto w-full border-collapse">{children}</table>
  ),
  thead: ({children}) => <thead className="bg-100">{children}</thead>,
  tbody: ({children}) => <tbody className="bg-50">{children}</tbody>,
  tr: ({children}) => <tr className="border-b border-200">{children}</tr>,
  th: ({children}) => (
    <th className="border border-200 p-3 text-left font-semibold text-900">
      {children}
    </th>
  ),
  td: ({children}) => (
    <td className="border border-200 p-3 text-900">{children}</td>
  ),
}

function bskyLinkToAtUri(url: string) {
  const urlp = new URL(url)
  const parts = urlp.pathname.split('/')
  const did = parts[2]
  const rkey = parts[4]
  return `at://${did}/app.bsky.feed.post/${rkey}`
}
