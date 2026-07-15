// Central source of truth for enum-like values used throughout the app.
// Keep these in sync with CHECK constraints defined in the SQL migrations.

export const DIFFICULTY = ['Easy', 'Medium', 'Hard']

export const STATUS = ['Not Started', 'Attempted', 'Solved', 'Revision Needed', 'Mastered']

export const CONFIDENCE_LEVEL = ['Low', 'Medium', 'High']

export const PLATFORMS = [
  'LeetCode',
  'GeeksForGeeks',
  'HackerRank',
  'Coding Ninjas',
  'Codeforces',
  'InterviewBit',
  'Custom',
  'Other',
]

// Ordered by rough popularity; new languages can be appended without
// migrating existing data since `language` is stored as text with a
// CHECK constraint, not a foreign key to a closed table.
export const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
]

export const REVISION_RESULT = ['Failed', 'Struggled', 'Solved With Hint', 'Solved', 'Easy Recall']

export const DEFAULT_TOPICS = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack',
  'Queue',
  'Hashing',
  'Binary Search',
  'Trees',
  'Binary Trees',
  'Binary Search Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Recursion',
  'Sliding Window',
  'Two Pointers',
  'Heap',
  'Trie',
  'Bit Manipulation',
  'Mathematics',
  'Sorting',
  'Searching',
  'Prefix Sum',
  'Matrix',
  'Intervals',
  'Union Find',
  'Topological Sort',
  'Shortest Path',
]

export const DIFFICULTY_COLOR = {
  Easy: 'var(--color-easy)',
  Medium: 'var(--color-medium)',
  Hard: 'var(--color-hard)',
}

export const STATUS_COLOR = {
  'Not Started': 'text-text-muted',
  Attempted: 'text-warning',
  Solved: 'text-success',
  'Revision Needed': 'text-info',
  Mastered: 'text-accent',
}

export const PAGE_SIZE_OPTIONS = [25, 50, 100]
export const DEFAULT_PAGE_SIZE = 25

export const SEARCH_DEBOUNCE_MS = 400
