import { memo } from 'react'
import { Google } from '../icons'
import AsyncActionLabel from './AsyncActionLabel'

interface Props {
  onClick: () => void
  loading: boolean
  disabled: boolean
  mode: 'signin' | 'signup'
}

/**
 * Google-branded sign-in/sign-up button following Google Identity branding guidelines.
 * Dark theme variant: #131314 background, #8E918F border, white icon container.
 * @see https://developers.google.com/identity/branding-guidelines
 */
function GoogleAuthButton({ onClick, loading, disabled, mode }: Props) {
  const label = mode === 'signin'
    ? 'Sign in with Google'
    : 'Sign up with Google'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full h-10 flex items-center rounded-full border border-[#747775] bg-[#131314] hover:bg-[#131314]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      style={{ fontFamily: "'Roboto', Arial, sans-serif" }}
    >
      {/* Icon container — white background per Google spec */}
      <span className="shrink-0 w-10 h-10 flex items-center justify-center">
        <span className="w-5 h-5 flex items-center justify-center">
          <Google size={20} />
        </span>
      </span>

      {/* Label */}
      <span className="flex-1 text-sm font-medium text-[#E3E3E3] tracking-[0.25px] pr-4 text-center">
        <AsyncActionLabel loading={loading} idleLabel={label} loadingLabel="Redirecting…" />
      </span>
    </button>
  )
}

export default memo(GoogleAuthButton)
