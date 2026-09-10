import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const ICONS: Record<string, React.ReactNode> = {
  nodes: (
    <>
      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="5" r="2" /><circle cx="12" cy="19" r="2" />
      <circle cx="5" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
      <line x1="12" y1="7" x2="12" y2="9" /><line x1="12" y1="15" x2="12" y2="17" />
      <line x1="7" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="17" y2="12" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" />
    </>
  ),
  shield: <path d="M3 12V6l9-4 9 4v6c0 5-3.5 9.5-9 11-5.5-1.5-9-6-9-11z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  cloud: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
}

export function Icon({ name, ...rest }: { name?: string } & P) {
  const glyph = (name && ICONS[name]) || ICONS.nodes
  return <svg {...base} {...rest}>{glyph}</svg>
}
