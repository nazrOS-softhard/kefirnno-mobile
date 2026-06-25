-- ═══════════════════════════════════════════════════════════════
--  КефирНно Mobile — настройка demo-пользователя
--  Запускать в: Supabase Dashboard → SQL Editor → New query
--  (если ещё не запускал в веб-версии — запусти это)
-- ═══════════════════════════════════════════════════════════════

-- Отключаем RLS для работы без авторизации (пока)
ALTER TABLE objects         DISABLE ROW LEVEL SECURITY;
ALTER TABLE object_links    DISABLE ROW LEVEL SECURITY;
ALTER TABLE attachments     DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log        DISABLE ROW LEVEL SECURITY;

-- Создаём demo пользователя если не существует
INSERT INTO users (id, auth_id, display_name, username, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Ваня',
  'wanja_nazr',
  '{}'
)
ON CONFLICT (id) DO NOTHING;
