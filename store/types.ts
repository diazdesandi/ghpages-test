export interface ComparisonOptions {
  /** Make all text lowercase for comparison */
  caseSensitive: boolean
  /** Remove extra whitespace */
  normalizeWhitespace: boolean
  /** Columns to merge (e.g., ['manufacturer', 'model'] -> 'device') */
  mergeColumns?: {
    sourceColumns: string[]
    targetColumn: string
    separator?: string
  }[]
} 