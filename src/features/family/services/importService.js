import * as XLSX from 'xlsx'

/**
 * Spreadsheet parsing for bulk member import (people only).
 * Pure functions: File in, plain row objects out. No store or network access —
 * persistence stays in the familyStore → memberService pipeline.
 */

/** Template columns, in order. Extra columns in uploads are ignored. */
export const TEMPLATE_COLUMNS = [
  'Name',
  'Gender',
  'DOB',
  'Occupation',
  'Phone',
  'Email',
  'Birth Place',
  'Death Date',
  'Notes',
]

/** Header aliases → canonical field key (headers are normalized first). */
const HEADER_MAP = {
  name: 'name',
  fullname: 'name',
  gender: 'gender',
  sex: 'gender',
  dob: 'birthDate',
  birthdate: 'birthDate',
  dateofbirth: 'birthDate',
  occupation: 'occupation',
  phone: 'phone',
  phonenumber: 'phone',
  email: 'email',
  birthplace: 'birthPlace',
  placeofbirth: 'birthPlace',
  deathdate: 'deathDate',
  dateofdeath: 'deathDate',
  dod: 'deathDate',
  notes: 'notes',
}

const normalizeHeader = (h) => String(h).toLowerCase().replace(/[^a-z]/g, '')

/**
 * Parse an .xlsx or .csv file into raw import rows.
 * @param {File} file
 * @returns {Promise<Array<Object>>} rows keyed by canonical field, plus rowNumber
 */
export async function parseFile(file) {
  const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []

  // raw + cellDates → date cells arrive as Date objects with correct local
  // components (formatted strings are lossy, e.g. two-digit years)
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  return rawRows.map((raw, i) => {
    const row = { rowNumber: i + 2 } // +2: 1-based, after the header row
    for (const [header, value] of Object.entries(raw)) {
      const field = HEADER_MAP[normalizeHeader(header)]
      if (field) row[field] = typeof value === 'string' ? value.trim() : value
    }
    return row
  })
}

/** Build and download an .xlsx template with headers and one example row. */
export function downloadTemplate() {
  const example = {
    Name: 'Jane Doe',
    Gender: 'female',
    DOB: '1954-03-21',
    Occupation: 'Teacher',
    Phone: '+1 555 0100',
    Email: 'jane@example.com',
    'Birth Place': 'Chennai',
    'Death Date': '',
    Notes: 'Loved gardening',
  }
  const sheet = XLSX.utils.json_to_sheet([example], { header: TEMPLATE_COLUMNS })
  sheet['!cols'] = TEMPLATE_COLUMNS.map((c) => ({ wch: Math.max(c.length + 2, 14) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Members')
  XLSX.writeFile(workbook, 'kingraph-import-template.xlsx')
}
