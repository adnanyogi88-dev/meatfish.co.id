-- Meatfish Affiliate: adaptasi role, referral, komisi dan penarikan untuk Supabase.
-- Jalankan seluruh file ini pada SQL Editor project Supabase KHUSUS Meatfish.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 role text not null default 'member' check(role in ('member','affiliate','admin')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,updated_at) on public.profiles to authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin');
$$;
revoke all on function public.is_admin() from public; grant execute on function public.is_admin() to authenticated;
drop policy if exists "mf profile read" on public.profiles;
create policy "mf profile read" on public.profiles for select to authenticated using(auth.uid()=id or public.is_admin());
drop policy if exists "mf profile update" on public.profiles;
create policy "mf profile update" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create table if not exists public.affiliate_applications(user_id uuid primary key references public.profiles(id) on delete cascade,motivation text not null default '',status text not null default 'pending' check(status in('pending','approved','rejected')),created_at timestamptz not null default now(),reviewed_at timestamptz);
alter table public.affiliate_applications enable row level security;grant select,insert on public.affiliate_applications to authenticated;
drop policy if exists "mf app read" on public.affiliate_applications;create policy "mf app read" on public.affiliate_applications for select to authenticated using(auth.uid()=user_id or public.is_admin());
drop policy if exists "mf app insert" on public.affiliate_applications;create policy "mf app insert" on public.affiliate_applications for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "mf app admin update" on public.affiliate_applications;create policy "mf app admin update" on public.affiliate_applications for update to authenticated using(public.is_admin()) with check(public.is_admin());
create table if not exists public.affiliate_accounts(user_id uuid primary key references public.profiles(id) on delete cascade,referral_code text not null unique,status text not null default 'active' check(status in('active','paused')),created_at timestamptz not null default now());
alter table public.affiliate_accounts enable row level security;grant select on public.affiliate_accounts to authenticated;
drop policy if exists "mf account read" on public.affiliate_accounts;create policy "mf account read" on public.affiliate_accounts for select to authenticated using(auth.uid()=user_id or public.is_admin());
create table if not exists public.affiliate_referrals(id bigint generated always as identity primary key,affiliate_user_id uuid not null references public.affiliate_accounts(user_id) on delete cascade,referred_user_id uuid not null unique references public.profiles(id) on delete cascade,created_at timestamptz not null default now());
alter table public.affiliate_referrals enable row level security;grant select on public.affiliate_referrals to authenticated;
drop policy if exists "mf referrals read" on public.affiliate_referrals;create policy "mf referrals read" on public.affiliate_referrals for select to authenticated using(auth.uid()=affiliate_user_id or public.is_admin());
create table if not exists public.affiliate_commissions(id bigint generated always as identity primary key,affiliate_user_id uuid not null references public.affiliate_accounts(user_id) on delete cascade,amount numeric(14,2) not null check(amount>0),status text not null default 'pending' check(status in('pending','approved','paid','rejected')),note text not null default '',created_at timestamptz not null default now(),paid_at timestamptz);
alter table public.affiliate_commissions enable row level security;grant select on public.affiliate_commissions to authenticated;
drop policy if exists "mf commissions read" on public.affiliate_commissions;create policy "mf commissions read" on public.affiliate_commissions for select to authenticated using(auth.uid()=affiliate_user_id or public.is_admin());
drop policy if exists "mf commissions admin manage" on public.affiliate_commissions;create policy "mf commissions admin manage" on public.affiliate_commissions for all to authenticated using(public.is_admin()) with check(public.is_admin());
create table if not exists public.affiliate_payout_requests(id bigint generated always as identity primary key,affiliate_user_id uuid not null references public.affiliate_accounts(user_id) on delete cascade,amount numeric(14,2) not null check(amount>0),payout_method text not null check(payout_method in('bank','ewallet')),recipient_name text not null check(char_length(trim(recipient_name)) between 1 and 100),payout_destination text not null check(char_length(trim(payout_destination)) between 3 and 160),status text not null default 'pending' check(status in('pending','approved','paid','rejected')),admin_note text not null default '',payment_reference text not null default '',requested_at timestamptz not null default now(),reviewed_at timestamptz,paid_at timestamptz);
alter table public.affiliate_payout_requests enable row level security;revoke all on public.affiliate_payout_requests from anon,authenticated;grant select on public.affiliate_payout_requests to authenticated;
drop policy if exists "mf payouts read" on public.affiliate_payout_requests;create policy "mf payouts read" on public.affiliate_payout_requests for select to authenticated using(auth.uid()=affiliate_user_id or public.is_admin());
create table if not exists public.affiliate_payout_profiles(user_id uuid primary key references public.affiliate_accounts(user_id) on delete cascade,payout_method text not null check(payout_method in('bank','ewallet')),recipient_name text not null check(char_length(trim(recipient_name)) between 1 and 100),payout_destination text not null check(char_length(trim(payout_destination)) between 3 and 160),updated_at timestamptz not null default now());
alter table public.affiliate_payout_profiles enable row level security;revoke all on public.affiliate_payout_profiles from anon,authenticated;grant select,insert,update on public.affiliate_payout_profiles to authenticated;
drop policy if exists "mf payout profile own" on public.affiliate_payout_profiles;create policy "mf payout profile own" on public.affiliate_payout_profiles for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','')) on conflict(id) do nothing;
 insert into public.affiliate_referrals(affiliate_user_id,referred_user_id) select a.user_id,new.id from public.affiliate_accounts a where upper(a.referral_code)=upper(coalesce(new.raw_user_meta_data->>'referral_code','')) and a.status='active' and coalesce(new.raw_user_meta_data->>'referral_code','')<>'' on conflict(referred_user_id) do nothing;
 return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.admin_review_affiliate(p_user_id uuid,p_approve boolean) returns void language plpgsql security definer set search_path='' as $$
