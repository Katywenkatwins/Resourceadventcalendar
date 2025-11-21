import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Instagram, Mail, Send } from 'lucide-react';

interface ContactsPageProps {
  onBack: () => void;
}

export function ContactsPage({ onBack }: ContactsPageProps) {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="border-b-2 py-4 sm:py-6" style={{ borderColor: 'rgba(45,90,61,0.13)', backgroundColor: '#faf8f5' }}>
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-[#2d5a3d10]"
            style={{ color: '#2d5a3d' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
          <h1 className="text-2xl sm:text-3xl" style={{ color: '#052311' }}>
            Контакти
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
          
          {/* Intro */}
          <section>
            <p className="text-lg" style={{ color: '#2d5a3d' }}>
              Ми завжди раді вашим питанням та пропозиціям! Зв'яжіться з нами зручним для вас способом:
            </p>
          </section>

          {/* Соціальні мережі */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#052311' }}>Соціальні мережі</h2>
            <div className="space-y-4">
              <a
                href="https://www.instagram.com/advent.resurs/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md"
                style={{ backgroundColor: '#faf8f5', border: '2px solid rgba(45,90,61,0.1)' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#CE2E2E' }}>
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#052311' }}>Instagram</p>
                  <p className="text-sm" style={{ color: '#2d5a3d' }}>@advent.resurs</p>
                </div>
              </a>

              <a
                href="https://t.me/+MN8nYh5DYx0xZTYy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md"
                style={{ backgroundColor: '#faf8f5', border: '2px solid rgba(45,90,61,0.1)' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2d5a3d' }}>
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#052311' }}>Telegram</p>
                  <p className="text-sm" style={{ color: '#2d5a3d' }}>Приєднуйтесь до спільноти</p>
                </div>
              </a>
            </div>
          </section>

          {/* Email */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#052311' }}>Електронна пошта</h2>
            <a
              href="mailto:Katerynasmiian@outlook.com"
              className="flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#faf8f5', border: '2px solid rgba(45,90,61,0.1)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#CE2E2E' }}>
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#052311' }}>Email</p>
                <p className="text-sm" style={{ color: '#2d5a3d' }}>Katerynasmiian@outlook.com</p>
              </div>
            </a>
          </section>

          {/* Юридична інформація */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#052311' }}>Юридична інформація</h2>
            <div className="p-6 rounded-lg space-y-2" style={{ backgroundColor: '#faf8f5', border: '2px solid rgba(45,90,61,0.1)' }}>
              <p><strong style={{ color: '#052311' }}>ФОП Сміян Катерина Олегівна</strong></p>
              <p style={{ color: '#2d5a3d' }}>ІПН/ЄДРПОУ: 3304404964</p>
              <p style={{ color: '#2d5a3d' }}>Адреса: м. Ужгород, вул. Миколи Бобяка, 13в, кв. 21</p>
              <p style={{ color: '#2d5a3d' }}>Телефон: +380 66 229 32 67</p>
              <p style={{ color: '#2d5a3d' }}>Email: katerynasmiian@outlook.com</p>
            </div>
          </section>

          {/* Години роботи */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#052311' }}>Час відповіді</h2>
            <p style={{ color: '#2d5a3d' }}>
              Ми відповідаємо на всі звернення протягом <strong>1-3 робочих днів</strong>. 
              Дякуємо за ваше терпіння! 💛
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 py-8 mt-12" style={{ borderColor: 'rgba(45,90,61,0.13)', backgroundColor: '#faf8f5' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p style={{ color: '#2d5a3d' }}>
            © 2025 "Адвент календар ресурсного наповнення"
          </p>
          <p className="mt-2" style={{ color: '#d94a4a' }}>
            Створено з любов'ю 💛
          </p>
        </div>
      </footer>
    </div>
  );
}
