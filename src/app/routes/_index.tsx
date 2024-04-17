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

  const postsShortened = posts.map((p) => {
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
    <div className="container mx-auto pt-10 md:pt-20 pb-20">
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
      <div className="flex flex-col gap-4 pt-14">
        {posts?.map(post => <PostItem post={post} key={post.rkey} />)}
      </div>
    </div>
  )
}

function PostContainer({children}: {children: React.ReactNode}) {
  return (
    <div className="flex border-1 rounded-md border-theme-900 p-4">
      {children}
    </div>
  )
}

function PostItem({post}: {post: WhtwndBlogEntryView}) {
  return (
    <PostContainer>
      <div className="flex flex-col w-full gap-2">
        <a
          className="text-2xl md:text-3xl font-bold hover:underline"
          href={`/posts/${post.rkey}`}>
          <h2>{post.title}</h2>
        </a>
        <Markdown
          disallowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'img']}
          className="text-theme-300 line-clamp-3">
          {post.content}
        </Markdown>
      </div>
    </PostContainer>
  )
}
