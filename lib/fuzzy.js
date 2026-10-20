/**
 * Substring-style fuzzy matching for the category and tag autocomplete.
 *
 * Subsequence rather than edit distance on purpose: someone typing "exp" should
 * see "Express", and someone typing "eng" should see "Engineering". A Levenshtein
 * score would miss both — the letters are in order, just with others between
 * them.
 */

// Above this, the query matches too loosely to be useful and the list stops
// being a suggestion.
export const FUZZY_MAX_SCORE = 0.72

/**
 * Scores how well `query` matches `candidate`, or null for no match.
 *
 * Lower is better. Returns 0 for an exact match (ignoring case) so a precise
 * entry always sorts above a merely plausible one.
 *
 * Scoring rewards matches at word starts and consecutive runs, so "nw" ranks
 * "nextjs" above a scattered match across an unrelated word.
 */
export function fuzzyScore(query, candidate) {
  const needle = query.trim().toLowerCase()
  if (!needle) return 0
  if (!candidate) return null

  const haystack = candidate.toLowerCase()
  if (haystack === needle) return 0
  if (haystack.startsWith(needle)) return 0.05

  const directIndex = haystack.indexOf(needle)
  if (directIndex !== -1) {
    // Contiguous, so cost grows with how far in it starts.
    return 0.1 + (directIndex / haystack.length) * 0.2
  }

  let score = 0.5
  let needleIndex = 0

  for (let index = 0; index < haystack.length && needleIndex < needle.length; index++) {
    if (haystack[index] !== needle[needleIndex]) continue

    const previous = haystack[index - 1]
    // A run of matching letters is worth more than the same letters scattered.
    if (previous !== undefined && haystack[index - 1] === needle[needleIndex - 1]) {
      score -= 0.05
    }
    // Landing on a word boundary is a strong hint this is what was meant.
    if (index === 0 || previous === " " || previous === "-" || previous === "_") {
      score -= 0.08
    }

    needleIndex++
  }

  if (needleIndex < needle.length) return null

  // Prefer shorter candidates: "api" is a better guess than "api-in-production".
  return Math.max(0, Math.min(FUZZY_MAX_SCORE, score))
}

/**
 * Filters and ranks `items` by `query`, keeping only what matches.
 *
 * `getLabel` keeps this usable for both the strings the API returns and the
 * objects the form actually holds.
 */
export function fuzzyFilter(items, query, getLabel = (item) => item) {
  const trimmed = query.trim()
  if (!trimmed) return items

  return items
    .map((item) => ({ item, score: fuzzyScore(trimmed, getLabel(item)) }))
    .filter((entry) => entry.score !== null && entry.score <= FUZZY_MAX_SCORE)
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.item)
}