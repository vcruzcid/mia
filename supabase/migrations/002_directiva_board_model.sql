-- Board/Directiva model alignment (terms/positions/assignments) + public board_members view
-- Applied in dev via Supabase MCP on 2025-12-17

begin;

-- Add city to non-PII profile (used by gallery/directiva)
alter table public.member_profile
add column if not exists city text;

update public.member_profile p
set city = pr.city
from public.member_private pr
where pr.member_id = p.member_id and p.city is distinct from pr.city;

-- Allow multiple assignments per position (e.g. co-vocales)
alter table public.board_assignments
drop constraint if exists board_assignments_term_id_position_id_key;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='board_assignments_term_position_member_uniq'
  ) then
    execute 'create unique index board_assignments_term_position_member_uniq on public.board_assignments(term_id, position_id, member_id)';
  end if;
end $$;

-- Add responsibilities directly to board_positions (simple)
alter table public.board_positions
add column if not exists default_responsibilities text[] not null default '{}'::text[];

-- Seed board positions and sort order from legacy (if present)
insert into public.board_positions (name, sort_order, default_responsibilities)
select
  l.position,
  coalesce(l.sort_order, 999),
  coalesce(l.default_responsibilities, '{}'::text[])
from legacy.board_position_responsibilities l
on conflict (name) do update
set sort_order = excluded.sort_order,
    default_responsibilities = excluded.default_responsibilities;

-- Add any missing positions (safe no-op if already exists)
insert into public.board_positions (name, sort_order, default_responsibilities)
values
  ('Vocal Informes MIA', 12, '{}'::text[])
on conflict (name) do nothing;

-- Seed board terms from legacy.board_terms (if present)
insert into public.board_terms (election_year, next_election_year, start_date, end_date, is_current, description)
select
  bt.start_year as election_year,
  bt.end_year as next_election_year,
  make_date(bt.start_year, 1, 1) as start_date,
  case
    when bt.end_year = bt.start_year then make_date(bt.start_year, 12, 31)
    else make_date(bt.end_year - 1, 12, 31)
  end as end_date,
  (bt.start_year = 2025) as is_current,
  bt.description
from legacy.board_terms bt
on conflict (election_year) do update
set next_election_year = excluded.next_election_year,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    is_current = excluded.is_current,
    description = excluded.description;

-- Ensure board members are pleno_derecho and active (if legacy.members exists)
update public.member_membership mm
set membership_type = 'pleno_derecho',
    membership_status = 'active'
from legacy.members lm
where lm.is_board_member = true
  and mm.member_id = lm.id;

update public.members m
set is_active = true
from public.member_membership mm
join legacy.members lm on lm.id = mm.member_id
where m.id = mm.member_id
  and lm.is_board_member = true;

-- Insert current board assignments from legacy.members (if present)
with current_term as (
  select id
  from public.board_terms
  where is_current = true
  order by election_year desc
  limit 1
),
board_source as (
  select
    lm.id as member_id,
    lm.board_position as position,
    lm.board_personal_commitment as personal_commitment
  from legacy.members lm
  where lm.is_board_member = true
    and lm.board_position is not null
)
insert into public.board_assignments (term_id, member_id, position_id, personal_commitment)
select
  ct.id as term_id,
  bs.member_id,
  bp.id as position_id,
  bs.personal_commitment
from board_source bs
cross join current_term ct
join public.board_positions bp on bp.name = bs.position
on conflict do nothing;

-- Public view for current board members (compat with app)
drop view if exists public.board_members cascade;
create view public.board_members
with (security_invoker = true)
as
select
  m.id,
  p.first_name,
  p.last_name,
  p.display_name,
  p.company,
  p.main_profession,
  p.other_professions,
  p.biography,
  p.city,
  p.province,
  p.autonomous_community,
  p.country,
  p.social_media,
  p.profile_image_url,
  mm.membership_type,
  mm.membership_status,
  ba.personal_commitment as board_personal_commitment,
  bp.name as board_position,
  bt.start_date as board_term_start,
  bt.end_date as board_term_end,
  bp.default_responsibilities as position_responsibilities
from public.board_assignments ba
join public.board_terms bt on bt.id = ba.term_id and bt.is_current = true
join public.board_positions bp on bp.id = ba.position_id
join public.members m on m.id = ba.member_id
join public.member_profile p on p.member_id = m.id
join public.member_membership mm on mm.member_id = m.id;

commit;


