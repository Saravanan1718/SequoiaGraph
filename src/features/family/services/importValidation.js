/**
 * Validation for bulk member import. Pure: parsed rows in, a report out.
 *
 * Severity model:
 *  - error   → row is skipped (e.g. missing name)
 *  - warning → row still imports, but the bad value is dropped/nulled
 */

const GENDERS = new Set(['male', 'female', 'other'])
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Format a Date using local components — toISOString() can shift the day across timezones. */
function localIso(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Parse a cell into an ISO date string, or null. Sets ok:false when present but unparseable. */
function toIsoDate(value) {
  if (value == null || value === '') return { date: null, ok: true }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { date: localIso(value), ok: true }
  }
  const str = String(value).trim()
  if (ISO_DATE.test(str)) return { date: str, ok: true }
  const parsed = new Date(str)
  if (!Number.isNaN(parsed.getTime())) return { date: localIso(parsed), ok: true }
  return { date: null, ok: false }
}

/** Fold contact-ish columns (no schema fields of their own) into notes. */
function buildNotes(row) {
  const lines = []
  if (row.notes) lines.push(row.notes)
  if (row.phone) lines.push(`Phone: ${row.phone}`)
  if (row.email) lines.push(`Email: ${row.email}`)
  if (row.birthPlace) lines.push(`Birth place: ${row.birthPlace}`)
  return lines.join('\n') || null
}

const dupKey = (name, birthDate) => `${name.toLowerCase()}|${birthDate ?? ''}`

/**
 * @param {Array<Object>} rows  parsed rows from importService.parseFile
 * @param {Array<import('@/shared/types/typedefs').Member>} existingMembers
 * @returns {{people: Array<Object>, errors: string[], warnings: string[]}}
 *   people = member drafts ready for familyStore.addMember
 */
export function validateRows(rows, existingMembers = []) {
  const errors = []
  const warnings = []
  const people = []
  const seen = new Set(existingMembers.map((m) => dupKey(m.name, m.birthDate)))

  for (const row of rows) {
    const name = String(row.name ?? '').trim()
    if (!name) {
      errors.push(`Row ${row.rowNumber}: missing name — skipped.`)
      continue
    }

    let gender = String(row.gender ?? '').trim().toLowerCase() || null
    if (gender && !GENDERS.has(gender)) {
      warnings.push(`Row ${row.rowNumber} (${name}): invalid gender "${row.gender}" — left blank.`)
      gender = null
    }

    const birth = toIsoDate(row.birthDate)
    if (!birth.ok) warnings.push(`Row ${row.rowNumber} (${name}): invalid DOB "${row.birthDate}" — left blank.`)
    else if (!birth.date) warnings.push(`Row ${row.rowNumber} (${name}): missing DOB.`)

    const death = toIsoDate(row.deathDate)
    if (!death.ok) warnings.push(`Row ${row.rowNumber} (${name}): invalid death date "${row.deathDate}" — left blank.`)
    else if (birth.date && death.date && death.date < birth.date) {
      warnings.push(`Row ${row.rowNumber} (${name}): death date is before DOB — left blank.`)
      death.date = null
    }

    const key = dupKey(name, birth.date)
    if (seen.has(key)) warnings.push(`Row ${row.rowNumber}: duplicate name "${name}".`)
    seen.add(key)

    people.push({
      name,
      gender,
      birthDate: birth.date,
      deathDate: death.date,
      occupation: String(row.occupation ?? '').trim() || null,
      notes: buildNotes(row),
    })
  }

  return { people, errors, warnings }
}
