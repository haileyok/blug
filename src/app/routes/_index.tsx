import {json, MetaFunction} from '@remix-run/node'
import {getPosts} from '../../atproto'
import {useLoaderData} from '@remix-run/react'
import {LeafletDocument} from 'src/types'

export const loader = async () => {
  const posts = await getPosts(undefined)
  const postsShortened = posts.map(p => {
    p.description = p.description?.slice(0, 300)
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
    <div className="container flex flex-col mx-auto pt-10 md:pt-20 pb-20 gap-12">
      <div className="flex flex-col text-center gap-3">
        <h1 className="text-5xl md:text-6xl font-bold text-950">
          It's Hailey! 👋
        </h1>
        <p className="text-500 text-lg">thoughts and vibes</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-950">Blog Posts</h2>
        <ul>
          {posts
            ?.sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime(),
            )
            // @ts-ignore - TODO: i think remix does something with jsonify? ugh i hate typescript lol
            .map(post => <PostItem post={post} key={post.rkey} />)}
        </ul>
      </div>
    </div>
  )
}

function PostItem({post}: {post: LeafletDocument}) {
  return (
    <li>
      <a
        href={`/posts/${post.rkey}`}
        className="group flex items-baseline gap-4 px-4 -mx-4 rounded-lg">
        <time className="text-500 text-sm font-mono shrink-0">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>
        <h3 className="text-lg text-900 group-hover:text-600 transition-colors">
          {post.title}
        </h3>
      </a>
    </li>
  )
}
