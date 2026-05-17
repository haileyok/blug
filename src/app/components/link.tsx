import React from 'react'

export function Link({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      className={
        className ??
        'text-600 hover:text-700 underline underline-offset-2 decoration-from-font transition-colors'
      }
      href={href}>
      {children}
    </a>
  )
}
