const formatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

/** @param {string|null} isoDate */
export function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  return Number.isNaN(d.getTime()) ? '' : formatter.format(d)
}

/** "1950 – 2020" | "b. 1950" | "" */
export function lifespan(birthDate, deathDate) {
  const b = birthDate?.slice(0, 4)
  const d = deathDate?.slice(0, 4)
  if (b && d) return `${b} – ${d}`
  if (b) return `b. ${b}`
  if (d) return `d. ${d}`
  return ''
}

/** Age at death, or current age. Null when unknown. */
export function age(birthDate, deathDate) {
  if (!birthDate) return null
  const end = deathDate ? new Date(deathDate) : new Date()
  const start = new Date(birthDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  let years = end.getFullYear() - start.getFullYear()
  const beforeBirthday =
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
  if (beforeBirthday) years -= 1
  return years >= 0 ? years : null
}
