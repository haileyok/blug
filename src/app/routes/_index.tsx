import React from 'react'
import {json, MetaFunction} from '@remix-run/node'
import {getPosts, getProfile} from '../../atproto'
import {useLoaderData} from '@remix-run/react'
import {WhtwndBlogEntryView} from '../../types'
import {AppBskyActorDefs} from '@atproto/api'
import Markdown from 'react-markdown'

export const loader = async () => {
  const posts = await getPosts(undefined)
  const profile = await getProfile()

  const postsFiltered = posts.filter(p => !p.content?.startsWith('NOT_LIVE'))

  const postsShortened = postsFiltered.map(p => {
    p.content = p.content?.slice(0, 300)
    return p
  })

  return json({posts: postsShortened, profile})
}

export const meta: MetaFunction = () => {
  return [
    {title: "Hailey's Cool Site"},
    {
      name: 'description',
      content:
        'react native, bluesky, nonsense, and maybe something serious (probably not)',
    },
  ]
}

export default function Index() {
  const {posts, profile} = useLoaderData<{
    posts: WhtwndBlogEntryView[]
    profile: AppBskyActorDefs.ProfileViewDetailed
  }>()

  return (
    <div className="container flex flex-col mx-auto pt-10 md:pt-20 pb-20 gap-10">
      <div className="flex-col text-center">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-20 pb-4 md:pb-8">
          {profile ? (
            <img
              className="rounded-full w-32 h-32"
              src={profile.avatar}
              alt="Hailey's avatar"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
          )}
          <h1 className="text-5xl md:text-6xl font-bold">It's Hailey! 👋</h1>
        </div>
        <p className="text-2xl text-theme-300">
          react native, bluesky, nonsense
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold">blog posts</h2>
        <ul className="list-none">
          {posts
            ?.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map(post => <PostItem post={post} key={post.rkey} />)}
        </ul>
      </div>
    </div>
  )
}

function PostItem({post}: {post: WhtwndBlogEntryView}) {
  return (
    <li>
      <div className="flex">
        <p>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
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
