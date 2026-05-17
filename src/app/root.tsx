import React from 'react'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
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
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..700,0..100&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=JetBrains+Mono:wght@400;500&display=swap',
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
  const location = useLocation()

  const isOn = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script async src="https://embed.bsky.app/static/embed.js" />
      </head>
      <body className="flex flex-col min-h-screen justify-between bg-0 text-900 antialiased font-serif">
        <div>
          <header className="mx-auto max-w-7xl pt-6 px-6">
            <div className="flex items-center justify-between gap-4 border-b border-100 pb-5">
              <a href="/" className="flex items-center gap-3 group">
                {profile ? (
                  <img
                    className="rounded-full w-11 h-11 ring-1 ring-200 group-hover:ring-600 transition-all"
                    src={profile.avatar}
                    alt="Hailey's avatar"
                  />
                ) : (
                  <div className="w-11 h-11 bg-100 rounded-full" />
                )}
                <span className="font-display text-xl tracking-tightest text-950 hidden sm:inline">
                  hailey<span className="text-600">.</span>
                </span>
              </a>
              <nav className="flex items-center gap-1 sm:gap-2">
                <NavLink href="/" selected={isOn('/') && location.pathname === '/'}>
                  Writing
                </NavLink>
                <NavLink href="/about" selected={isOn('/about')}>
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
            </div>
          </header>
          <main>{children}</main>
        </div>
        <footer className="mx-auto max-w-7xl w-full px-6 pb-6 pt-12">
          <div className="border-t border-100 pt-5 flex items-center justify-between text-sm">
            <span className="label">Made on AT Protocol</span>
            <a
              href="https://github.com/haileyok/blug"
              className="text-500 hover:text-600 transition-colors font-mono text-xs">
              source ↗
            </a>
          </div>
        </footer>
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
  const textClass = selected
    ? 'text-950'
    : 'text-500 hover:text-900'
  const underlineClass = selected
    ? 'bg-600'
    : 'bg-transparent group-hover:bg-300'

  return (
    <a href={href} className="group inline-flex flex-col px-2 py-1">
      <span className={`font-sans text-sm transition-colors ${textClass}`}>
        {children}
      </span>
      <span
        className={`mt-1 h-px w-full transition-colors ${underlineClass}`}
      />
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
      <body className="bg-0 text-900 antialiased font-serif">
        <div className="container mx-auto pt-10 md:pt-20 pb-20 text-center">
          <p className="label mb-6">Error</p>
          <h1 className="font-display text-5xl md:text-7xl tracking-tightest text-950">
            Something broke.
          </h1>
          <div className="p-10 flex justify-center">
            <img
              src="/monkey.jpg"
              alt="Monkey muppet meme image"
              className="rounded-lg shadow-2xl shadow-black/40 max-w-sm"
            />
          </div>
          <a
            href="/"
            className="inline-block font-mono text-xs text-600 hover:text-700 transition-colors">
            ← back to writing
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
