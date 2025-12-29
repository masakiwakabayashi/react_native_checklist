-- Seed data for local development
-- Creates a demo user together with checklist templates, items, tags, and execution states.

begin;

-- Ensure pgcrypto is available for password hashing (already installed in Supabase images).
create extension if not exists "pgcrypto" with schema extensions;

-- Deterministic IDs so the seed can be applied repeatedly.
-- ユーザーデータの作成
WITH credentials(id, mail, pass) AS (
  SELECT * FROM (VALUES 
    ('79d7c983-3a5d-48b6-8bc1-60d9f2243ac4', 'user1@example.com', 'aW4uHStOg')
  ) AS users(id, mail, pass)
),
create_user AS (
  INSERT INTO auth.users (id, instance_id, ROLE, aud, email, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password, created_at, updated_at, last_sign_in_at, email_confirmed_at, confirmation_sent_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    SELECT id::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', mail, '{"provider":"email","providers":["email"]}', '{}', FALSE, crypt(pass, gen_salt('bf')), NOW(), NOW(), NOW(), NOW(), NOW(), '', '', '', '' FROM credentials
  RETURNING id
)
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT gen_random_uuid(), id, id, json_build_object('sub', id), 'email', NOW(), NOW(), NOW() FROM create_user;


-- Templates capture reusable checklist structures per user.
insert into public.templates (id, user_id, name, description)
values
  (
    '8c7e1d66-5a16-4c70-9e93-05463fd71df4'::uuid,
    '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid,
    'チェックリストサンプル1',
    'Quick run-through before starting development on a new story.'
  ),
  (
    'b3d42866-6e31-4d92-88de-cf7100ad5948'::uuid,
    '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid,
    'チェックリストサンプル2',
    'Everything needed before promoting a build to production.'
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.items (id, user_id, template_id, title)
values
  ('1a656f33-22f1-4f1e-9f08-a9a9385c0e00'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '8c7e1d66-5a16-4c70-9e93-05463fd71df4'::uuid, 'Sync Expo config with Supabase env vars'),
  ('54eabf52-0dd2-4abd-ac86-375d35a331d9'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '8c7e1d66-5a16-4c70-9e93-05463fd71df4'::uuid, 'Run unit tests'),
  ('20e1c417-9c27-4c7d-95df-0c0d66cf88d2'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '8c7e1d66-5a16-4c70-9e93-05463fd71df4'::uuid, 'Verify Expo dev build on device'),
  ('b0d49bd5-191a-405c-b59c-3cd9089c9e21'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'b3d42866-6e31-4d92-88de-cf7100ad5948'::uuid, 'Draft release notes'),
  ('a43fbd31-839b-4a50-804f-630abd2ffec1'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'b3d42866-6e31-4d92-88de-cf7100ad5948'::uuid, 'Tag Supabase migrations'),
  ('f1ca0cf2-2f5b-4650-8b4b-2ea98a568c2f'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'b3d42866-6e31-4d92-88de-cf7100ad5948'::uuid, 'Smoke test production build')
on conflict (id) do update set
  title = excluded.title,
  template_id = excluded.template_id;

insert into public.tags (id, user_id, name)
values
  ('a93676d5-67be-4f71-a274-0bf0c21aefb0'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'daily'),
  ('42928de0-9b4d-4df0-bbb6-dba907f0cc0a'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'mobile'),
  ('1ef7a57a-9b4a-4cdf-85fa-71cbb6b2f389'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'release')
on conflict (id) do update set
  name = excluded.name;

insert into public.template_tags (id, user_id, template_id, tag_id)
values
  ('22879fbd-cffa-4a80-a246-30c7f2cfe67f'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '8c7e1d66-5a16-4c70-9e93-05463fd71df4'::uuid, 'a93676d5-67be-4f71-a274-0bf0c21aefb0'::uuid),
  ('8c0c1b64-26a9-4f30-a660-a50582a4d369'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '8c7e1d66-5a16-4c70-9e93-05463fd71df4'::uuid, '42928de0-9b4d-4df0-bbb6-dba907f0cc0a'::uuid),
  ('d2eedfaa-aa5d-4dac-8cde-ff4bfc4ab020'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'b3d42866-6e31-4d92-88de-cf7100ad5948'::uuid, '1ef7a57a-9b4a-4cdf-85fa-71cbb6b2f389'::uuid)
on conflict (template_id, tag_id) do nothing;

insert into public.executions (id, user_id, item_id, checked)
values
  ('3b0e8d68-e251-4f8f-8f15-47a1a996a96f'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '1a656f33-22f1-4f1e-9f08-a9a9385c0e00'::uuid, true),
  ('bf80731c-83b2-4d98-94e1-180dc7e5b562'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, '54eabf52-0dd2-4abd-ac86-375d35a331d9'::uuid, true),
  ('d9fbb999-1944-4006-9b92-8ab2966e3712'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'b0d49bd5-191a-405c-b59c-3cd9089c9e21'::uuid, false),
  ('a54bbf3b-6b08-459f-af7e-febfa0d8c3d2'::uuid, '79d7c983-3a5d-48b6-8bc1-60d9f2243ac4'::uuid, 'a43fbd31-839b-4a50-804f-630abd2ffec1'::uuid, false)
on conflict (user_id, item_id) do update set
  checked = excluded.checked,
  updated_at = now();

commit;
