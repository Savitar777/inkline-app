const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatShortTime(value: string | number | Date): string {
  return timeFormatter.format(new Date(value))
}

export function formatShortDate(value: string | number | Date): string {
  return dateFormatter.format(new Date(value))
}
