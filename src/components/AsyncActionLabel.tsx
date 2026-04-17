import { memo } from 'react'

interface AsyncActionLabelProps {
  loading: boolean
  idleLabel: string
  loadingLabel: string
}

function AsyncActionLabel({ loading, idleLabel, loadingLabel }: AsyncActionLabelProps) {
  if (!loading) return <>{idleLabel}</>

  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      <span>{loadingLabel}</span>
    </span>
  )
}

export default memo(AsyncActionLabel)
