# 🔧 Дебаг прогресу користувача

## Проблема
Прогрес відображається на фронтенді (5/24), але в адмін-панелі показує 0/24.

## Причини
1. Дані не відправляються на бекенд
2. Бекенд не зберігає дані правильно
3. Адмін-панель читає з іншого джерела

---

## ✅ Крок 1: Відкрийте консоль браузера

**Chrome/Edge:** `F12` або `Ctrl+Shift+I`
**Safari:** `Cmd+Option+I`

---

## ✅ Крок 2: Перевірте токен

Вставте в консоль:

```javascript
const token = localStorage.getItem('advent_access_token');
console.log('Token exists:', !!token);
console.log('Token:', token);
```

Має показати `true` і сам токен.

---

## ✅ Крок 3: Тест прогресу вручну

Вставте в консоль (замінить `5` на потрібний день):

```javascript
const projectId = 'rypfeuayzgbpxxkffrao';
const token = localStorage.getItem('advent_access_token');
const day = 5;

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/progress`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ day }),
})
.then(r => r.json())
.then(data => console.log('Progress update result:', data))
.catch(err => console.error('Progress update error:', err));
```

**Очікуваний результат:**
```json
{
  "success": true,
  "progress": [1, 2, 3, 4, 5]
}
```

---

## ✅ Крок 4: Перевірте профіль

```javascript
const projectId = 'rypfeuayzgbpxxkffrao';
const token = localStorage.getItem('advent_access_token');

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/profile`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
.then(r => r.json())
.then(data => console.log('Profile:', data))
.catch(err => console.error('Profile error:', err));
```

**Перевірте поле `progress`** - там має бути масив з днями.

---

## ✅ Крок 5: Перевірте логи бекенду

1. Відкрийте: https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/logs/edge-functions

2. Виберіть функцію: `make-server-dc8cbf1f`

3. Шукайте рядки:
   - `Progress update - Starting`
   - `Progress update - Day: X User: xxx`
   - `KV set - key: user:xxx`
   - `Progress update - Saved. New progress: [...]`

---

## ✅ Крок 6: Перевірте KV таблицю

1. Відкрийте: https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/editor

2. Виберіть таблицю: `kv_store_dc8cbf1f`

3. Знайдіть запис з ключем `user:YOUR_USER_ID`

4. Перевірте поле `value` → `progress`

**SQL запит:**
```sql
SELECT * FROM kv_store_dc8cbf1f WHERE key LIKE 'user:%';
```

---

## ❌ Помилки та рішення

### Помилка: `Unauthorized`
**Рішення:** Токен застарів або невалідний. Вийдіть і увійдіть знову.

### Помилка: `Invalid day`
**Рішення:** День має бути від 1 до 24.

### Помилка: `Failed to update progress`
**Рішення:** Перевірте логи бекенду (Крок 5).

### Прогрес не зберігається
**Рішення:** 
1. Редеплойте Edge Function з `/deploy-bundle.ts`
2. Перевірте що KV таблиця створена
3. Перевірте Environment Variables

---

## 🎯 Швидкий тест

Відкрийте `/test-progress.html` в браузері:
1. Токен автоматично завантажиться з localStorage
2. Натисніть "Test Day 1" 
3. Натисніть "Get Profile"
4. Перевірте результат

---

## 📞 Якщо нічого не допомагає

Надішліть скріншоти:
1. Консолі браузера з логами
2. Supabase Edge Function логів
3. KV таблиці з даними користувача
4. Адмін-панелі з прогресом 0/24

---

Успіхів! 🚀
