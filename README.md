# КефирНно Mobile — fix1 (Expo)

Мобильное приложение для Android + iOS из одного кода. Главный экран — Поток, где Аджна "загружает всё".

---

## Что внутри

```
КефирНно Mobile
├── 01 Поток      ← главный экран, чат-ввод (index.tsx)
├── 02 Память     ← список мыслей/исследований (memory.tsx)
├── 03 Проекты    ← карточки проектов с прогрессом (projects.tsx)
├── 04 Артефакты  ← файлы, фото, документы (artifacts.tsx)
├── 05 Карта      ← граф знаний (map.tsx)
└── 06 Аджна      ← чат с ИИ (adjna.tsx)
```

Авторизации пока нет — всё работает через demo-пользователя "Ваня". Подключим Telegram или другой auth позже.

---

## ШАГ 1 — Установи инструменты на компьютере

Открой PowerShell:

```powershell
# Node.js должен быть установлен (проверь)
node -v   # нужно v18+

# Установи Expo CLI глобально
npm install -g expo-cli eas-cli
```

---

## ШАГ 2 — Установи Expo Go на телефон

Зайди в **Google Play** (Android) или **App Store** (iOS) → найди **"Expo Go"** → установи.

Это приложение для быстрого тестирования без сборки APK.

---

## ШАГ 3 — Распакуй проект и установи зависимости

```powershell
# Распакуй kefirNNo_mobile.zip в удобную папку
cd путь\к\kefirNNo_mobile

npm install
```

Это займёт пару минут — устанавливаются все библиотеки React Native.

---

## ШАГ 4 — Добавь переменные окружения

Создай файл `.env` в корне проекта:

```env
EXPO_PUBLIC_SUPABASE_URL=https://jqbeddqupxttexnmcxvb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxYmVkZHF1cHh0dGV4bm1jeHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzQ4NDYsImV4cCI6MjA5NjAxMDg0Nn0.ntWf2cn048qj9coSoS-2DG7Rn0Ig31LyDlj7EkBu7hA
EXPO_PUBLIC_OPENAI_API_KEY=твой_ключ_openai_сюда
```

⚠️ Для OpenAI ключа в реальном продакшене нужен будет сервер-прокси (ключ нельзя хранить в мобильном приложении открыто) — это сделаем в следующем fix.

---

## ШАГ 5 — SQL в Supabase (если ещё не делал)

1. Supabase → SQL Editor → New query
2. Открой файл `supabase_mobile_setup.sql`
3. Скопируй → вставь → **Run**

---

## ШАГ 6 — Запусти проект

```powershell
npx expo start
```

Появится QR-код в терминале.

**На телефоне:**
1. Открой **Expo Go**
2. Нажми "Scan QR code"
3. Отсканируй код из терминала
4. Приложение загрузится и откроется

---

## ШАГ 7 — Тестируй

- Пиши в поле "Пиши, думай, загружай..." на главном экране → создаются мысли
- Переключайся между вкладками снизу
- Создавай проекты во вкладке "Проекты"
- Спрашивай Аджну во вкладке "Аджна"

Изменения кода применяются мгновенно — просто сохраняй файл, телефон обновится сам (hot reload).

---

## Дальше — когда будешь готов к финальной сборке APK

```powershell
eas login
eas build:configure
eas build --platform android
```

Это создаст `.apk` файл который можно установить на любой Android без Expo Go.

---

## Структура проекта

```
kefirNNo_mobile/
├── app/
│   ├── _layout.tsx              ← корневой layout
│   └── (tabs)/
│       ├── _layout.tsx          ← нижняя навигация (6 вкладок)
│       ├── index.tsx            ← Поток (главный экран)
│       ├── memory.tsx           ← Память
│       ├── projects.tsx         ← Проекты
│       ├── artifacts.tsx        ← Артефакты
│       ├── map.tsx              ← Карта мыслей
│       └── adjna.tsx            ← Аджна (ИИ-чат)
├── lib/
│   ├── supabase/client.ts       ← Supabase клиент для RN
│   └── types.ts                 ← TypeScript типы
├── constants/
│   └── Colors.ts                ← design tokens КефирНно
├── app.json                     ← конфигурация Expo
├── package.json
└── .env                         ← СОЗДАЙ САМ (ключи)
```
