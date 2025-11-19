import { Hono } from 'npm:hono';

const app = new Hono();

const RESEND_API_KEY = Deno.env.get('ADVENT_RESEND_API_KEY') || Deno.env.get('RESEND_API_KEY') || Deno.env.get('ADVENT-RESEND-API-KEY');

// Функція для відправки email через Resend
async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Адвент-календар <noreply@adventresurs.space>',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

// Email шаблон для успішної реєстрації
function getWelcomeEmailTemplate(name: string, email: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #1e3a5f;
            background-color: #e8e4e1;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2d5a3d 0%, #1e3a5f 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-family: 'Dela Gothic One', sans-serif;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #2d5a3d;
            margin-top: 0;
          }
          .content p {
            margin: 16px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #2d5a3d;
            color: white;
            text-decoration: none;
            border-radius: 12px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .highlight {
            background-color: #fff3e0;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #e6963a;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Вітаємо в Адвент-календарі!</h1>
          </div>
          <div class="content">
            <h2>Привіт, ${name}! 🎄</h2>
            <p>Дякуємо, що приєдналися до проєкту <strong>"24 кроки до нового себе"</strong>!</p>
            
            <p>Ви успішно зареєструвалися з email: <strong>${email}</strong></p>
            
            <div class="highlight">
              <p><strong>Наступні кроки:</strong></p>
              <ol>
                <li>Оберіть тариф, який вам підходить</li>
                <li>Завершіть оплату через бе��печну систему WayForPay</li>
                <li>Отримайте доступ до 24 днів трансформації</li>
              </ol>
            </div>
            
            <p>Щодня на вас чекає нова практика від експертів, міні-досвіди та інструменти для внутрішнього відновлення.</p>
            
            <p style="text-align: center;">
              <a href="${Deno.env.get('APP_URL') || 'https://adventresurs.space'}" class="button">
                Розпочати подорож
              </a>
            </p>
            
            <p>З теплом,<br>Команда Адвент-календаря 🌟</p>
          </div>
          <div class="footer">
            <p>© 2024 Адвент-календар трансформації</p>
            <p>Якщо у вас виникли питання, напишіть нам на katywenka@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email шаблон для успішної оплати
function getPaymentSuccessEmailTemplate(name: string, tierName: string, amount: number) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #1e3a5f;
            background-color: #e8e4e1;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2d5a3d 0%, #1e3a5f 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-family: 'Dela Gothic One', sans-serif;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #2d5a3d;
            margin-top: 0;
          }
          .content p {
            margin: 16px 0;
          }
          .tier-info {
            background: linear-gradient(135deg, #2d5a3d 0%, #1e3a5f 100%);
            color: white;
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            margin: 24px 0;
          }
          .tier-info h3 {
            margin: 0 0 8px 0;
            font-size: 24px;
          }
          .tier-info .price {
            font-size: 32px;
            font-weight: bold;
            margin: 8px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #e6963a;
            color: white;
            text-decoration: none;
            border-radius: 12px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .features {
            background-color: #fff3e0;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .features ul {
            margin: 0;
            padding-left: 20px;
          }
          .features li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Оплата успішна!</h1>
          </div>
          <div class="content">
            <h2>Вітаємо, ${name}! 🎉</h2>
            <p>Ваш платіж успішно оброблено!</p>
            
            <div class="tier-info">
              <h3>Тариф "${tierName}"</h3>
              <div class="price">€${amount}</div>
              <p style="margin: 0; opacity: 0.9;">Активовано</p>
            </div>
            
            <p>Тепер у вас є повний доступ до:</p>
            
            <div class="features">
              <ul>
                ${tierName === 'Світло' ? `
                  <li>✨ Доступ до базових практик на 24 дні</li>
                  <li>📱 Інтерактивний календар</li>
                  <li>🎯 Відстеження прогресу</li>
                ` : tierName === 'Магія' ? `
                  <li>✨ Повний доступ до всіх практик</li>
                  <li>📚 Додаткові матеріали від експертів</li>
                  <li>🎁 Бонусні медитації</li>
                  <li>💬 Доступ до спільноти</li>
                ` : `
                  <li>✨ VIP доступ до всього контенту</li>
                  <li>👥 Персональна консультація з експертом</li>
                  <li>📚 Всі додаткові матеріали</li>
                  <li>🎁 Ексклюзивні бонуси</li>
                  <li>💎 Пріоритетна підтримка</li>
                `}
              </ul>
            </div>
            
            <p>Почніть свою подорож трансформації прямо зараз!</p>
            
            <p style="text-align: center;">
              <a href="${Deno.env.get('APP_URL') || 'https://adventresurs.space'}" class="button">
                Відкрити календар
              </a>
            </p>
            
            <p><strong>Дякуємо, що обрали нас!</strong></p>
            <p>Бажаємо вам натхненної та трансформуючої подорожі! 🌟</p>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <em>Номер транзакції та детальну інформацію про оплату ви можете знайти у вашому особистому кабінеті.</em>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Адвент-календар трансформації</p>
            <p>Питання? Напишіть нам: katywenka@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Ендпоінт для відправки welcome email
app.post('/send-welcome', async (c) => {
  try {
    const { email, name } = await c.req.json();
    
    if (!email || !name) {
      return c.json({ error: 'Email and name are required' }, 400);
    }

    const result = await sendEmail(
      email,
      '🎄 Вітаємо в Адвент-календарі трансформації!',
      getWelcomeEmailTemplate(name, email)
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return c.json({ error: 'Failed to send welcome email' }, 500);
  }
});

// Ендпоінт для відправки payment success email
app.post('/send-payment-success', async (c) => {
  try {
    const { email, name, tierName, amount } = await c.req.json();
    
    if (!email || !name || !tierName || !amount) {
      return c.json({ error: 'Email, name, tierName and amount are required' }, 400);
    }

    const result = await sendEmail(
      email,
      '✅ Оплата успішна - Адвент-календар активовано!',
      getPaymentSuccessEmailTemplate(name, tierName, amount)
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Payment success email error:', error);
    return c.json({ error: 'Failed to send payment success email' }, 500);
  }
});

export default app;