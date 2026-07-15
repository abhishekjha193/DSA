-- Extensions required by DSA Vault.
-- pgcrypto: gen_random_uuid() for primary keys
-- pg_trgm: trigram indexes, useful if ILIKE search on topics/tags needs to scale later
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Core helper functions needed by generated columns further down.
-- Declared immutable so they're valid inside `generated always as (...) stored`.

create or replace function public.normalize_url(p_url text)
returns text
language sql
immutable
as $$
  select case
    when p_url is null or btrim(p_url) = '' then null
    else regexp_replace(
           regexp_replace(lower(btrim(p_url)), '^https?://(www\.)?', ''),
           '/+$', ''
         )
  end;
$$;

create or replace function public.slugify(p_text text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(btrim(coalesce(p_text, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
