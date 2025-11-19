# ⚡ Швидкий тест прогресу

## 📋 Копіюйте і вставте в консоль браузера:

### 1️⃣ Тест оновлення прогресу (день 1):

```javascript
(async () => {
  const projectId = 'rypfeuayzgbpxxkffrao';
  const token = localStorage.getItem('advent_access_token');
  const day = 1;

  console.log('🚀 Test starting...');
  console.log('📍 Token:', token ? '✅ Found' : '❌ Missing');

  if (!token) {
    console.error('❌ No access token! Please login first.');
    return;
  }

  try {
    console.log(`📤 Sending progress update for day ${day}...`);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/progress`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ day }),
      }
    );

    console.log('📥 Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS!');
      console.log('📊 Progress:', data.progress);
      console.log('🎉 Day', day, 'marked as completed!');
    } else {
      const error = await response.text();
      console.error('❌ ERROR:', error);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
})();
```

### 2️⃣ Перевірка профілю:

```javascript
(async () => {
  const projectId = 'rypfeuayzgbpxxkffrao';
  const token = localStorage.getItem('advent_access_token');

  console.log('🔍 Checking profile...');

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/profile`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const profile = await response.json();
      console.log('👤 Profile:');
      console.log('  📧 Email:', profile.email);
      console.log('  🎫 Tier:', profile.tier);
      console.log('  📊 Progress:', profile.progress);
      console.log('  ✅ Completed:', profile.progress.length + '/24');
    } else {
      console.error('❌ Error:', await response.text());
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
})();
```

### 3️⃣ Перевірка даних в KV (тільки для адміна):

Перейдіть в SQL Editor Supabase:
https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/sql/new

Виконайте:
```sql
SELECT * FROM kv_store_dc8cbf1f WHERE key LIKE 'user:%';
```

Шукайте поле `value` → `progress` - там має бути масив днів.

---

## 🎯 Очікувані результати:

### ✅ Успішно:
```
🚀 Test starting...
📍 Token: ✅ Found
📤 Sending progress update for day 1...
📥 Response status: 200
✅ SUCCESS!
📊 Progress: [1]
🎉 Day 1 marked as completed!
```

### ❌ Помилки:

**"No access token"**
→ Вийдіть і увійдіть знову

**"Response status: 401"**
→ Токен застарів, перезавантажте сторінку

**"Response status: 500"**
→ Перевірте логи в Supabase Edge Functions

---

## 🔍 Де дивитись логи бекенду:

https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/logs/edge-functions

Шукайте:
- `Progress update - Starting`
- `Progress update - Day: 1 User: xxx`
- `KV set - key: user:xxx`
- `Progress update - Saved. New progress: [1]`

---

Успіхів! 🚀
