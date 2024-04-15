import {Links, Meta, Outlet, Scripts, ScrollRestoration} from '@remix-run/react'
import {LinksFunction} from '@remix-run/node'

import styles from './tailwind.css'

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