declare v_code text;begin if not public.is_admin() then raise exception 'Not authorized';end if;
 update public.affiliate_applications set status=case when p_approve then 'approved' else 'rejected' end,reviewed_at=now() where user_id=p_user_id;
 if not found then raise exception 'Application not found';end if;
 if p_approve then update public.profiles set role='affiliate' where id=p_user_id;v_code='MF'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));insert into public.affiliate_accounts(user_id,referral_code) values(p_user_id,v_code) on conflict(user_id) do nothing;end if;end;$$;
revoke all on function public.admin_review_affiliate(uuid,boolean) from public;grant execute on function public.admin_review_affiliate(uuid,boolean) to authenticated;
create or replace function public.admin_set_user_role(p_user_id uuid,p_role text) returns void language plpgsql security definer set search_path='' as $$
begin if not public.is_admin() then raise exception 'Not authorized';end if;if p_role not in('member','affiliate','admin') then raise exception 'Invalid role';end if;
 update public.profiles set role=p_role,updated_at=now() where id=p_user_id;if not found then raise exception 'User not found';end if;
 if p_role='affiliate' then insert into public.affiliate_accounts(user_id,referral_code,status) values(p_user_id,'MF'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),'active') on conflict(user_id) do update set status='active';else update public.affiliate_accounts set status='paused' where user_id=p_user_id;end if;end;$$;
revoke all on function public.admin_set_user_role(uuid,text) from public;grant execute on function public.admin_set_user_role(uuid,text) to authenticated;
create or replace function public.admin_update_commission_status(p_commission_id bigint,p_status text) returns void language plpgsql security definer set search_path='' as $$
declare v text;begin if not public.is_admin() then raise exception 'Not authorized';end if;if p_status not in('approved','paid','rejected') then raise exception 'Invalid status';end if;select status into v from public.affiliate_commissions where id=p_commission_id for update;if not found then raise exception 'Commission not found';end if;
 if v='pending' and p_status not in('approved','rejected') then raise exception 'Pending commission can only be approved or rejected';elsif v='approved' and p_status<>'paid' then raise exception 'Approved commission can only be marked paid';elsif v not in('pending','approved') then raise exception 'Already finalized';end if;
 update public.affiliate_commissions set status=p_status,paid_at=case when p_status='paid' then now() else null end where id=p_commission_id;end;$$;
revoke all on function public.admin_update_commission_status(bigint,text) from public;grant execute on function public.admin_update_commission_status(bigint,text) to authenticated;
create or replace function public.request_affiliate_withdrawal(p_amount numeric,p_method text,p_destination text,p_recipient_name text) returns bigint language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid();v_available numeric(14,2);v_id bigint;begin
 if v_uid is null then raise exception 'Authentication required';end if;if p_amount is null or p_amount<50000 then raise exception 'Minimum withdrawal is Rp50,000';end if;
 if p_method not in('bank','ewallet') then raise exception 'Invalid payout method';end if;if char_length(trim(coalesce(p_destination,''))) not between 3 and 160 or char_length(trim(coalesce(p_recipient_name,''))) not between 1 and 100 then raise exception 'Invalid payout destination';end if;
 perform pg_advisory_xact_lock(hashtextextended(v_uid::text,0));if not exists(select 1 from public.affiliate_accounts where user_id=v_uid and status='active') then raise exception 'Active affiliate account required';end if;
 select coalesce((select sum(amount) from public.affiliate_commissions where affiliate_user_id=v_uid and status='approved'),0)-coalesce((select sum(amount) from public.affiliate_payout_requests where affiliate_user_id=v_uid and status in('pending','approved','paid')),0) into v_available;
 if p_amount>v_available then raise exception 'Withdrawal exceeds available balance';end if;
 insert into public.affiliate_payout_requests(affiliate_user_id,amount,payout_method,payout_destination,recipient_name) values(v_uid,p_amount,p_method,trim(p_destination),trim(p_recipient_name)) returning id into v_id;return v_id;end;$$;
revoke all on function public.request_affiliate_withdrawal(numeric,text,text,text) from public;grant execute on function public.request_affiliate_withdrawal(numeric,text,text,text) to authenticated;
create or replace function public.admin_update_payout_status(p_request_id bigint,p_status text,p_admin_note text default '') returns void language plpgsql security definer set search_path='' as $$
declare v text;begin if not public.is_admin() then raise exception 'Not authorized';end if;if p_status not in('approved','paid','rejected') then raise exception 'Invalid status';end if;
 if p_status='paid' and char_length(trim(coalesce(p_admin_note,'')))<3 then raise exception 'Payment reference is required';end if;
 select status into v from public.affiliate_payout_requests where id=p_request_id for update;if not found then raise exception 'Request not found';end if;
 if v='pending' and p_status not in('approved','rejected') then raise exception 'Invalid transition';elsif v='approved' and p_status not in('paid','rejected') then raise exception 'Invalid transition';elsif v not in('pending','approved') then raise exception 'Already finalized';end if;
 update public.affiliate_payout_requests set status=p_status,admin_note=left(coalesce(p_admin_note,''),500),payment_reference=case when p_status='paid' then left(trim(p_admin_note),160) else payment_reference end,reviewed_at=case when v='pending' then now() else reviewed_at end,paid_at=case when p_status='paid' then now() else null end where id=p_request_id;end;$$;
revoke all on function public.admin_update_payout_status(bigint,text,text) from public;grant execute on function public.admin_update_payout_status(bigint,text,text) to authenticated;
