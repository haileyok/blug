import {json, MetaFunction} from '@remix-run/node'
import {getPosts, getProfile} from '../../atproto'
import {useLoaderData} from '@remix-run/react'
import {AppBskyActorDefs} from '@atproto/api'
import {LeafletDocument} from 'src/types'

export const loader = async () => {
  const posts = await getPosts(undefined)
  const profile = await getProfile()

  const postsShortened = posts.map(p => {
    p.description = p.description?.slice(0, 300)
    return p
  })

  return json({posts: postsShortened, profile})
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
  const {posts, profile} = useLoaderData<{
    posts: LeafletDocument[]
    profile: AppBskyActorDefs.ProfileViewDetailed
  }>()

  return (
    <div className="container flex flex-col mx-auto pt-10 md:pt-20 pb-20 gap-10">
      <div className="flex-col text-center">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-20 pb-4 md:pb-8">
          <h1 className="text-5xl md:text-6xl font-bold">It's Hailey! 👋</h1>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold">blog posts</h2>
        <ul className="list-none">
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
      <div className="flex">
        <p>
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
          })}
          &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
        </p>
        <a className="font-bold hover:underline" href={`/posts/${post.rkey}`}>
          <h3 className="text-xl"> {post.title}</h3>
        </a>
      </div>
    </li>
  )
}
