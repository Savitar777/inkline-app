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
export const Bell = (p: IconProps) => <I2 {...p} paths={["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.94 1.94 0 0 0 3.4 0"]} />
export const Sparkles = (p: IconProps) => <I2 {...p} paths={["m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z", "M5 3v4", "M19 17v4", "M3 5h4", "M17 19h4"]} />

export const Google = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)
export const Shield = (p: IconProps) => <I {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
export const Users = (p: IconProps) => <I2 {...p} paths={["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} />
export const Settings = (p: IconProps) => <I2 {...p} paths={["M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"]} />
