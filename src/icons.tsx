// Simple SVG icon components — no hooks, no external deps

interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number
}

const I = ({ size = 24, className = '', strokeWidth = 2, d }: IconProps & { d: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const I2 = ({ size = 24, className = '', strokeWidth = 2, paths }: IconProps & { paths: string[] }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

export const PenLine = (p: IconProps) => <I2 {...p} paths={["M12 20h9", "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"]} />
export const MessageSquare = (p: IconProps) => <I {...p} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
export const Layers = (p: IconProps) => <I2 {...p} paths={["M12 2 2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"]} />
export const User = (p: IconProps) => <I2 {...p} paths={["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"]} />
export const ChevronDown = (p: IconProps) => <I {...p} d="m6 9 6 6 6-6" />
export const ChevronRight = (p: IconProps) => <I {...p} d="m9 18 6-6-6-6" />
export const ChevronLeft = (p: IconProps) => <I {...p} d="m15 18-6-6 6-6" />
export const BookOpen = (p: IconProps) => <I2 {...p} paths={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} />
export const FileText = (p: IconProps) => <I2 {...p} paths={["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", "M14 2v4a2 2 0 0 0 2 2h4", "M10 9H8", "M16 13H8", "M16 17H8"]} />
export const SquareStack = (p: IconProps) => <I2 {...p} paths={["M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2", "M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2", "M16 22c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2z"]} />
export const MessageCircle = (p: IconProps) => <I {...p} d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
export const Quote = (p: IconProps) => <I2 {...p} paths={["M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2z", "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4z"]} />
export const Volume2 = (p: IconProps) => <I2 {...p} paths={["M11 5 6 9H2v6h4l5 4z", "M15.54 8.46a5 5 0 0 1 0 7.07", "M19.07 4.93a10 10 0 0 1 0 14.14"]} />
export const Send = (p: IconProps) => <I2 {...p} paths={["m22 2-7 20-4-9-9-4z", "M22 2 11 13"]} />
export const Plus = (p: IconProps) => <I2 {...p} paths={["M5 12h14", "M12 5v14"]} />
export const Grip = (p: IconProps) => <I2 {...p} paths={["M9 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M9 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"]} />
export const Eye = (p: IconProps) => <I2 {...p} paths={["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />
export const Swords = (p: IconProps) => <I2 {...p} paths={["M14.5 17.5 3 6V3h3l11.5 11.5", "M13 19l6-6", "M16 16l4 4", "M19 21l2-2", "M14.5 6.5 18 3h3v3l-3.5 3.5", "M5 14l4 4", "M7 17l-3 3", "M3 19l2 2"]} />
export const Paperclip = (p: IconProps) => <I {...p} d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
export const Image = (p: IconProps) => <I2 {...p} paths={["M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "m21 15-5-5L5 21"]} />
export const Circle = (p: IconProps) => <I {...p} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
export const CheckCircle2 = (p: IconProps) => <I2 {...p} paths={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "m9 12 2 2 4-4"]} />
export const Clock = (p: IconProps) => <I2 {...p} paths={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"]} />
export const Palette = (p: IconProps) => <I {...p} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
export const Download = (p: IconProps) => <I2 {...p} paths={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "m7 10 5 5 5-5", "M12 15V3"]} />
export const Check = (p: IconProps) => <I {...p} d="M20 6 9 17l-5-5" />
export const AlertCircle = (p: IconProps) => <I2 {...p} paths={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 8v4", "M12 16h.01"]} />
export const ArrowRight = (p: IconProps) => <I2 {...p} paths={["M5 12h14", "m12 5 7 7-7 7"]} />
export const Monitor = (p: IconProps) => <I2 {...p} paths={["M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z", "M8 21h8", "M12 17v4"]} />
export const Smartphone = (p: IconProps) => <I2 {...p} paths={["M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z", "M12 18h.01"]} />
export const ScrollText = (p: IconProps) => <I2 {...p} paths={["M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4", "M19 3H8a2 2 0 0 0-2 2v14", "M12 8h8", "M12 12h8", "M12 16h4"]} />
export const FileDown = (p: IconProps) => <I2 {...p} paths={["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", "M14 2v4a2 2 0 0 0 2 2h4", "M12 18v-6", "m9 15 3 3 3-3"]} />
export const Trash2 = (p: IconProps) => <I2 {...p} paths={["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", "M10 11v6", "M14 11v6"]} />
export const X = (p: IconProps) => <I2 {...p} paths={["M18 6 6 18", "m6 6 12 12"]} />
export const Pencil = (p: IconProps) => <I2 {...p} paths={["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z", "m15 5 4 4"]} />
export const GripVertical = (p: IconProps) => <I2 {...p} paths={["M9 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M9 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"]} />
export const Upload = (p: IconProps) => <I2 {...p} paths={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "m17 8-5-5-5 5", "M12 3v12"]} />
export const Search = (p: IconProps) => <I2 {...p} paths={["m21 21-4.35-4.35", "a7 7 0 1 1-9.9-9.9 7 7 0 0 1 9.9 9.9z"]} />
