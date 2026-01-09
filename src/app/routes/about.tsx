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
    <div className="container flex flex-col mx-auto pt-10 md:pt-20 pb-20 gap-12">
      <div className="flex flex-col text-center gap-3">
        <h1 className="text-5xl md:text-6xl font-bold text-950">About</h1>
      </div>

      <div className="flex flex-col gap-4 text-xl text-900 leading-relaxed">
        <p>
          Software engineer, previously at Bluesky. These days I'm mostly
          interested in online safety tooling, AT Protocol, and other social
          media stuff. Sometimes I write about it here.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-950">Work</h2>
        <ul className="flex flex-col gap-2">
          <WorkItem
            company="Bluesky"
            href="https://bsky.social"
            role="Safety, Product (React Native)"
            period="Jan 2024 – Dec 2025"
          />
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-950">Projects</h2>
        <ul className="flex flex-col gap-3">
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
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-950">Elsewhere</h2>
        <ul className="flex flex-col gap-2">
          <LinkItem name="GitHub" href="https://github.com/haileyok" />
          <LinkItem name="Bluesky" href="https://bsky.app/profile/hailey.at" />
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-950">Contact</h2>
        <ul className="flex flex-col gap-2">
          <ContactItem label="Email" value="me@haileyok.com" />
          <ContactItem label="Discord" value="haileyok" />
          <ContactItem label="Signal" value="haileyok.01" />
        </ul>
      </div>
    </div>
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
    <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
      <a
        href={href}
        target="_blank"
        className="text-lg text-950 font-medium hover:text-600 transition-colors">
        {company}
      </a>
      <span className="text-500 text-sm hidden sm:inline">—</span>
      <span className="text-900">{role}</span>
      <span className="text-500 text-sm font-mono sm:ml-auto">{period}</span>
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
      <a href={href} className="group flex flex-col gap-1" target="_blank">
        <span className="text-lg text-900 group-hover:text-600 transition-colors">
          {name}
        </span>
        <span className="text-500 text-sm">{description}</span>
      </a>
    </li>
  )
}

function LinkItem({name, href}: {name: string; href: string}) {
  return (
    <li>
      <a
        href={href}
        className="text-900 hover:text-600 transition-colors"
        target="_blank">
        {name}
      </a>
    </li>
  )
}

function ContactItem({label, value}: {label: string; value: string}) {
  return (
    <li className="flex gap-3">
      <span className="text-500 w-16">{label}</span>
      <span className="text-900">{value}</span>
    </li>
  )
}
