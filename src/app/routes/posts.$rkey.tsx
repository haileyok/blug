import {useLoaderData} from '@remix-run/react'
import {Components} from 'react-markdown'
import {getPost, getProfile} from '../../atproto'
import {json, LoaderFunctionArgs, MetaFunction} from '@remix-run/node'
import {AppBskyActorDefs} from '@atproto/api'
import {
  LeafletBlock,
  LeafletBlockquoteBlock,
  LeafletBskyPostBlock,
  LeafletCodeBlock,
  LeafletDocument,
  LeafletFacet,
  LeafletHeaderBlock,
  LeafletImageBlock,
  LeafletWebsiteBlock,
} from 'src/types'
import {getDid} from 'src/atproto/getDid'
import {useEffect, useRef} from 'react'
import {Link} from '../components/link'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const {rkey} = params
  const [post, profile] = await Promise.all([getPost(rkey!), getProfile()])
  return json({did: getDid(), post, profile})
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  let postText = ''
  let ogImageUrl
  if (data) {
    for (const block of data.post.pages[0].blocks) {
      if (block.block.$type === 'pub.leaflet.blocks.text') {
        postText += `\n${block.block.plaintext}`
      } else if (
        !ogImageUrl &&
        block.block.$type === 'pub.leaflet.blocks.image'
      ) {
        ogImageUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${data.did}/${block.block.image.ref.$link}@jpeg`
      }
    }
  }

  return [
    {title: `${data?.post.title} | Hailey's Cool Site`},
    {
      name: 'description',
      content: `${postText.split(' ').slice(0, 100).join(' ')}...`,
    },
    {
      name: 'og:title',
      content: `${data?.post.title}`,
    },
    {
      name: 'og:description',
      // TODO:same as above
      content: `${postText.split(' ').slice(0, 100).join(' ')}...`,
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
    post: LeafletDocument
    profile: AppBskyActorDefs.ProfileViewDetailed
  }>()

  if (!post) {
    return <Error />
  }

  return (
    <div className="container mx-auto pt-10 md:pt-20 pb-20">
      <div className="flex flex-col text-center gap-4">
        <h1 className="text-5xl md:text-6xl font-bold">{post.title}</h1>
        <span className="text-md italic text-300">
          Poorly written by {profile.displayName} on{' '}
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="py-4">
        {post.pages.map((page, idx) => (
          <div className="flex flex-col gap-4" key={idx}>
            {page.blocks.map((block, idx) => (
              // @ts-ignore - TODO: jsonify
              <Block block={block} did={did} key={idx} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Block({block, did}: {block: LeafletBlock; did: string}) {
  const b = block.block
  switch (b.$type) {
    case 'pub.leaflet.blocks.header':
      return <Header block={b} />
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
      return <BskyPost block={b} />
  }
}

function Header({block}: {block: LeafletHeaderBlock}) {
  switch (block.level) {
    case 1:
      return (
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{block.plaintext}</h1>
          <div className="w-full h-0.5 bg-300 my-2 "></div>
        </div>
      )
    case 2:
      return (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold pt-6">
            {block.plaintext}
          </h2>
          <div className="w-full h-0.5 bg-300 my-2"></div>
        </div>
      )
    case 3:
      return (
        <h3 className="text-xl md:text-2xl font-bold pt-4">
          {block.plaintext}
        </h3>
      )
    case 4:
      return (
        <h4 className="text-lg md:text-xl font-bold pt-4">{block.plaintext}</h4>
      )
    case 5:
      return (
        <h5 className="text-base md:text-lg font-bold pt-4">
          {block.plaintext}
        </h5>
      )
    case 6:
      return (
        <h6 className="text-base md:text-lg font-bold pt-4">
          {block.plaintext}
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
  facets?: LeafletFacet[]
  textSize?: 'default' | 'small' | 'large'
}) {
  const sizeClass =
    textSize === 'default'
      ? 'text-xl'
      : textSize === 'small'
        ? 'text-md'
        : 'text-2xl'

  const className = `${sizeClass} text-white`

  return <p className={className}>{renderRichText(plaintext, facets)}</p>
}

function renderRichText(
  text: string,
  facets?: LeafletFacet[],
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
      switch (feature.$type) {
        case 'pub.leaflet.richtext.facet#bold':
          element = <strong key={`bold-${i}`}>{element}</strong>
          break
        case 'pub.leaflet.richtext.facet#italic':
          element = <em key={`italic-${i}`}>{element}</em>
          break
        case 'pub.leaflet.richtext.facet#strikethrough':
          element = <s key={`strike-${i}`}>{element}</s>
          break
        case 'pub.leaflet.richtext.facet#link':
          element = (
            <Link key={`link-${i}`} href={feature.uri}>
              {element}
            </Link>
          )
          break
        case 'pub.leaflet.richtext.facet#code':
          element = <code className="bg-gray p-1 rounded-md">{element}</code>
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
    <blockquote className="border-l-4 border-300 py-2 pl-4">
      <Text plaintext={block.plaintext} />
    </blockquote>
  )
}

function Code({block}: {block: LeafletCodeBlock}) {
  return (
    <pre className="bg-gray py-4 px-4 rounded-md overflow-x-auto my-4">
      {block.plaintext}
    </pre>
  )

  // return <code className="bg-gray p-1 rounded-md">{block.plaintext}</code>
}

function HorizontalRule() {
  return <hr className="my-4" />
}

function Image({block, did}: {block: LeafletImageBlock; did: string}) {
  const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${block.image.ref.$link}@jpeg`

  return (
    <div className="flex justify-center">
      <img src={cdnUrl} alt={block.alt} className="rounded-md" />
    </div>
  )
}

function Website({block, did}: {block: LeafletWebsiteBlock; did: string}) {
  function PreviewImage() {
    if (!block.previewImage) {
      return null
    }

    const cdnUrl = `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${block.previewImage.ref.$link}@jpeg`

    return <img src={cdnUrl} className="rounded-lg h-40" />
  }

  return (
    <a href={block.src} className="border-1 rounded-lg flex gap-4 p-4">
      <div>
        <h3 className="text-xl md:text-2xl font-bold">
          {block.title || block.src}
        </h3>
        {block.description ? <p>{block.description}</p> : null}
      </div>
      <PreviewImage />
    </a>
  )
}

function BskyPost({block}: {block: LeafletBskyPostBlock}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const blockquote = document.createElement('blockquote')
    blockquote.className = 'bluesky-embed'
    blockquote.dataset.blueskyUri = block.postRef.uri
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
  }, [block.postRef.uri])

  return <div ref={containerRef} className="flex justify-center" />
}

function Error() {
  return (
    <div className="container mx-auto pt-10 md:pt-20 pb-20">
      <h1 className="text-5xl md:text-6xl font-bold text-center">
        Uh...something went wrong.
      </h1>
      <div className="p-10">
        <img
          src="/monkey.jpg"
          alt="Monkey muppet meme image"
          className="rounded-md"
        />
      </div>
    </div>
  )
}

const markdownComponents: Partial<Components> = {
  // TODO: same
  ul: ({children}) => <ul className="list-disc pl-4">{children}</ul>,
  // TODO: same
  ol: ({children}) => <ol className="list-decimal pl-4">{children}</ol>,
  // TODO: same
  li: ({children}) => <li className="py-1">{children}</li>,
  pre: ({children}) => (
    <pre className="bg-gray p-2 rounded-md overflow-x-auto my-4">
      {children}
    </pre>
  ),
  img: ({src, alt}) => (
    <div className="flex justify-center p-6">
      <img src={src as string} alt={alt as string} className="rounded-md" />
    </div>
  ),
  table: ({children}) => (
    <table className="table-auto w-full">{children}</table>
  ),
  thead: ({children}) => <thead className="bg-100">{children}</thead>,
  tbody: ({children}) => <tbody>{children}</tbody>,
  tr: ({children}) => <tr>{children}</tr>,
  th: ({children}) => <th className="border border-300 p-2">{children}</th>,
  td: ({children}) => <td className="border border-300 p-2">{children}</td>,
}

function bskyLinkToAtUri(url: string) {
  const urlp = new URL(url)
  const parts = urlp.pathname.split('/')
  const did = parts[2]
  const rkey = parts[4]
  return `at://${did}/app.bsky.feed.post/${rkey}`
}
