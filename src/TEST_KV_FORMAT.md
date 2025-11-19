# 🧪 Тестування формату KV Store

## Мета:

Перевірити чи дані зберігаються в правильному форматі в базі даних.

---

## 🔍 КРОК 1: Запустити тестовий endpoint

### Відкрийте консоль браузера (`F12`)

### Виконайте в консолі:

```javascript
fetch('https://rypfeuayzgbpxxkffrao.supabase.co/functions/v1/make-server-dc8cbf1f/test-kv-format', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== KV FORMAT TEST RESULT ===');
  console.log('Original data:', data.original);
  console.log('Retrieved data:', data.retrieved);
  console.log('Types:', data.types);
  console.log('Match:', JSON.stringify(data.original) === JSON.stringify(data.retrieved));
})
.catch(err => console.error('Test failed:', err));
```

---

## ✅ Очікуваний результат (ПРАВИЛЬНО):

```json
{
  "success": true,
  "original": {
    "id": "test-123",
    "email": "test@example.com",
    "name": "Test User",
    "progress": [1, 2, 3],
    "tier": "basic"
  },
  "retrieved": {
    "id": "test-123",
    "email": "test@example.com",
    "name": "Test User",
    "progress": [1, 2, 3],
    "tier": "basic"
  },
  "types": {
    "original": "object",
    "retrieved": "object"
  }
}
```

**Match: true** ✅

---

## ❌ Неправильний результат:

Якщо `retrieved` містить індекси:

```json
{
  "retrieved": {
    "0": "{",
    "1": "\"",
    "2": "i",
    ...
  }
}
```

**Це означає що проблема залишається!**

---

## 🔍 КРОК 2: Перевірити логи на Supabase

1. Відкрити https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/logs/edge-functions

2. Знайти логи від `/test-kv-format`

3. Шукати:
   - `KV set - value type: object` ✅ Правильно
   - `KV set - value type: string` ❌ Помилка!

---

## 🔍 КРОК 3: Перевірити базу даних

1. Відкрити SQL Editor:
   ```
   https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/sql/new
   ```

2. Виконати:
   ```sql
   SELECT * FROM kv_store_dc8cbf1f WHERE key = 'test:kv-format';
   ```

3. **Має бути порожньо** (бо ми видаляємо після тесту)

4. Але якщо є - перевірте формат `value`:
   - ✅ Правильно: `{"id": "test-123", "email": "..."}`
   - ❌ Неправильно: `{"0": "{", "1": "\"", ...}`

---

## 🎯 Висновок:

### Якщо тест пройшов успішно (Match: true):
✅ Код правильний, проблема не в новому коді!  
→ Потрібно очистити БД від старих записів

### Якщо тест НЕ пройшов:
❌ Проблема залишається в коді  
→ Потрібно дебагити далі

---

## 📋 Наступні кроки після тесту:

1. **Якщо тест OK** → Очистити БД:
   ```sql
   DELETE FROM kv_store_dc8cbf1f WHERE key LIKE 'user:%';
   ```

2. **Вийти/Увійти** знову

3. **Натиснути "Готово"** на будь-якому дні

4. **Перевірити БД** знову:
   ```sql
   SELECT * FROM kv_store_dc8cbf1f WHERE key LIKE 'user:%';
   ```

5. Дані **мають бути в правильному форматі**!

---

**ВИКОНАЙТЕ ЦЕЙ ТЕСТ ЗАРАЗ!** 🚀
