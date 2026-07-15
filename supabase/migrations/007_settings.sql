-- One settings row per user. Created lazily on first Settings page visit
-- (see settingsService.getSettings) rather than via a signup trigger, to
-- keep auth signup free of side effects that could fail the signup call.

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  default_language text not null default 'JavaScript' check (default_language in (
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust'
  )),
  code_editor_theme text not null default 'vs-dark' check (code_editor_theme in ('vs-dark', 'light')),
  default_question_view text not null default 'table' check (default_question_view in ('table', 'card')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_settings is 'Per-user preferences. Changing default_language never touches existing solutions.';

create trigger trg_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();
