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
    <div className="container mx-auto pt-12 md:pt-20 pb-24">
      <section className="mb-16 md:mb-20 flex flex-col gap-5">
        <h1 className="font-display text-4xl md:text-5xl text-950 leading-[1.05]">
          It's Hailey<span className="text-600">.</span>
        </h1>
        <p className="text-lg leading-relaxed text-900 max-w-prose">
          Just a person interested in engineering, safety tooling, AT Protocol,
          and agentic systems. Sometimes I write about it here.
        </p>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-5 border-b border-100 pb-3">
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
        className="group flex flex-col gap-1.5 py-4 -mx-3 px-3 rounded-md transition-colors hover:bg-50">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-display text-xl md:text-2xl text-900 group-hover:text-600 transition-colors leading-tight">
            {post.title}
          </h3>
          <time
            className="font-mono text-xs text-500 uppercase tracking-wider"
            dateTime={date.toISOString()}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
        </div>
        {post.description ? (
          <p className="text-500 text-base leading-relaxed line-clamp-2">
            {post.description}
          </p>
        ) : null}
      </a>
    </li>
  )
}
