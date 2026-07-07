/**
 * Central JSDoc type definitions. Import for IDE intellisense:
 *   /** @type {import('@/shared/types/typedefs').Member} *​/
 */

/**
 * @typedef {Object} Member
 * @property {string} id
 * @property {string} name
 * @property {'male'|'female'|'other'|null} gender
 * @property {string|null} photoUrl
 * @property {string|null} birthDate  ISO date (YYYY-MM-DD)
 * @property {string|null} deathDate  ISO date (YYYY-MM-DD)
 * @property {string|null} occupation
 * @property {string|null} notes
 * @property {number} posX  graph-canvas x
 * @property {number} posY  graph-canvas y
 */

/**
 * Directed relationship row. For 'parent' | 'adopted' | 'guardian',
 * fromId is the parent-figure and toId the child. 'spouse' is symmetric
 * (one row per couple). Siblings are DERIVED from shared parents, never stored.
 *
 * @typedef {Object} Relationship
 * @property {string} id
 * @property {string} fromId
 * @property {string} toId
 * @property {'parent'|'spouse'|'adopted'|'guardian'} type
 */

export {}
