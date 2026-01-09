import React from 'react'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import {json, LinksFunction} from '@remix-run/node'
import styles from './tailwind.css?url'
import {getProfile} from 'src/atproto'
import {AppBskyActorDefs} from '@atproto/api'

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: styles},
  {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap',
    rel: 'stylesheet',
  },
]

export const loader = async () => {
  const profile = await getProfile()
  return json({profile})
}

export function Layout({children}: {children: React.ReactNode}) {
  const {profile} = useLoaderData<{
    profile: AppBskyActorDefs.ProfileViewDetailed
  }>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script async src="https://embed.bsky.app/static/embed.js" />
      </head>
      <body className="flex flex-col h-screen justify-between bg-0 text-900 antialiased">
        <div>
          <header className="flex justify-between mx-auto max-w-7xl pt-4 px-4">
            <div className="flex gap-2">
              {profile ? (
                <a href="/">
                  <img
                    className="rounded-full w-14 h-14"
                    src={profile.avatar}
                    alt="Hailey's avatar"
                  />
                </a>
              ) : (
                <div className="w-14 h-14 bg-100 rounded-full"></div>
              )}
            </div>
            <nav className="flex gap-2">
              <NavLink href="/" selected={false}>
                Blog
              </NavLink>
              <NavLink href="/about" selected={false}>
                About
              </NavLink>
              <NavLink
                href="https://bsky.app/profile/haileyok.com"
                selected={false}>
                Bluesky
              </NavLink>
              <NavLink href="https://github.com/haileyok" selected={false}>
                GitHub
              </NavLink>
            </nav>
          </header>
          <main>{children}</main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

function NavLink({
  href,
  selected,
  children,
}: {
  href: string
  selected: boolean
  children: string
}) {
  const topClassName = selected ? 'h-1 bg-600' : 'h-1'
  const textClassName = selected ? 'text-600' : 'text-500 hover:text-950'

  return (
    <a href={href} className="transition-colors">
      <div className={topClassName} />
      <p className={`p-3 ${textClassName}`}>{children}</p>
    </a>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-0 text-900 antialiased">
        <div className="container mx-auto pt-10 md:pt-20 pb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-center text-950">
            Uh...something went wrong.
          </h1>
          <div className="p-10 flex justify-center">
            <img
              src="/monkey.jpg"
              alt="Monkey muppet meme image"
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
