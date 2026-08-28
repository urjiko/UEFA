-- Run this once in Supabase SQL Editor.
-- Stores only anonymous prediction payloads. No names, emails or account IDs are required.

create extension if not exists pgcrypto;

create table if not exists public.prediction_submissions (
  id uuid primary key,
  league_id text not null check (league_id in ('ucl','uel','uecl')),
  team_slug text not null check (team_slug ~ '^[a-z0-9-]+$'),
  fixture_version text not null,
  predictions jsonb not null check (jsonb_typeof(predictions) = 'array'),
  created_at timestamptz not null default now()
);

create index if not exists prediction_submissions_lookup_idx
  on public.prediction_submissions (league_id, team_slug, fixture_version, created_at desc);

alter table public.prediction_submissions enable row level security;
revoke all on table public.prediction_submissions from anon, authenticated;

create or replace function public.submit_prediction(
  p_submission_id uuid,
  p_league_id text,
  p_team_slug text,
  p_fixture_version text,
  p_predictions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected integer;
  v_inserted integer := 0;
begin
  if p_league_id not in ('ucl','uel','uecl') then
    raise exception 'invalid league';
  end if;
  if p_team_slug is null or p_team_slug !~ '^[a-z0-9-]+$' then
    raise exception 'invalid team';
  end if;
  if p_fixture_version is null or length(p_fixture_version) > 64 then
    raise exception 'invalid fixture version';
  end if;
  if jsonb_typeof(p_predictions) <> 'array' then
    raise exception 'predictions must be an array';
  end if;

  v_expected := case when p_league_id = 'uecl' then 6 else 8 end;
  if jsonb_array_length(p_predictions) <> v_expected then
    raise exception 'wrong prediction count';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_predictions) item
    where coalesce(item->>'match_key','') !~ '^[a-z0-9-]+--[a-z0-9-]+$'
       or coalesce(item->>'opponent_slug','') !~ '^[a-z0-9-]+$'
       or coalesce(item->>'venue','') not in ('home','away')
       or coalesce(item->>'outcome','') not in ('win','draw','loss')
       or jsonb_typeof(coalesce(item->'manual_score','false'::jsonb)) <> 'boolean'
  ) then
    raise exception 'invalid prediction payload';
  end if;

  insert into public.prediction_submissions (
    id, league_id, team_slug, fixture_version, predictions
  ) values (
    p_submission_id, p_league_id, p_team_slug, p_fixture_version, p_predictions
  )
  on conflict (id) do nothing;

  get diagnostics v_inserted = row_count;
  return jsonb_build_object(
    'accepted', v_inserted = 1,
    'duplicate', v_inserted = 0
  );
end;
$$;

create or replace function public.get_prediction_averages(
  p_league_id text,
  p_team_slug text,
  p_fixture_version text
)
returns table (
  match_key text,
  opponent_slug text,
  venue text,
  total_votes bigint,
  win_votes bigint,
  draw_votes bigint,
  loss_votes bigint,
  manual_score_votes bigint,
  avg_selected_goals numeric,
  avg_opponent_goals numeric,
  submission_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select s.id, item
    from public.prediction_submissions s
    cross join lateral jsonb_array_elements(s.predictions) item
    where s.league_id = p_league_id
      and s.team_slug = p_team_slug
      and s.fixture_version = p_fixture_version
  )
  select
    item->>'match_key' as match_key,
    item->>'opponent_slug' as opponent_slug,
    item->>'venue' as venue,
    count(*)::bigint as total_votes,
    count(*) filter (where item->>'outcome' = 'win')::bigint as win_votes,
    count(*) filter (where item->>'outcome' = 'draw')::bigint as draw_votes,
    count(*) filter (where item->>'outcome' = 'loss')::bigint as loss_votes,
    count(*) filter (where (item->>'manual_score')::boolean is true)::bigint as manual_score_votes,
    round(avg((item->>'selected_goals')::numeric) filter (
      where (item->>'manual_score')::boolean is true and item->>'selected_goals' is not null
    ), 2) as avg_selected_goals,
    round(avg((item->>'opponent_goals')::numeric) filter (
      where (item->>'manual_score')::boolean is true and item->>'opponent_goals' is not null
    ), 2) as avg_opponent_goals,
    count(distinct id)::bigint as submission_count
  from filtered
  group by item->>'match_key', item->>'opponent_slug', item->>'venue'
  order by item->>'match_key';
$$;

revoke all on function public.submit_prediction(uuid,text,text,text,jsonb) from public;
revoke all on function public.get_prediction_averages(text,text,text) from public;
grant execute on function public.submit_prediction(uuid,text,text,text,jsonb) to anon, authenticated;
grant execute on function public.get_prediction_averages(text,text,text) to anon, authenticated;
