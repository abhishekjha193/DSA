export const MONACO_LANGUAGE_MAP = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  C: 'c',
  'C++': 'cpp',
  'C#': 'csharp',
  Go: 'go',
  Rust: 'rust',
}

export function toMonacoLanguage(language) {
  return MONACO_LANGUAGE_MAP[language] ?? 'plaintext'
}
