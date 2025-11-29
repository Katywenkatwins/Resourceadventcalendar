import { Heart, Calendar, Gift, Users, Sparkles, Star, CheckCircle2, Shield, Globe, Wind, Target, LogIn } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from './ui/button';
import { Link } from 'react-router';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, useInView } from 'motion/react';
import ChristmasTree from '../imports/Frame48097540';
import ChristmasBalls from '../imports/Frame48097541';
import CandyCane from '../imports/Vector';
import SnowflakeIcon from '../imports/Frame48097537';
import GiftsWithDecor from '../imports/Vector-43-1850';
import GiftsDecoration from '../imports/Vector2-51-1334';
import SnowflakeDecor from '../imports/Frame48097520';
import svgPaths from '../imports/svg-wnnef39ojp';
import ExpertSlider from './ExpertSlider';
import { CountdownTimer } from './CountdownTimer';

interface LandingPageProps {
  onStart: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  onGoToCalendar?: () => void;
}

// Декоративні SVG елементи з Figma - мемоізовані для оптимізації
const DecorativeBalls1 = memo(function DecorativeBalls1() {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      <div className="absolute inset-[30.32%_38.15%_38.93%_15.83%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <path d={svgPaths.p389e8200} fill="#CF7A2C" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-[45.07%] top-[63.26%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 83 83">
          <path d={svgPaths.p7fe9270} fill="#12213E" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[24.82%_57.44%_69.39%_35.12%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
          <path d={svgPaths.p3f476200} fill="#CF7A2C" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[32.4%_26.82%_61.82%_65.74%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
          <path d={svgPaths.p3f476200} fill="#CE2E2E" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[58.18%_68.77%_36.04%_23.79%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
          <path d={svgPaths.p3f476200} fill="#12213E" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[0.95%_61.57%_74.8%_38.41%]">
        <div className="absolute bottom-[-1.06%] left-[-2265.88%] right-[-2265.89%] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 56">
            <path d={svgPaths.p3abe5e60} opacity="0.9" stroke="#CF7A2C" strokeWidth="1.29758" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[1.36%_30.75%_66.94%_69.25%]">
        <div className="absolute bottom-0 left-[-0.65px] right-[-0.65px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 72">
            <path d="M0.648788 71.172V0" opacity="0.9" stroke="#CE2E2E" strokeWidth="1.29758" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[41.59%] left-[27.64%] right-[72.36%] top-0">
        <div className="absolute bottom-0 left-[-0.65px] right-[-0.65px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 132">
            <path d="M0.648788 131.12V0" opacity="0.9" stroke="#12213E" strokeWidth="1.29758" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[22.05%] left-[38.84%] right-0 top-[37.08%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 92 92">
          <path d={svgPaths.pd7d0200} fill="#CE2E2E" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
});

const DecorativeCandy = memo(function DecorativeCandy() {
  return (
    <div className="absolute bottom-0 left-0 right-[0.15%] top-0">
      <div className="absolute bottom-0 left-0 right-[0.15%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 193 238">
          <path d={svgPaths.p20415600} fill="#CF3C32" />
        </svg>
      </div>
    </div>
  );
});

const DecorativeGift = memo(function DecorativeGift() {
  return (
    <div className="h-[143.02px] w-[96.322px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 97 144">
        <g opacity="0.4">
          <path d={svgPaths.p10bd0900} fill="#D98E29" />
          <path d={svgPaths.p3a20a770} fill="#14334A" />
          <path d={svgPaths.p2e5d1e70} fill="#14334A" />
          <path d={svgPaths.pef4bc80} fill="#14334A" />
        </g>
      </svg>
    </div>
  );
});

// Компонент для анімованих секцій з появою на скролл
const AnimatedSection = memo(function AnimatedSection({ 
  children, 
  direction = 'left',
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: 'left' | 'right';
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05, margin: "0px 0px -50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        x: direction === 'left' ? -100 : 100 
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0 
      } : { 
        opacity: 0, 
        x: direction === 'left' ? -100 : 100 
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      style={{ 
        visibility: 'visible',
        minHeight: 'fit-content'
      }}
    >
      {children}
    </motion.div>
  );
});

// Константи для експертів бонусів - винесено для оптимізації
const VIP_EXPERTS = [
  {
    name: 'Сміян Катерина',
    role: 'Веб-дизайнерка, стратег і творча менторка',
    instagram: 'https://www.instagram.com/kateryna_smiian/',
    instagramHandle: '@kateryna_smiian',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Frame%20289%203.png',
    bonus: 'Експрес-діагностика бренду / сайту / сторінки (30 хвилин)',
    description: 'Швидкий, але дуже точний аудит з конкретними правками.',
    color: '#e6963a'
  },
  {
    name: 'Анастасія Черкіс',
    role: 'Тілесна терапевтка, йога тренер, жіночий ментор',
    instagram: 'https://www.instagram.com/anastasiyacherkis/',
    instagramHandle: '@anastasiyacherkis',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Cherkis.png',
    bonus: 'Консультація з психосоматики',
    description: 'Глибоке дослідження психосоматичних проявів та шляхи їх трансформації.',
    color: '#2d5a3d'
  },
  {
    name: 'Анна Балицька',
    role: 'Майстер кундаліні йоги, провідниця глибинних духовно-тілесних практик',
    instagram: 'https://www.instagram.com/annabalitskaya_kundaliniyoga/',
    instagramHandle: '@annabalitskaya_kundaliniyoga',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Frame%2048097618.png',
    bonus: 'Персональна консультація з майстром кундаліні йоги',
    description: 'Робота з запитом клієнта, підсвічування на що звернути увагу і рекомендація практик та дій, які можуть допомогти',
    color: '#d94a4a'
  },
  {
    name: 'Олена Ярема',
    role: 'Експертка з розвитку особистого бренду через Instagram',
    instagram: 'https://www.instagram.com/elena.yarema/',
    instagramHandle: '@elena.yarema',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/432775227_1159328098392853_5798591516054333811_n.jpg',
    bonus: 'Розбір блогу. Чи готовий ваш блог до монетизації',
    description: 'Детальний аналіз вашого блогу та конкретні рекомендації щодо підготовки до монетизації.',
    color: '#1e3a5f'
  },
  {
    name: 'Тетяна Славік',
    role: 'Психолог',
    instagram: 'https://www.instagram.com/tanya.slavik/',
    instagramHandle: '@tanya.slavik',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Slavik.png',
    bonus: '1,5 годинна сесія із повним закриттям запиту',
    description: 'Підсвітимо звідки іде запит і що з ним робити, працюю у науково доказових методах.',
    color: '#2d5a3d'
  },
  {
    name: 'Іра Іванова',
    role: 'Наставник жінок, Access bars, МАКкарти, Лідерка української компанії Choice',
    instagram: 'https://www.instagram.com/ira_nova_ivanova/',
    instagramHandle: '@ira_nova_ivanova',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Ivanova.png',
    bonus: 'Сесія МАК, один запит, тривалість 60-90 хвилин',
    description: 'Можливий як онлайн так і офлайн формати. Також подарунок від мене кожному, хто прийде на сесію доглядові засоби від бренду White Mandarin.',
    color: '#d94a4a'
  },
  {
    name: 'Ірина Вернигора',
    role: 'Астропсихолог, коуч',
    instagram: 'https://www.instagram.com/astra.kotiki/',
    instagramHandle: '@astra.kotiki',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Vernygora.png',
    bonus: 'Колода персональних карт-афірмацій та підбір мінералів по натальній карті',
    description: 'Унікальний набір персональних інструментів для вашої трансформації.',
    color: '#1e3a5f'
  },
  {
    name: 'Ванесса Січ',
    role: 'Візажист-стиліст, викладачка б\'юті курсів',
    instagram: 'https://www.instagram.com/vanessa.sich/',
    instagramHandle: '@vanessa.sich',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Sich.png',
    bonus: 'Урок "Сам собі візажист"',
    description: 'Навчу створювати ідеальний макіяж для себе в домашніх умовах.',
    color: '#e6963a'
  },
  {
    name: 'Ксенія Недолуженко',
    role: 'Лікар-дерматолог, психотерапевтка, художниця та авторка метафоричної колоди карт «Шлях трансформації»',
    instagram: 'https://www.instagram.com/dr_kseniya_nedoluzhenko/',
    instagramHandle: '@dr_kseniya_nedoluzhenko',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Nedolu.png',
    bonus: 'Авторська колода МАК карт',
    description: 'Унікальний інструмент для самопізнання та трансформації.',
    color: '#2d5a3d'
  },
  {
    name: 'Летиція Дубовик',
    role: 'Провідник для жінок. Досліджую, що і як нас робить по-справжньому проявленими',
    instagram: 'https://www.instagram.com/letytsia_d',
    instagramHandle: '@letytsia_d',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Letic.png',
    bonus: 'Потокова сесія (90 хв)',
    description: 'Глибоке дослідження вашої справжньої природи та прояву.',
    color: '#d94a4a'
  },
  {
    name: 'Ірина Фалатович',
    role: 'Експертка з монетизації та просування інстаграм',
    instagram: 'https://www.instagram.com/ira.falatovych/',
    instagramHandle: '@ira.falatovych',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/falatovich.png',
    bonus: 'Стратегічна сесія, яка перезапустить твій блог і прибере все зайве',
    description: 'Формат: онлайн зустріч тривалістю 60-90 хв.',
    color: '#1e3a5f'
  },
  {
    name: 'Андріана Кушнір',
    role: 'Арт-терапія',
    instagram: 'https://www.instagram.com/andrianna_kushnir/',
    instagramHandle: '@andrianna_kushnir',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Kushnir.png',
    bonus: 'Арт-терапевтична сесія «Хто я» та «Мама та дитина»',
    description: 'Глибока арт-терапевтична практика для самопізнання та розкриття вашої справжньої сутності.',
    color: '#e6963a'
  },
  {
    name: 'Катерина Вишня',
    role: 'Стилістка 45+, менторка жіночих брендів',
    instagram: 'https://www.instagram.com/vyshnya.brand.stylist/',
    instagramHandle: '@vyshnya.brand.stylist',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Vushnya.png',
    bonus: 'Кольорова карта персонального стилю',
    description: 'Унікальна кольорова карта, створена спеціально для вас, яка розкриє ваш персональний стиль.',
    color: '#2d5a3d'
  },
  {
    name: 'Анна Канаха',
    role: 'Fashion-психолог, стиліст та експерт з психологічного портрету особистості',
    instagram: 'https://www.instagram.com/anna.kanakha/',
    instagramHandle: '@anna.kanakha',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Kanakha.png',
    bonus: 'Індивідуальний річний прогноз 2026',
    description: 'Персональний прогноз на 2026 рік на основі психологічного портрету та системи Архетипів.',
    color: '#d94a4a'
  },
  {
    name: 'Лілія Братусь',
    role: 'Дизайнер одягу, власниця Lili Bratus Atelier, авторка Трансформаційних Програм для Жінок',
    instagram: 'https://www.instagram.com/lilibratus/',
    instagramHandle: '@lilibratus',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Frame%2048097616.png',
    bonus: 'Індивідуальна консультація по стилю по темі Образ як інструмент ресурсного стану',
    description: 'Персональна консультація для створення вашого унікального стилю та образу на рік.',
    color: '#1e3a5f'
  },
  {
    name: 'Kristina Elias',
    role: 'Мультидисциплінарність. Наука × Духовність, Бізнес × Творчість. CEO Wild Volt',
    instagram: 'https://www.instagram.com/kristin.elias/',
    instagramHandle: '@kristin.elias',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/KrisElias.png',
    bonus: 'Розбір «ПРОБУДЖЕННЯ ВЕНЕРИ» у вигляді VENUS MAP',
    description: 'Карта твоєї жіночої сили, природної краси, що світиться зсередини, глибокої чуттєвості, здорових стосунків.',
    color: '#e6963a'
  },
  {
    name: 'Саша',
    role: 'Тренер з пілатесу',
    instagram: 'https://www.instagram.com/oleksandra.balance/',
    instagramHandle: '@oleksandra.balance',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Sasha.png',
    bonus: '2 індивідуальних заняття по пілатесу на реформері',
    description: 'У найестетичнішій студії Ужгорода @Embody із преміум обладнянням «Merrithew». ОФЛАЙН УЖГОРОД.',
    color: '#2d5a3d'
  },
  {
    name: 'Оксана Шуфрич',
    role: 'Психолог-гіпнотерапевт',
    instagram: 'https://www.instagram.com/oksana_shufrych/',
    instagramHandle: '@oksana_shufrych',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/shufr.png',
    bonus: 'Консультація психолога-гіпнотерапевта',
    description: 'В сфері проявлення, ведення соцмереж, зміна професії чи виду діяльності.',
    color: '#d94a4a'
  },
  {
    name: 'Ольга Карабиньош',
    role: 'Перинатальна психологиня, ведуча жіночих практик',
    instagram: 'https://www.instagram.com/olga.karabinosh/',
    instagramHandle: '@olga.karabinosh',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Karab.png',
    bonus: 'Діагностично-терапевтична сесія "Мандала"',
    description: 'Глибока діагностично-терапевтична сесія тривалістю 60-90 хвилин.',
    color: '#1e3a5f'
  },
  {
    name: 'Чеканська Джулі',
    role: 'Музикантка, композиторка',
    instagram: 'https://www.instagram.com/musicjully.art/',
    instagramHandle: '@musicjully.art',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Chekanska.png',
    bonus: 'Створення унікальної фортепіанної мелодії',
    description: 'Створення унікальної фортепіанної мелодії від композиторки та музичної виконавиці ARWEN.\n\nМелодія створюється спеціально для вашої події, стану, емоції або фантазії.\nЦе ваша власна музична історія — унікальна, неповторна, з виключним правом на використання.\n\nВи отримуєте не просто звук, а живу історію у нотах, що відображає вашу індивідуальність, відчуття та настрій.',
    color: '#e6963a'
  },
  {
    name: 'Ірина Гончаренко',
    role: 'Тренер з інтимної гімнастики та жіночої сексуальності',
    instagram: 'https://www.instagram.com/irahappylife_/',
    instagramHandle: '@irahappylife_',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/goncharenko.png',
    bonus: 'Консультація на вибір: жіноче здоров\'я або внутрішній стан',
    description: 'Консультація з жіночого здоров\'я та м\'язів тазового дна:\nВизначаємо стан інтимних м\'язів і складаю практичні рекомендації для здоров\'я, тонусу та чуттєвості.\n\nАБО\n\nКонсультація з внутрішнього стану та життєвих ситуацій:\nДля жінок, які хочуть розібратися зі своїми емоціями й поточними станами — від апатії та втрати ресурсу до сімейних труднощів і повторюваних сценаріїв. Допомагаю знайти ясність, внутрішню опору та повернути відчуття себе.',
    color: '#d94a4a'
  },
  {
    name: 'Таня Прозорова',
    role: 'Тренерка дихання',
    instagram: 'https://www.instagram.com/tanyaprozorova_/',
    instagramHandle: '@tanyaprozorova_',
    photo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/Prozor.png',
    bonus: 'Акме-коуч сесія',
    description: 'Індивідуальна акме-коуч сесія для досягнення вашого максимального потенціалу та розкриття внутрішніх ресурсів.',
    color: '#2d5a3d'
  },
];

// Константи для партнерів - винесено для оптимізації
const PARTNERS = [
  { name: 'Lebet', logo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/lebet.png?raw=true', link: 'https://www.instagram.com/lebet.project', isRound: true },
  { name: 'Irina Kaniuk', logo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/image%2048.png?raw=true', link: 'https://www.instagram.com/irina_kaniuk_/', isRound: false },
  { name: 'Upgrade is Great', logo: 'https://raw.githubusercontent.com/Katywenkatwins/advent-marafon/main/upgrade_logo_grey.png', link: 'https://www.instagram.com/upgradeisgreat/', isRound: false },
  { name: 'Simply Happiness Inside', logo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/568253815_25118997134454367_3146515686541024656_n.jpg?raw=true', link: 'https://www.instagram.com/simply.happinessinside/', isRound: false },
  { name: 'Ameli Cosmetics', logo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Ameli.png?raw=true', link: 'https://www.instagram.com/amelicosmetics/', isRound: false },
  { name: 'Mych Objects', logo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/mich.jpg?raw=true', link: 'https://www.instagram.com/mych.objects/', isRound: true },
  { name: 'Valentyna Coach', logo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/coach.png?raw=true', link: 'https://www.instagram.com/valentyna__coach/', isRound: false },
];

// Константи для кроків - винесено для оптимізації
const STEPS_DATA = [
  {
    number: '1',
    title: 'Реєструєшся і обираєш свій тариф',
    description: 'Після оплати отримаєш доступ до інтерактивного календаря. Та запрошення в ТГ-канал спільноти',
    color: '#2d5a3d',
    bgColor: 'rgba(45,90,61,0.13)',
    borderColor: 'rgba(45,90,61,0.19)',
    DecorIcon: DecorativeBalls1,
  },
  {
    number: '2',
    title: 'Щодня о 6:00 ранку відкривається нова "дверцята"',
    description: 'Всередині — коротке відео від експерта, практика чи медитація, чек-лист або гайд.',
    color: '#d94a4a',
    bgColor: 'rgba(217,74,74,0.13)',
    borderColor: 'rgba(217,74,74,0.19)',
    DecorIcon: DecorativeCandy,
  },
  {
    number: '3',
    title: 'Виконуєш і відмічаєш "готово"',
    description: 'Спостерігай, як наповнюється твій ресурс і прогрес-бар — день за днем. А вкінці розіграш для тих, хто пройшов всі 24 дні з нами',
    color: '#e6963a',
    bgColor: 'rgba(230,150,58,0.13)',
    borderColor: 'rgba(230,150,58,0.19)',
    DecorIcon: DecorativeGift,
  },
];

// Константи для тем - винесено для оптимізації
const THEMES_DATA = [
  { 
    text: 'Заспокоїти тіло', 
    icon: Heart,
    topics: [
      'Твоя точка старту. Повернення в себе перед подорожжю',
      'Контакт із тілом у період свят: як залишатися в балансі без контролю та заборон',
      'Практика йоги',
      'Тема: фітозаряд «стоп-апатія» топ 5 продуктів',
      'Вправи для жіночого здоров\'я та енергії'
    ]
  },
  { 
    text: 'Зміцнити емоції', 
    icon: Sparkles,
    topics: [
      'Як легко вийти з залипання в емоції та ролі. Як відновити звʼязок з Душею та усвідомлено прискорюватись на шляху',
      'Музичний ритуал ранку і вечора: як звук відновлює емоції та внутрішню опору',
      'Як відчути себе та свою внутрішню жінку через фарби та техніки малювання. І як знайти баланс з внутрішнім своїм світом',
      'Створення мандали на намір'
    ]
  },
  { 
    text: 'Висвітлити цінності', 
    icon: Star,
    topics: [
      'Як проявлятись з відкритого серденька. Цілісність - ключ',
      'Як бути молодою, стильною й натхненною в будь-якому віці',
      'Венера в натальній карті - як проявити любов до себе'
    ]
  },
  { 
    text: 'Укріпити кордони', 
    icon: Shield,
    topics: [
      'Ідентичність, як перестати спиратися на зовнішнє і знайти внутрішню опору',
      'Швидкий мейк на Різдво🎄',
      'Інструменти у блозі, які змусять підписників купувати в 2026 р.',
      '«Динамічна медитація - інтуїтивний танець «Звʼязок душі і тіла». Наші кордони міцні, коли ми знаходимося «в тілі», добре відчуваємо контакт тіла і душі'
    ]
  },
  { 
    text: 'Розширити бачення', 
    icon: Globe,
    topics: [
      'Руни як мова душі. 24 дні до твого оновлення',
      'Підказки гри ліли',
      'Секрети роботи з клієнтами преміум сегменту. Практика вибір Творця',
      'Магія образу'
    ]
  },
  { 
    text: 'Прийняття і вдячність', 
    icon: Wind,
    topics: [
      'Дихальні практики',
      'Практика-медитація вдячності. Вдячність як інструмент трансформацій'
    ]
  },
  { 
    text: 'Налаштуватися на дію', 
    icon: Target,
    topics: [
      'Практика пілатесу. Включаємо тіло та заряджаємось на дію',
      '«2026 - рік великих змін та можливостей. Твоя маршрутна карта успіху»'
    ]
  }
];

export function LandingPage({ onStart, isAuthenticated, isLoading, onGoToCalendar }: LandingPageProps) {

  const handleMainAction = () => {
    if (isAuthenticated && onGoToCalendar) {
      onGoToCalendar();
    } else {
      onStart();
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };



  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#e8e4e1' }}>
      {/* Login Button - Fixed Top Right - Show only when not loading and not authenticated */}
      {!isLoading && !isAuthenticated && (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50">
          <Button
            onClick={onStart}
            size="lg"
            className="px-4 sm:px-6 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            style={{ backgroundColor: '#2d5a3d', color: 'white', fontFamily: 'Arial, sans-serif' }}
          >
            <LogIn className="w-5 h-5" />
            <span className="hidden sm:inline">Увійти</span>
          </Button>
        </div>
      )}

      {!isLoading && !isAuthenticated && (
        <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50">
          <div className="text-xl sm:text-2xl" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>
            Адвент-ресурсу
          </div>
        </div>
      )}

      {/* Декоративні фонові елементи */}
      <div className="fixed top-[-20px] left-0 opacity-20 pointer-events-none z-0 w-[80px] sm:w-[120px] md:w-[150px]">
        <ChristmasBalls />
      </div>
      
      {/* Олень - збільшений на 30% і ближче до кута */}
      <div className="fixed top-5 right-5 opacity-20 pointer-events-none z-0 w-[78px] sm:w-[130px] md:w-[156px]">
        <ChristmasTree />
      </div>
      
      <div className="fixed top-1/2 right-3/5 opacity-25 pointer-events-none z-0 w-[50px] sm:w-[80px] md:w-[100px]">
        <CandyCane />
      </div>
      
      <div className="fixed bottom-1/4 left-1/2 opacity-20 pointer-events-none z-0 rotate-45 w-[50px] sm:w-[80px] md:w-[100px]">
        <CandyCane />
      </div>
      
      {/* Подарунки - збільшені на 30% і ближче до кута */}
      <div className="fixed bottom-5 left-5 opacity-60 pointer-events-none z-0 w-[130px] sm:w-[195px] md:w-[260px]">
        <GiftsWithDecor />
      </div>
      
      <div className="fixed bottom-[-120px] right-[-80px] opacity-40 pointer-events-none rotate-15 z-0 scale-50 sm:scale-75 md:scale-100">
        <SnowflakeIcon />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32 relative">
          <div className="text-center space-y-6 sm:space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[1.2] lg:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              24 дні до твого оновлення
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-lg sm:text-xl md:text-2xl lg:text-[24px] max-w-4xl mx-auto leading-relaxed px-4" 
              style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
            >
              Інтерактивна подорож до себе — через практики, енергію й натхнення.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-3xl mx-auto space-y-4 px-4"
            >
              <p className="text-base sm:text-lg md:text-xl lg:text-[20px] leading-[28px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                Щодня відкривай нові дверцята — всередині тебе і на сайті.
              </p>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                Медитації, практики, міні-відео, поради й сюрпризи від 24 експертів — <br className="hidden sm:block" />
                щоб зустріти Новий рік у спокої, ресурсі й натхненні.
              </p>
            </motion.div>

            {/* Timer */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 mx-4" 
              style={{ borderColor: 'rgba(45,90,61,0.13)' }}
            >
              <p className="text-lg sm:text-xl mb-4" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>Стартуємо 1 грудня 2025 о 08:00</p>
              <CountdownTimer />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 px-4"
            >
              <Button
                onClick={handleMainAction}
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
              >
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                Взяти участь
              </Button>
              
              <Button
                onClick={scrollToAbout}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ borderColor: '#2d5a3d', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
              >
                Дізнатись більше
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16 sm:space-y-24 lg:space-y-32">
        
        {/* About Section */}
        <AnimatedSection direction="left">
          <div id="about-section" className="mt-12 sm:mt-16 lg:mt-24 scroll-mt-24">
            <div className="max-w-4xl mx-auto text-center space-y-6 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-xl border-2" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Що це за марафон?
            </h2>
            
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              <p className="text-xl sm:text-2xl lg:text-[24px] leading-[32px]" style={{ color: '#2d5a3d', fontWeight: 'bold' }}>
                Це не просто марафон.<br />
                Це 24-денна мандрівка до себе — через тіло, емоції, красу, рух і внутрішню гармонію.
              </p>
              
              <p className="text-sm sm:text-base lg:text-[16px] leading-[24px]">
                Кожного ранку відкривай нові "дверцята" у нашому інтерактивному календарі, де тебе чекають відео-привітання, практика, поради й подарунки від експертів у своїй сфері.
              </p>
              
              <p className="text-lg sm:text-xl lg:text-[24px] leading-[32px] pt-4" style={{ color: '#d94a4a' }}>
                Ніяких довгих лекцій — лише 10–15 хвилин на день, щоб наповнитись і налаштуватись на новий рік.
              </p>

              {/* Благодійна місія */}
              <div className="pt-6 space-y-3 bg-gradient-to-br from-[#2d5a3d]/10 to-[#d94a4a]/10 rounded-2xl p-6 border-2" style={{ borderColor: '#2d5a3d' }}>
                <p className="text-lg sm:text-xl lg:text-[20px] leading-[28px] flex items-start gap-2" style={{ color: '#2d5a3d', fontWeight: 'bold' }}>
                  <Heart className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#d94a4a' }} />
                  Цього року проєкт матиме ще одну важливу місію:
                </p>
                <p className="text-sm sm:text-base lg:text-[16px] leading-[24px]">
                  частину коштів з кожного продажу ми передаємо в БФ "Маємо Жити" на подарунки дітям полеглих героїв до Дня св. Миколая.
                </p>
                <p className="text-sm sm:text-base lg:text-[16px] leading-[24px]">
                  А ще — 100 жінок спільноти "Маємо Жити" - дружин полеглих воїнів, зможуть пройти марафон безкоштовно.
                </p>
                <p className="text-base sm:text-lg lg:text-[18px] leading-[26px] pt-2 italic" style={{ color: '#2d5a3d' }}>
                  Ми хочемо, щоб тепло проєкту відчули ті, кому зараз найскладніше.
                </p>
              </div>

              {/* Розіграш подарунків */}
              <div className="pt-4 space-y-3 bg-gradient-to-br from-[#d94a4a]/10 to-[#CF7A2C]/10 rounded-2xl p-6 border-2" style={{ borderColor: '#d94a4a' }}>
                <p className="text-lg sm:text-xl lg:text-[20px] leading-[28px] flex items-start gap-2" style={{ color: '#d94a4a', fontWeight: 'bold' }}>
                  <Gift className="w-6 h-6 flex-shrink-0 mt-1" />
                  Розіграш подарунків від партнерів
                </p>
                <p className="text-sm sm:text-base lg:text-[16px] leading-[24px]">
                  Всі учасниці марафону автоматично беруть участь у розіграші цінних подарунків від наших партнерів. Чим активніше ти проходиш практики — тим більше шансів виграти!
                </p>
              </div>
            </div>

            <div className="pt-8">
              <div className="inline-block bg-gradient-to-b from-[#2d5a3d] to-[#1e3a5f] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg">
                <Calendar className="inline-block w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                <span className="text-base sm:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>всередині тебе чекає 24 двері до ресурсу</span>
              </div>
            </div>
          </div>
        </div>
        </AnimatedSection>

        {/* Video Section - Як виг��ядає Адвент Календар */}
        <AnimatedSection direction="right">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border-2 space-y-6" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h2 
              className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Як виглядає Адвент Календар
            </h2>
            
            <p className="text-center text-lg sm:text-xl lg:text-[20px] leading-[28px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Інтерактивний календар з 24 дверцятами — кожен день нова практика від експерта
            </p>

            {/* YouTube Video Embed */}
            <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-2xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/xXp3TXVJWBw?start=1"
                title="Адвент Календар - Демо"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection direction="left">
        <div className="space-y-8 sm:space-y-12">
          <h2 
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Як усе відбувається
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {STEPS_DATA.map((step, idx) => (
              <div
                key={idx}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden min-h-[280px] sm:min-h-[300px]"
                style={{ borderColor: step.borderColor }}
              >
                <div 
                  className="absolute size-12 rounded-full flex items-center justify-center left-6 sm:left-8 top-6 sm:top-8"
                  style={{ backgroundColor: step.bgColor }}
                >
                  <span className="text-xl sm:text-2xl" style={{ color: step.color, fontFamily: 'Arial, sans-serif' }}>{step.number}</span>
                </div>
                
                <h3 className="text-base sm:text-lg md:text-xl leading-[28px] mt-20 sm:mt-24 mb-3 sm:mb-4" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base leading-[24px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  {step.description}
                </p>

                {/* Декоративний елемент */}
                {idx === 0 && (
                  <div className="absolute right-[-30px] top-[-10px] w-[150px] h-[224px] opacity-20 pointer-events-none">
                    <DecorativeBalls1 />
                  </div>
                )}
                {idx === 1 && (
                  <div className="absolute right-[-20px] top-[-30px] w-[193px] h-[217px] opacity-40 pointer-events-none rotate-[9.7deg]">
                    <DecorativeCandy />
                  </div>
                )}
                {idx === 2 && (
                  <div className="absolute right-[20px] top-0 opacity-40 pointer-events-none rotate-[8.8deg]">
                    <DecorativeGift />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </AnimatedSection>

        {/* What You'll Get Section */}
        <AnimatedSection direction="right">
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Що ти отримаєш
            </h2>
            <p className="text-xl sm:text-2xl lg:text-[24px] leading-[32px]" style={{ color: '#1e3a5f', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
              24 кроки до твого оновлення
            </p>
            <p className="text-lg sm:text-xl lg:text-[20px] leading-[28px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Кожен день — нова тема, нова грань тебе.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              {THEMES_DATA.map((theme, idx) => {
                const IconComponent = theme.icon;
                return (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`}
                    className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border-2 overflow-hidden"
                    style={{ borderColor: 'rgba(45,90,61,0.13)' }}
                  >
                    <AccordionTrigger className="px-5 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-white/50 transition-all duration-300 [&[data-state=open]]:bg-white/50">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#2d5a3d' }} />
                        </div>
                        <span className="text-base sm:text-lg leading-[28px] text-left" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                          {theme.text}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 sm:px-6 pb-4 sm:pb-5">
                      <ul className="space-y-2 sm:space-y-3 mt-2 ml-11 sm:ml-14">
                        {theme.topics.map((topic, topicIdx) => (
                          <li 
                            key={topicIdx}
                            className="text-sm sm:text-base leading-[24px] flex items-start gap-2"
                            style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                          >
                            <span className="text-[#2d5a3d] mt-1 flex-shrink-0">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#2d5a3d] to-[#1e3a5f] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-xl text-white space-y-4 sm:space-y-6 relative overflow-hidden">
            {/* Декоративні подарунки в правому нижньому куті - під текстом */}
            <div className="absolute bottom-[-20px] right-[-30px] opacity-100 pointer-events-none w-[150px] sm:w-[180px] z-0">
              <GiftsDecoration />
            </div>
            
            <p className="text-xl sm:text-2xl text-center mb-4 sm:mb-6 relative z-10" style={{ fontFamily: 'Arial, sans-serif' }}>Після проходження марафону ти:</p>
            <div className="space-y-3 sm:space-y-4 relative z-10">
              {[
                'відчуєш глибший зв\'язок із тілом та енергією,',
                'очистиш розум і навчишся легко відновлювати ресурс,',
                'побачиш своє "нове я" — спокійне, впевнене й цілісне.',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>{benefit}</p>
                </div>
              ))}
            </div>
            
            {/* Кнопка обрати тариф */}
            <div className="text-center pt-4 sm:pt-6 relative z-10">
              <a href="#pricing">
                <Button 
                  className="bg-white text-[#2d5a3d] hover:bg-white/90 px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}
                >
                  Обрати тариф
                </Button>
              </a>
            </div>
          </div>
        </div>
        </AnimatedSection>

        {/* Experts Section */}
        <AnimatedSection direction="left">
        <div className="space-y-8 sm:space-y-12">
          <h2 
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Хто з тобою
          </h2>
          
          <div className="text-center space-y-4">
            <p className="text-2xl sm:text-3xl" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
              24 експерти. 24 джерела сили.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-xl border-2 space-y-4 sm:space-y-6" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <p className="text-lg sm:text-xl text-center" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              У календарі ти зустрінеш:
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              <strong style={{ color: '#2d5a3d' }}>йога-інструкторів</strong>, <strong style={{ color: '#2d5a3d' }}>психологів</strong>, <strong style={{ color: '#2d5a3d' }}>астрологів</strong>, <strong style={{ color: '#2d5a3d' }}>нутріціологів</strong>, <strong style={{ color: '#2d5a3d' }}>експертів із краси</strong>, <strong style={{ color: '#2d5a3d' }}>стилю</strong>,
              <strong style={{ color: '#2d5a3d' }}> енергопрактиків</strong>, <strong style={{ color: '#2d5a3d' }}>музикантів</strong>, <strong style={{ color: '#2d5a3d' }}>маркетологів</strong>, <strong style={{ color: '#2d5a3d' }}>арт-терапетів</strong> і ще багатьох інших.
            </p>

            <p className="text-lg sm:text-xl text-center pt-4" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
              Кожен із них — світло у своїй сфері, і вони поділяться з тобою своїм ресурсом.
            </p>

            {/* Expert Slider */}
            <ExpertSlider experts={[
              { name: 'Сміян Катерина', instagram: 'kateryna_smiian', description: 'Веб-дизайнерка, стратег і творча менторка', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Frame%20289%203.png?raw=true' },
              { name: 'Анастасія Черкіс', instagram: 'anastasiyacherkis', description: 'Тілесна терапевтка, йога тренер, жіночий ментор', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Cherkis.png?raw=true' },
              { name: 'Анна Балицька', instagram: 'annabalitskaya_kundaliniyoga', description: 'Майстер кундаліні йоги, провідниця глибинних духовно-тілесних практик та авторка трансформаційних програм, які пройшли вже тисячі практикуючих по всьому світу', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Frame%2048097618.png?raw=true' },
              { name: 'Тетяна Славік', instagram: 'tanya.slavik', description: 'Психолог', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Slavik.png?raw=true' },
              { name: 'Чеканська Джулі', instagram: 'musicjully.art', description: 'Музикантка, композиторка', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Chekanska.png?raw=true' },
              { name: 'Олександр Король', instagram: 'dvaaya', description: 'Засновник школи буття «kNow»', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Korol.png?raw=true' },
              { name: 'Іра Іванова', instagram: 'ira_nova_ivanova', description: 'Наставник жінок, Access bars, МАКкарти', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Ivanova.png?raw=true' },
              { name: 'Ірина Вернигора', instagram: 'astra.kotiki', description: 'Астропсихолог, коуч', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Vernygora.png?raw=true' },
              { name: 'Лабік Наталі', instagram: 'labyknatali', description: 'Йога-провідник', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Labik.png?raw=true' },
              { name: 'Анна Стояновська', instagram: 'anna_greeen_', description: 'Ведичний нутріціолог', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Green.png?raw=true' },
              { name: 'Ванесса Січ', instagram: 'vanessa.sich', description: 'Візажист-стиліст, викладачка б\'юті курсів', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Sich.png?raw=true' },
              { name: 'Наталія Прокопчук', instagram: 'prokopchukart_com', description: 'Архітектор особистих брендів', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Prokop.png?raw=true' },
              { name: 'Андріана Кушнір', instagram: 'andrianna_kushnir', description: 'Арт-терапевт, художник, засновник та організатор Арт-проєкту «Мама та донька»', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Kushnir.png?raw=true' },
              { name: 'Саша', instagram: 'oleksandra.balance', description: 'Тренер з пілатесу', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Sasha.png?raw=true' },
              { name: 'Ольга Карабиньош', instagram: 'o.karabinyosh', description: 'Перинатальна психологиня, ведуча жіночих практик', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Karab.png?raw=true' },
              { name: 'Ксенія Недолуженко', instagram: 'dr_kseniya_nedoluzhenko', description: 'Лікар-дерматолог, психотерапевтка, художниця', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Nedolu.png?raw=true' },
              { name: 'Летиція Дубовик', instagram: 'letytsia_d', description: 'Провідник для жінок', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Letic.png?raw=true' },
              { name: 'Ірина Фалатович', instagram: 'ira.falatovych', description: 'Експертка з монетизації та просування Instagram', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/falatovich.png?raw=true' },
              { name: 'Ірина Гончаренко', instagram: 'irahappylife_', description: 'Тренер з інтимної гімнастики та жіночої сексуальності', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/goncharenko.png?raw=true' },
              { name: 'Катерина Вишня', instagram: 'vyshnya.brand.stylist', description: 'Стилістка 45+, менторка жіночих брендів', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Vushnya.png?raw=true' },
              { name: 'Анна Канаха', instagram: 'anna.kanakha', description: 'Fashion-психолог, стиліст та експерт з психологічного портрету особистості по даті народження через систему Архетипів', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Kanakha.png?raw=true' },
              { name: 'Лілія Братусь', instagram: 'lilibratus', description: 'Дизайнер одягу, власниця Lili Bratus Atelier, авторка Трансформаційних Програм для Жінок', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Frame%2048097616.png?raw=true' },
              { name: 'Kristina Elias', instagram: 'kristin.elias', description: 'Мультидисциплінарність. Наука × Духовність, Бізнес × Творчість. CEO Wild Volt', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/KrisElias.png?raw=true' },
              { name: 'Таня Прозорова', instagram: 'tanyaprozorova_', description: 'Тренерка дихання', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Prozor.png?raw=true' },
              { name: 'Оксана Шуфрич', instagram: 'oksana.shufrych', description: 'Психолог, кінезіолог, гіпнотерапевт, трансформаційна менторка для жінок', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/shufr.png?raw=true' },
              { name: 'Олена Ярема', instagram: 'elena.yarema', description: 'Експертка з розвитку особистого бренду через Instagram', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/432775227_1159328098392853_5798591516054333811_n.jpg?raw=true' },
              { name: 'Жанна Баграмян', instagram: 'zhanna.bagramian', description: 'Маркетолог та продюсер навчальних проектів. Партнер стартапу HRMNY WOMEN. Co-founder спільноти жінок-лідерок «Заграва». Магістр психології', photo: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Bagram.png?raw=true' },
            ]} />
          </div>
        </div>
        </AnimatedSection>

        {/* Partners Section */}
        <AnimatedSection direction="left">
        <div className="space-y-8 sm:space-y-12">
          <h2 
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Партнери проєкту
          </h2>
          
          <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
            <p className="text-xl sm:text-2xl lg:text-[24px] leading-[32px]" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
              Разом створюємо магію Адвент-календаря
            </p>
            <p className="text-base sm:text-lg lg:text-[18px] leading-[26px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Дякуємо нашим партнерам за підтримку проєкту та цінні подарунки для учасниць марафону
            </p>
          </div>

          {/* Логотипи партнерів */}
          <div className="flex justify-center items-center gap-8 py-4 px-4 flex-wrap">
            {PARTNERS.map((partner, idx) => (
              <a
                key={idx}
                href={partner.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center flex-shrink-0 ${partner.isRound ? 'h-20 w-20' : 'h-20 w-40'}`}
              >
                <ImageWithFallback
                  src={partner.logo}
                  alt={partner.name}
                  className={`grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${partner.isRound ? 'w-20 h-20 rounded-full object-cover' : 'max-w-full max-h-full object-contain'}`}
                />
              </a>
            ))}
          </div>

          <div className="text-center pt-6">
            <p className="text-base sm:text-lg italic" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Хочете стати партнером проєкту? Напишіть нам!
            </p>
          </div>
        </div>
        </AnimatedSection>

        {/* Pricing Section */}
        <AnimatedSection direction="right">
        <div id="pricing" className="space-y-8 sm:space-y-12" style={{ minHeight: '100px', visibility: 'visible', display: 'block' }}>
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px] px-4" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Обери свій рівень подорожі
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            {/* Basic Tier - Світло */}
            <div className="bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group flex flex-col"
                 style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
              <div className="relative space-y-4 sm:space-y-6 flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl mb-2" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Світло</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>€10</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>24 дні практик</p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>~20 грн/день</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Доступ до календаря на місяць',
                    'Щоденні практики',
                    'Базові матеріали від експертів',
                    'Трекер прогресу',
                    'Спільнота учасників',
                    'Участь у розіграші подарунків від партнерів',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#2d5a3d' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleMainAction}
                className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                style={{ backgroundColor: '#2d5a3d', color: 'white', fontFamily: 'Arial, sans-serif' }}
              >
                {isAuthenticated ? 'Обрати тариф' : 'Взяти участь'}
              </Button>
            </div>

            {/* Premium Tier - Магія */}
            <div className="bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-4 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible group transform md:scale-105 flex flex-col"
                 style={{ borderColor: '#d94a4a' }}>
              <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" 
                   style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}>
                Популярний
              </div>
              
              <div className="relative space-y-4 sm:space-y-6 mt-4 flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl mb-2" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Магія</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>€35</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>+ чати, ефіри</p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>~70 грн/день</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Все з тарифу "Світло"',
                    'Розширені PDF-гайди, практики',
                    'Додаткові бонуси від експертів',
                    'Доступ до всіх практик на 3 місяці',
                    'Щотижневі live-ефіри',
                    'Персональні рекомендації',
                    'Участь у розіграші подарунків від партнерів',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#d94a4a' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div> 

              <Button
                onClick={handleMainAction}
                className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 mt-6"
                style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
              >
                {isAuthenticated ? 'Обрати тариф' : 'Взяти участь'}
              </Button>
            </div>

            {/* VIP Tier - Диво */}
            <div className="bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group flex flex-col"
                 style={{ borderColor: 'rgba(230,150,58,0.13)' }}>
              <div className="relative space-y-4 sm:space-y-6 flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl mb-2" style={{ color: '#e6963a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Диво</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl" style={{ color: '#e6963a', fontFamily: 'Arial, sans-serif' }}>€100</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>+ консультація, бонусні подарунки</p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>~200 грн/день</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Все з тарифу "Магія"',
                    'VIP-доступ до всіх матеріалів на 6 місяців',
                    'Індивідуальна консультація з одним з експертів',
                    'Додаткові 3 ефіри з амбасадорами проєкту',
                    'Закрита VIP спільнота',
                    'Бонусні подарунки',
                    'Пріоритетна підтримка',
                    'Участь у розіграші подарунків від партнерів',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#e6963a' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleMainAction}
                className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                style={{ backgroundColor: '#e6963a', color: 'white', fontFamily: 'Arial, sans-serif' }}
              >
                {isAuthenticated ? 'Обрати тариф' : 'Взяти участь'}
              </Button>
            </div>
          </div>

          <p className="text-center text-base sm:text-lg mt-6 sm:mt-8 max-w-2xl mx-auto px-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            Кожен тариф відкриває свій рівень глибини.<br />
            Обери той, який відповідає твоєму стану зараз 💛
          </p>
        </div>

        {/* Bonus Selection for "Диво" Tier */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#e6963a]/10 to-[#d94a4a]/10 rounded-3xl shadow-2xl border-2 relative z-10 p-2 min-[500px]:p-6 sm:p-8" style={{ borderColor: '#e6963a' }}>
            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#e6963a', color: 'white' }}>
                <Star className="w-5 h-5" />
                <span className="text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>Для тарифу "Диво"</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl" style={{ color: '#e6963a', fontFamily: "'Dela Gothic One', sans-serif", letterSpacing: '-1px' }}>
                Обери свій бонус від експерта
              </h3>
              <p className="text-sm sm:text-base max-w-2xl mx-auto px-2" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                При виборі тарифу "Диво" ви обираєте один бонус зі списку нижче. <br />
                Наші менеджери зв'яжуться з вами, зафіксують ваш вибір і організують бонус разом з експертом. Обрати цей бонус можна і під час марафону після знайомства з експертом
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {VIP_EXPERTS.map((expert, idx) => (
                <AccordionItem 
                  key={idx} 
                  value={`expert-${idx}`}
                  className="bg-white/90 rounded-2xl border-2 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  style={{ borderColor: 'rgba(230,150,58,0.3)' }}
                >
                  <AccordionTrigger className="px-4 sm:px-5 py-3 sm:py-4 hover:no-underline">
                    <div className="flex items-center justify-between gap-3 w-full text-left">
                      <div className="text-base sm:text-lg" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                        {expert.bonus}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-5 pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
                      {/* Фото експерта */}
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={expert.photo}
                          alt={expert.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4"
                          style={{ borderColor: expert.color }}
                        />
                      </div>
                      
                      {/* Інформація про експерта */}
                      <div className="flex-grow space-y-2">
                        <h4 className="text-lg sm:text-xl" style={{ color: expert.color, fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                          {expert.name}
                        </h4>
                        <p className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                          {expert.role}
                        </p>
                        <p className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                          {expert.description}
                        </p>
                        
                        {/* Соцмережі */}
                        <a 
                          href={expert.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm sm:text-base hover:opacity-80 transition-opacity"
                          style={{ color: expert.color, fontFamily: 'Arial, sans-serif' }}
                        >
                          <Users className="w-4 h-4" />
                          <span>{expert.instagramHandle}</span>
                        </a>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 p-6 rounded-2xl text-center" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
              <p className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                💫 Після оплати тарифу "Диво" наші менеджери зв'яжуться з вами протягом 24 годин для узгодження деталей вашого обраного бонуса
              </p>
            </div>
          </div>
        </div>
        </AnimatedSection>

        {/* Testimonial Section */}
        <AnimatedSection direction="left">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#d94a4a] to-[#e6963a] rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl text-white text-center space-y-4 sm:space-y-6 relative overflow-hidden">
            {/* Декоративна сніжинка в правому куті - під текстом */}
            <div className="absolute bottom-[-50px] right-[-20px] sm:right-[-50px] opacity-100 pointer-events-none w-[150px] sm:w-[200px] rotate-180 scale-y-[-100%] z-0">
              <SnowflakeDecor />
            </div>
            
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center relative z-10">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl italic leading-relaxed relative z-10" style={{ fontFamily: 'Arial, sans-serif' }}>
              "Ми створили цей календар, щоб нагадати кожній жінці:<br className="hidden sm:block" />
              новорічне диво — це ти."
            </p>
            <p className="text-lg sm:text-xl opacity-90 relative z-10" style={{ fontFamily: 'Arial, sans-serif' }}>
              — Катерина Сміян, авторка проєкту
            </p>
          </div>
        </div>
        </AnimatedSection>

        {/* Final CTA Section */}
        <AnimatedSection direction="right">
        <div className="text-center space-y-6 sm:space-y-8 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-xl border-2 mx-4" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Готова відкрити перші дверцята?
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            Не чекай нового року, щоб змінитись.<br />
            Почни вже зараз — з першого кроку до себе.
          </p>

          <div className="pt-4">
            <Button
              onClick={handleMainAction}
              size="lg"
              className="w-full sm:w-auto mx-auto px-12 sm:px-16 py-6 sm:py-8 text-xl sm:text-2xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center gap-2 justify-center"
              style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
            >
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="sm:hidden">Приєднатись</span>
              <span className="hidden sm:inline">Приєднатись до календаря</span>
            </Button>
          </div>

          {/* Timer */}
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-[#2d5a3d] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl text-white mt-6 sm:mt-8">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              <p className="text-base sm:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>До старту залишилось:</p>
            </div>
            <CountdownTimer dark />
          </div>
        </div>
        </AnimatedSection>
      </div>

      {/* Footer */}
      <footer className="border-t-2 py-8 sm:py-12 mt-16 sm:mt-24" style={{ borderColor: 'rgba(45,90,61,0.13)', backgroundColor: '#faf8f5' }}>
        <div className="max-w-6xl mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <p className="text-base sm:text-lg" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
            © 2025 "Адвент-марафон ресурсу"
          </p>
          <p className="text-base sm:text-lg" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
            Створено з любов&apos;ю 
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm pt-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            <Link to="/contacts" className="hover:underline">Контакти</Link>
            <Link to="/offer" className="hover:underline">Договір оферти</Link>
            <Link to="/privacy-policy" className="hover:underline">Політика конфіденційності</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}