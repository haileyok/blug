import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react'
import {LinksFunction} from '@remix-run/node'

import styles from './tailwind.css'
import {Link} from './components/link'

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}]

export function Layout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hailey's Cool Site</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex justify-center gap-4 pb-4">
          <NavLink href="/" selected={false}>
            Home
          </NavLink>
          <NavLink
            href="https://bsky.app/profile/haileyok.com"
            selected={false}>
            Bluesky
          </NavLink>
          <NavLink href="https://github.com/haileyok" selected={false}>
            GitHub
          </NavLink>
        </div>
        <div className="flex justify-center gap-4 pb-4">{children}</div>
        <footer>
          <div className="container mx-auto text-center text-theme-300 py-4">
            <p>
              Made with <Link href="https://remix.run/">Remix</Link>,{' '}
              <Link href="https://tailwindcss.com/">Tailwind</Link>, and{' '}
              <Link href="https://atproto.com/">ATProtocol</Link>. Find it{' '}
              <Link href="https://github.com/haileyok/blug">on GitHub</Link>.
            </p>
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
  const topClassName = selected ? 'h-1 bg-theme-50' : 'h-1'
  const className = selected ? 'text-theme-50' : 'text-theme-300'

  return (
    <a href={href}>
      <div className={topClassName} />
      <p className={`p-3 ${className}`}>{children}</p>
    </a>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)
  return (
    <div className="container mZx-auto pt-10 md:pt-20 pb-20">
      <h1 className="text-5xl md:text-6xl font-bold text-center">
        Uh...something went wrong.
      </h1>
      <div className="p-10">
        <img
          src="/public/monkey.jpg"
          alt="Monkey muppet meme image"
          className="rounded-md"
        />
      </div>
    </div>
  )
}
