import type { Profile } from '../context/AuthContext'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-16 h-16 text-lg',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'I'
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')
}

interface Props {
  profile: Pick<Profile, 'name' | 'avatar_url'>
  size?: AvatarSize
}

export default function ProfileAvatar({ profile, size = 'md' }: Props) {
  const frameClass = sizeClasses[size]

  if (profile.avatar_url) {
    return (
      <div className={`${frameClass} rounded-full border border-ink-gold/30 bg-ink-panel overflow-hidden shrink-0`}>
        <img
          src={profile.avatar_url}
          alt={`${profile.name} avatar`}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`${frameClass} rounded-full border border-ink-gold/30 bg-ink-gold/10 text-ink-gold font-sans font-semibold flex items-center justify-center shrink-0`}>
      {getInitials(profile.name)}
    </div>
  )
}
