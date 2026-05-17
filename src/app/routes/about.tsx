import {MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: "About | Hailey's Cool Site"},
    {
      name: 'description',
      content:
        'About Hailey — software engineer focused on online safety and better social',
    },
  ]
}

export default function About() {
  return (
    <div className="container mx-auto pt-16 md:pt-28 pb-24">
      <section className="grid md:grid-cols-12 gap-8 md:gap-12 mb-20">
        <div className="md:col-span-8">
          <p className="label mb-5">About</p>
          <h1 className="font-display tracking-tightest text-950 text-5xl md:text-7xl leading-[0.95]">
            Hi, I'm{' '}
            <em
              className="font-display italic text-600"
              style={{
                fontVariationSettings:
                  "'opsz' 144, 'SOFT' 100, 'wght' 400",
              }}>
              Hailey
            </em>
            .
          </h1>
        </div>
        <div className="md:col-span-4 md:pt-4">
          <p className="font-serif text-lg leading-relaxed text-900 max-w-prose">
            Just a person interested in engineering, safety tooling, AT
            Protocol, and agentic systems. Sometimes I write about it here.
          </p>
        </div>
      </section>

      <Section label="Work">
        <WorkItem
          company="Discord"
          href="https://discord.com"
          role="Safety Engineering"
          period="Feb 2026 — Present"
        />
        <WorkItem
          company="Attie.ai (Bluesky)"
          href="https://attie.ai"
          role="Exploration, Agentic Product Engineering"
          period="Jan 2026 — Feb 2026"
        />
        <WorkItem
          company="Bluesky"
          href="https://bsky.social"
          role="Safety Engineering, Product (React Native)"
          period="Jan 2024 — Dec 2025"
        />
      </Section>

      <Section label="Community">
        <WorkItem
          company="ROOST"
          href="https://roost.tools"
          role="Technical Design Committee"
          period="Dec 2025 — Present"
        />
      </Section>

      <Section label="Projects">
        <ProjectItem
          name="Osprey"
          description="High-performance safety rules engine for real-time event processing at scale."
          href="https://github.com/roostorg/osprey"
        />
        <ProjectItem
          name="victrola"
          description="A self-modifying, TUI and Discord-facing, AI agent harness with parallel tool calling"
          href="https://github.com/haileyok/victrola"
        />
        <ProjectItem
          name="cocoon"
          description="ATProto PDS, written in Go"
          href="https://github.com/haileyok/cocoon"
        />
        <ProjectItem
          name="react-native-uitextview"
          description="UITextView for React Native with full text selection"
          href="https://github.com/bluesky-social/react-native-uitextview"
        />
      </Section>

      <Section label="Elsewhere">
        <LinkItem name="GitHub" href="https://github.com/haileyok" />
        <LinkItem name="Bluesky" href="https://bsky.app/profile/hailey.at" />
      </Section>

      <Section label="Contact">
        <ContactItem label="Email" value="me@haileyok.com" />
        <ContactItem label="Discord" value="haileyok" />
        <ContactItem label="Signal" value="haileyok.01" />
      </Section>
    </div>
  )
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="grid md:grid-cols-12 gap-4 md:gap-12 py-8 border-t border-100">
      <div className="md:col-span-3 md:pt-1">
        <h2 className="label">{label}</h2>
      </div>
      <ul className="md:col-span-9 flex flex-col gap-4">{children}</ul>
    </section>
  )
}

function WorkItem({
  company,
  href,
  role,
  period,
}: {
  company: string
  href: string
  role: string
  period: string
}) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 group">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-display text-xl tracking-tightest text-950 group-hover:text-600 transition-colors">
        {company}
      </a>
      <span className="text-400 text-sm hidden sm:inline">·</span>
      <span className="text-900 font-serif">{role}</span>
      <span className="text-500 text-xs font-mono uppercase tracking-wider sm:ml-auto">
        {period}
      </span>
    </li>
  )
}

function ProjectItem({
  name,
  description,
  href,
}: {
  name: string
  description: string
  href: string
}) {
  return (
    <li>
      <a
        href={href}
        className="group flex flex-col gap-1 -mx-3 px-3 py-2 rounded-md hover:bg-50 transition-colors"
        target="_blank"
        rel="noreferrer">
        <span className="font-display text-xl tracking-tightest text-950 group-hover:text-600 transition-colors flex items-center gap-2">
          {name}
          <span className="text-400 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            ↗
          </span>
        </span>
        <span className="text-500 text-sm leading-relaxed">{description}</span>
      </a>
    </li>
  )
}

function LinkItem({name, href}: {name: string; href: string}) {
  return (
    <li>
      <a
        href={href}
        className="font-display text-xl text-900 hover:text-600 transition-colors inline-flex items-center gap-2 group"
        target="_blank"
        rel="noreferrer">
        {name}
        <span className="text-400 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          ↗
        </span>
      </a>
    </li>
  )
}

function ContactItem({label, value}: {label: string; value: string}) {
  return (
    <li className="flex items-baseline gap-4">
      <span className="text-500 w-20 text-xs font-mono uppercase tracking-wider">
        {label}
      </span>
      <span className="text-900 font-mono text-sm">{value}</span>
    </li>
  )
}
