import Papa from 'papaparse'
import { supabase } from '../lib/supabase'
import { DIFFICULTY, PLATFORMS, STATUS, LANGUAGES } from '../constants'

const BATCH_SIZE = 200

/** Parses a CSV File/string into an array of plain objects using the header row as keys. */
export function parseCSV(fileOrText) {
  return new Promise((resolve, reject) => {
    Papa.parse(fileOrText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

/** Parses a JSON File/string into an array of question objects. */
export async function parseJSON(fileOrText) {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text()
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) {
    throw new Error('JSON import must be an array of question objects.')
  }
  return parsed
}

/**
 * Validates raw parsed rows before they're sent to the server. Returns
 * { valid, invalid } where invalid entries carry a reason so the import
 * preview can explain exactly what's wrong before anything is inserted.
 */
export function validateImport(rows) {
  const valid = []
  const invalid = []

  rows.forEach((row, index) => {
    const reasons = []
    const title = (row.title ?? '').toString().trim()

    if (!title) reasons.push('Missing title')
    if (row.difficulty && !DIFFICULTY.includes(row.difficulty)) {
      reasons.push(`Unrecognized difficulty "${row.difficulty}" (defaults to Medium)`)
    }
    if (row.platform && !PLATFORMS.includes(row.platform)) {
      reasons.push(`Unrecognized platform "${row.platform}" (defaults to Other)`)
    }
    if (row.status && !STATUS.includes(row.status)) {
      reasons.push(`Unrecognized status "${row.status}" (defaults to Not Started)`)
    }
    if (row.language && !LANGUAGES.includes(row.language)) {
      reasons.push(`Unrecognized language "${row.language}" (defaults to JavaScript)`)
    }

    // Hard failures (no title) go to invalid; everything else is a soft
    // warning — the row still imports with a normalized fallback value.
    if (!title) {
      invalid.push({ row: index + 1, data: row, reasons })
    } else {
      valid.push({ row: index + 1, data: row, warnings: reasons })
    }
  })

  return { valid, invalid }
}

/** Normalizes a raw row (from CSV or JSON) into the shape bulk_import_questions expects. */
export function normalizeImportRow(row) {
  const topics = row.topics
    ? Array.isArray(row.topics)
      ? row.topics
      : String(row.topics).split(/[,|]/).map((t) => t.trim()).filter(Boolean)
    : []

  return {
    title: (row.title ?? '').toString().trim(),
    difficulty: row.difficulty ?? 'Medium',
    platform: row.platform ?? 'Other',
    problem_url: row.problem_url ?? row.url ?? null,
    status: row.status ?? 'Not Started',
    description: row.description ?? null,
    language: row.language ?? null,
    code: row.code ?? null,
    approach: row.approach ?? null,
    time_complexity: row.time_complexity ?? null,
    space_complexity: row.space_complexity ?? null,
    topics,
  }
}

/**
 * Imports questions in batches of BATCH_SIZE via the bulk_import_questions
 * RPC (one round trip per batch, not per row — a 2,000-row import is ~10
 * requests). Calls onProgress after every batch so the UI can show a
 * running total.
 */
export async function bulkImportQuestions(rows, { onProgress } = {}) {
  const normalized = rows.map(normalizeImportRow)
  const totals = { success: 0, failed: 0, skipped_duplicates: 0, errors: [] }

  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabase.rpc('bulk_import_questions', { p_items: batch })
    if (error) throw error

    totals.success += data.success
    totals.failed += data.failed
    totals.skipped_duplicates += data.skipped_duplicates
    totals.errors.push(...(data.errors ?? []))

    onProgress?.({
      processed: Math.min(i + BATCH_SIZE, normalized.length),
      total: normalized.length,
      totals: { ...totals },
    })
  }

  return totals
}

export const CSV_TEMPLATE_HEADER =
  'title,difficulty,platform,problem_url,status,description,topics,language,code,approach,time_complexity,space_complexity'

export const CSV_TEMPLATE_EXAMPLE_ROW =
  'Two Sum,Easy,LeetCode,https://leetcode.com/problems/two-sum/,Solved,,"Arrays,Hashing",JavaScript,"function twoSum(nums, target) {}",Use a hash map,O(n),O(n)'
