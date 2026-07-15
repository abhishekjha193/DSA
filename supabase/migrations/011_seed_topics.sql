-- Seeds the default DSA topic taxonomy. Safe to re-run: unique(name)
-- means a second run just no-ops via ON CONFLICT.

insert into public.topics (name, slug) values
  ('Arrays', public.slugify('Arrays')),
  ('Strings', public.slugify('Strings')),
  ('Linked List', public.slugify('Linked List')),
  ('Stack', public.slugify('Stack')),
  ('Queue', public.slugify('Queue')),
  ('Hashing', public.slugify('Hashing')),
  ('Binary Search', public.slugify('Binary Search')),
  ('Trees', public.slugify('Trees')),
  ('Binary Trees', public.slugify('Binary Trees')),
  ('Binary Search Trees', public.slugify('Binary Search Trees')),
  ('Graphs', public.slugify('Graphs')),
  ('Dynamic Programming', public.slugify('Dynamic Programming')),
  ('Greedy', public.slugify('Greedy')),
  ('Backtracking', public.slugify('Backtracking')),
  ('Recursion', public.slugify('Recursion')),
  ('Sliding Window', public.slugify('Sliding Window')),
  ('Two Pointers', public.slugify('Two Pointers')),
  ('Heap', public.slugify('Heap')),
  ('Trie', public.slugify('Trie')),
  ('Bit Manipulation', public.slugify('Bit Manipulation')),
  ('Mathematics', public.slugify('Mathematics')),
  ('Sorting', public.slugify('Sorting')),
  ('Searching', public.slugify('Searching')),
  ('Prefix Sum', public.slugify('Prefix Sum')),
  ('Matrix', public.slugify('Matrix')),
  ('Intervals', public.slugify('Intervals')),
  ('Union Find', public.slugify('Union Find')),
  ('Topological Sort', public.slugify('Topological Sort')),
  ('Shortest Path', public.slugify('Shortest Path'))
on conflict (name) do nothing;
