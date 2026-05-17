import {json, MetaFunction} from '@remix-run/node'
import {getPosts} from '../../atproto'
import {useLoaderData} from '@remix-run/react'
import {LeafletDocument} from 'src/types'

export const loader = async () => {
  const posts = await getPosts(undefined)
  const postsShortened = posts.map(p => {
    p.description = p.description?.slice(0, 180)
    return p
  })
  return json({posts: postsShortened})
}

export const meta: MetaFunction = () => {
  return [
    {title: "Hailey's Cool Site"},
    {
      name: 'description',
      content: 'thoughts and vibes from hailey',
    },
  ]
}

export default function Index() {
  const {posts} = useLoaderData<{
    posts: LeafletDocument[]
  }>()

  return (
    <div className="container mx-auto pt-16 md:pt-28 pb-24">
      <section className="grid md:grid-cols-12 gap-8 md:gap-12 mb-20 md:mb-28">
        <div className="md:col-span-8">
          <p className="label mb-5">Hailey · Software</p>
          <h1 className="font-display tracking-tightest text-950 text-5xl md:text-7xl leading-[0.95]">
            Notes on{' '}
            <em className="font-display italic text-600" style={{fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 400"}}>
              building
            </em>
            <span className="text-500">,</span>{' '}
            <em className="font-display italic text-600" style={{fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 400"}}>
              breaking
            </em>
            <span className="text-500">,</span> and{' '}
            <em className="font-display italic text-600" style={{fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 400"}}>
              shipping
            </em>
            <span className="text-500">.</span>
          </h1>
        </div>
        <div className="md:col-span-4 md:pt-4 flex flex-col gap-4">
          <p className="font-serif text-lg leading-relaxed text-900 max-w-prose">
            Engineering, safety tooling, AT Protocol, agentic systems. Mostly
            thinking out loud.
          </p>
          <p className="font-mono text-xs text-500">
            Currently at Discord on Safety Engineering.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-6 border-b border-100 pb-3">
          <h2 className="label">Recent writing</h2>
          <span className="label">{posts.length} posts</span>
        </div>
        <ul className="divide-y divide-100">
          {posts
            ?.sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime(),
            )
            .map(post => (
              // @ts-ignore - remix Jsonify makes optional fields non-required
              <PostItem post={post} key={post.rkey} />
            ))}
        </ul>
      </section>
    </div>
  )
}

function PostItem({post}: {post: LeafletDocument}) {
  const date = new Date(post.publishedAt)
  return (
    <li>
      <a
        href={`/posts/${post.rkey}`}
        className="group grid md:grid-cols-12 gap-2 md:gap-6 py-5 -mx-3 px-3 rounded-md transition-colors hover:bg-50">
        <time
          className="md:col-span-2 text-500 text-xs font-mono uppercase tracking-wider self-baseline pt-1"
          dateTime={date.toISOString()}>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>
        <div className="md:col-span-10 flex flex-col gap-1">
          <h3 className="font-display text-2xl md:text-3xl tracking-tightest text-900 group-hover:text-600 transition-colors leading-tight">
            {post.title}
          </h3>
          {post.description ? (
            <p className="text-500 text-base leading-relaxed line-clamp-2">
              {post.description}
            </p>
          ) : null}
        </div>
      </a>
    </li>
  )
}
