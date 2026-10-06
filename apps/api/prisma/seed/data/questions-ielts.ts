import type { SeedQuestion } from '../types';

/** IELTS savollari: Listening (12), Reading (14), Writing (10), Speaking (10) = 46. */
export const IELTS_QUESTIONS: SeedQuestion[] = [
  // ── ielts-listening ─────────────────────────────────────────────────────
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    passage: [
      'Doktor: Bemor dastlab 09:30 da kelgan, ammo navbat bo‘yicha 10:15 da qabul qilingan.',
      'Doctor: The patient arrived at 09:30 but was seen at 10:15 according to the queue.',
    ],
    p: ['Bemor qachon qabul qilingan?', 'When was the patient seen?'],
    options: [
      { label: { uz: '09:30', en: '09:30' } },
      { label: { uz: '10:15', en: '10:15' }, correct: true },
      { label: { uz: '10:00', en: '10:00' } },
      { label: { uz: '09:45', en: '09:45' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 45,
    passage: [
      'Talaba registratsiyani onlayn bajaradi, lekin pochta orqali hujjat yubormasligi kerak.',
      'Students complete registration online but must not send documents by post.',
    ],
    p: [
      'Talaba hujjatlarni qanday yuborishi kerak emas?',
      'How must the student NOT send the documents?',
    ],
    options: [
      { label: { uz: 'Pochta orqali', en: 'By post' }, correct: true },
      { label: { uz: 'Onlayn', en: 'Online' } },
      { label: { uz: 'E-posta orqali', en: 'By email' } },
      { label: { uz: 'Shaxsan', en: 'In person' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 60,
    passage: [
      'Muzey yopilishiga 15 daqiqa qoldi. Bunday holda kirish kartasi ustidan ikki marta bosiladi.',
      'The museum closes in 15 minutes. In that case you tap the entry card twice.',
    ],
    p: ['Kartani necha marta bosish kerak?', 'How many times do you tap the card?'],
    options: [
      { label: { uz: 'Bir marta', en: 'Once' } },
      { label: { uz: 'Ikki marta', en: 'Twice' }, correct: true },
      { label: { uz: 'Uch marta', en: 'Three times' } },
      { label: { uz: 'Boshirish shart emas', en: 'No tap is needed' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 60,
    passage: [
      'Bilet narxi dushanbadan payshanbagacha 12 funt, dam olish kunlari esa 18 funt.',
      'The ticket costs £12 from Monday to Friday and £18 at weekends.',
    ],
    p: ['Payshanba kuni bilet narxi qancha?', 'What is the ticket price on Thursday?'],
    options: [
      { label: { uz: '12 funt', en: '£12' }, correct: true },
      { label: { uz: '18 funt', en: '£18' } },
      { label: { uz: '15 funt', en: '£15' } },
      { label: { uz: '10 funt', en: '£10' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 75,
    passage: [
      'Ilmiy ish bo‘yicha ariza 30-noyabrda topshiriladi, ko‘rib chiqish esa 15-yanvarda yakunlanadi.',
      'The research proposal is submitted on 30 November and the review finishes on 15 January.',
    ],
    p: ['Ko‘rib chiqish qancha kun davom etadi?', 'How long does the review take?'],
    options: [
      { label: { uz: '46 kun', en: '46 days' }, correct: true },
      { label: { uz: '30 kun', en: '30 days' } },
      { label: { uz: '15 kun', en: '15 days' } },
      { label: { uz: '60 kun', en: '60 days' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 75,
    passage: [
      'Agar ariza kech bo‘lsa, uni yuborish muddati avtomatik ravishda uzaytirilmaydi.',
      'If the application is late, the deadline is not extended automatically.',
    ],
    p: ['Kech ariza uchun nima bo‘ladi?', 'What happens to a late application?'],
    options: [
      { label: { uz: 'Muddat avtomatik uzayadi', en: 'The deadline extends automatically' } },
      { label: { uz: 'Muddat uzaytirilmaydi', en: 'The deadline is not extended' }, correct: true },
      { label: { uz: 'Ariza butunlay rad etiladi', en: 'The application is rejected outright' } },
      { label: { uz: 'Jarima solinadi', en: 'A fee is charged' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 90,
    passage: [
      'Kursni tugatgan talabalar 50 % chegirmaga ega bo‘ladi, lekin buni o‘zlari to‘lov paytida so‘rishi kerak.',
      'Students who complete the course receive a 50% discount, but they must request it themselves at payment.',
    ],
    p: [
      'Chegirma olish uchun nima kerak?',
      'What is required to obtain the discount?',
    ],
    options: [
      { label: { uz: 'Uni o‘zi so‘rishi', en: 'Requesting it themselves' }, correct: true },
      { label: { uz: 'Hekim avtomatik beradi', en: 'It is granted automatically' } },
      { label: { uz: 'Faqat guruh bo‘lishi', en: 'Only group membership' } },
      { label: { uz: 'Maxsus hujjat', en: 'A special document' } },
    ],
  },
  {
    skill: 'ielts-listening',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 90,
    passage: [
      'Registrlar birinchi bo‘lib to‘ldirilgani uchun emas, balki eng to‘liq to‘ldirilgani uchun e’tiborga olinadi.',
      'Registration places are awarded on completeness, not on order of arrival.',
    ],
    p: [
      'Nima bo‘yicha joylar beriladi?',
      'On what basis are places awarded?',
    ],
    options: [
      { label: { uz: 'Ariza to‘liqligi bo‘yicha', en: 'On how complete the application is' }, correct: true },
      { label: { uz: 'Kelish tartibi bo‘yicha', en: 'On who arrived first' } },
      { label: { uz: 'Yosh bo‘yicha', en: 'On age' } },
      { label: { uz: 'To‘lov miqdori bo‘yicha', en: 'On the amount paid' } },
    ],
  },

  // ── ielts-reading ───────────────────────────────────────────────────────
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 90,
    passage: [
      'Ritiyalarda elektr energiyasi ishlab chiqarish uchun o‘tin yoki boshqa biomass yoqiladi. Bu jarayonda atmosferaga CO₂ chiqadi, biroq u o‘rmondagi o‘sish tezligidan sezilarli tez.',
      'Traditional kilns burn wood or other biomass to generate heat. The process releases CO₂, but far more slowly than forest regrowth.',
    ],
    p: [
      'Muallifga ko‘ra, ushbu usul nima uchun kamroq zararli?',
      'According to the author, why is this method less harmful?',
    ],
    options: [
      { label: { uz: 'CH₂ chiqishi juda past', en: 'CO₂ output is very low' }, correct: true },
      { label: { uz: 'Yo‘q zaharli moddalar chiqadi', en: 'No harmful substances are released' } },
      { label: { uz: 'Bu usul juda qimmat', en: 'The method is expensive' } },
      { label: { uz: 'Atmosfera CO₂ ga boy emas', en: 'The atmosphere has little CO₂' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    passage: [
      'Chet el universitetlarida ayrim hollarda o‘qitish bepul bo‘ladi. Talaba o‘zi davlat qarorini to‘lab turadi. Ammo ko‘pchilik mamlakatlarda bunday yondashuv sekin o‘zgarib boradi.',
      'In some countries university is tuition-free. Students simply keep paying the state. However, in most countries this model is slowly changing.',
    ],
    p: [
      'Bepul ta’lim qaysi holatda saqlanib qolmoqda?',
      'Where does free tuition remain in place?',
    ],
    options: [
      { label: { uz: 'Ba’zi mamlakatlarda', en: 'In some countries' }, correct: true },
      { label: { uz: 'Barcha mamlakatlarda', en: 'In all countries' } },
      { label: { uz: 'Faqat Yevropada', en: 'In Europe only' } },
      { label: { uz: 'Hali hech qayerda', en: 'Nowhere yet' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    passage: [
      'Tadqiqotchilar o‘qituvchilarni ikki guruhga ajratgan: tajribali (o‘n yil+) va yangi (ikki yildan kam). Natijada tajribali o‘qituvchilar o‘zlarining xatosini tezroq tanib olgan.',
      'Researchers split teachers into experienced (10+ years) and novice (under two years). Experienced teachers recognised their own mistakes faster.',
    ],
    p: [
      'Tadqiqotning asosiy natijasi nima?',
      'What is the main finding of the study?',
    ],
    options: [
      { label: { uz: 'Tajribali o‘qituvchilar o‘z xatosini tezroq aniqlaydi', en: 'Experienced teachers identify their own errors faster' }, correct: true },
      { label: { uz: 'Yangi o‘qituvchilar kam xato qiladi', en: 'Novice teachers make fewer mistakes' } },
      { label: { uz: 'Tajriba o‘z-o‘ziga ta’sir qilmaydi', en: 'Experience makes no difference' } },
      { label: { uz: 'Yangi o‘qituvchilar tezroq o‘qitadi', en: 'Novice teachers teach faster' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    passage: [
      'Shaharlarda havo ifloslanishi avval asosan transport orqali kelgan. Bugungi kunda sanoat va qurilish ulushi sezilarli oshgan.',
      'Urban air pollution used to come mainly from transport. Today the share of industry and construction has grown markedly.',
    ],
    p: [
      'Havo ifloslanishining manbai qanday o‘zgardi?',
      'How has the source of air pollution changed?',
    ],
    options: [
      { label: { uz: 'Transport ulushi kamaydi, sanoat ulushi oshdi', en: 'Transport fell while industry grew' }, correct: true },
      { label: { uz: 'Transport ulushi oshdi', en: 'Transport grew' } },
      { label: { uz: 'Sanoat butunlay yo‘q oldi', en: 'Industry disappeared' } },
      { label: { uz: 'O‘zgargan yo‘q', en: 'Nothing changed' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    passage: [
      'Muallif o‘z maqolasida yozadi: "Bu raqamlar islohotni qo‘llab-quvvatlaydi, ammo uni kuzatuv emas."',
      'The author writes: “These figures support the reform, but they do not verify it.”',
    ],
    p: [
      'Muallifning urg‘usi nimaga qaratilgan?',
      'What is the author’s emphasis on?',
    ],
    options: [
      { label: { uz: 'Raqamlar yetarli dalil emas', en: 'That the numbers are not sufficient proof' }, correct: true },
      { label: { uz: 'Islohot butunlay ishlamaydi', en: 'That the reform fails completely' } },
      { label: { uz: 'Islohot allaqachon yakunlangan', en: 'That the reform is already complete' } },
      { label: { uz: 'Ma’lumotlar noto‘g‘ri', en: 'That the data is wrong' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    passage: [
      'Kitobxonalarning raqamli resurslari o‘sdi, biroq umumiy foydalanish kamaya boshladi. Sabab — talabalar manbani topishda yordamchi vositalarga murojaat qilmoqda.',
      'Digital collections at libraries grew, yet overall use declined. The reason: students now turn to search tools to find sources.',
    ],
    p: [
      'Raqamli resurslar ko‘payganiga qaramay foydalanish kamayishining sababi?',
      'Why did use fall even as digital collections grew?',
    ],
    options: [
      { label: { uz: 'Talabalar qidiruv vositalariga o‘tgan', en: 'Students switched to search engines' }, correct: true },
      { label: { uz: 'Kitobxonalar yopilgan', en: 'Libraries closed' } },
      { label: { uz: 'Resurslar narxi oshgan', en: 'Resource prices rose' } },
      { label: { uz: 'Internet sekinlashgan', en: 'The internet slowed down' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    passage: [
      'Uzoq muddatli tadqiqotlarda iqtisodiy o‘sish va ijtimoiy farqlilik o‘rtasidagi bog‘liqlik murakkab. Farqlilik kamaysa, o‘sish barqarorroq bo‘ladi.',
      'Long-run studies show a complex link between economic growth and inequality. As inequality falls, growth becomes more stable.',
    ],
    p: [
      'Qaysi xulosa eng to‘g‘ri?',
      'Which conclusion is most accurate?',
    ],
    options: [
      { label: { uz: 'Farqlilik kamayishi o‘sishni barqarorlashtiradi', en: 'Lower inequality stabilises growth' }, correct: true },
      { label: { uz: 'Farqlilik o‘sishni to‘xtaydi', en: 'Inequality stops growth' } },
      { label: { uz: 'O‘sish farqlilikni kuchaytiradi', en: 'Growth always increases inequality' } },
      { label: { uz: 'Bog‘liqlik tasodifiy', en: 'The link is random' } },
    ],
  },
  {
    skill: 'ielts-reading',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 180,
    passage: [
      'Muallif: "Matnni o‘qish — passiv jarayon emas. O‘quvchi har bir jumlada muallifning qarorini tiklaydi."',
      'The author: “Reading is not passive. At every sentence the reader reconstructs the writer’s decision.”',
    ],
    p: [
      '"Tiklash" (reconstruct) so‘zi bu yerda nimani anglatadi?',
      'What does “reconstruct” mean in this context?',
    ],
    options: [
      { label: { uz: 'Muallif qanday tanlov qilganini o‘z xalqida tikish', en: 'Rebuilding the writer’s choice in one’s own words' }, correct: true },
      { label: { uz: 'Jumlani so‘zma-so‘z takrorlash', en: 'Repeating the sentence word for word' } },
      { label: { uz: 'Matnni tarjima qilish', en: 'Translating the text' } },
      { label: { uz: 'Xotirani tiklash', en: 'Restoring memory' } },
    ],
  },

  // ── ielts-writing ───────────────────────────────────────────────────────
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 60,
    p: [
      'IELTS Task 1 (grafik) ning asosiy xususiyati qaysi?',
      'What is the defining feature of IELTS Task 1?',
    ],
    options: [
      { label: { uz: 'Ma’lumotni shakllantirilgan shablon bilan taqdim etish', en: 'Presenting data in a fixed format' }, correct: true },
      { label: { uz: 'Shaxsiy fikr aytish', en: 'Giving a personal opinion' } },
      { label: { uz: 'Har fikrni muhokama qilish', en: 'Discussing every opinion' } },
      { label: { uz: 'Hikoya yozish', en: 'Telling a story' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      'Task 2 da umumiy tavsiya (barcha bandlar uchun) qanday beriladi?',
      'In Task 2, how should a general recommendation be phrased?',
    ],
    options: [
      { label: { uz: 'Intransitiv fe’l bilan: "Universities should provide…"', en: 'With a bare infinitive: “Universities should provide…”' }, correct: true },
      { label: { uz: '"should" + to + fe’l', en: '“should” + to + verb' } },
      { label: { uz: '"must" fe’li bilan', en: 'With “must”' } },
      { label: { uz: 'Buyruq shakli bilan', en: 'In the imperative' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      'Grafikdagi eng katta o‘zgarishni ta’riflashda qaysi qo‘llanma mos keladi?',
      'Which guideline applies when describing the largest change on a graph?',
    ],
    options: [
      { label: { uz: 'Dastlabki va oxirgi qiymatlarni solishtiring', en: 'Compare the initial and final values' }, correct: true },
      { label: { uz: 'Faqat oxirgi qiymatni ayting', en: 'Report only the final value' } },
      { label: { uz: 'O‘rtacha qiymatni hisoblang', en: 'Calculate the average' } },
      { label: { uz: 'Prognoz bering', en: 'Give a forecast' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      'Eng to‘g‘ri Task 2 javobining tuzilishi?',
      'Which is the correct structure of a strong Task 2 answer?',
    ],
    options: [
      { label: {
        uz: 'Kirish (teza) → 2 asosiy abzas (dalil + misol) → xulosa',
        en: 'Introduction (thesis) → two body paragraphs (claim + example) → conclusion',
      }, correct: true },
      { label: { uz: 'Faqat kirish va xulosa', en: 'Introduction and conclusion only' } },
      { label: { uz: 'Beshta qisqa abzas', en: 'Five short paragraphs' } },
      { label: { uz: 'Ro‘yxatlar ko‘p', en: 'Mostly bullet points' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 90,
    p: [
      'Keltirilgan band keltirilgan dalil bilan bog‘lanmasa, nima bo‘ladi?',
      'What happens if a cited example does not support the claim?',
    ],
    options: [
      { label: { uz: 'Argument zaiflashadi', en: 'The argument weakens' }, correct: true },
      { label: { uz: 'Hech narsa o‘zgarmaydi', en: 'Nothing changes' } },
      { label: { uz: 'Ball oshadi', en: 'The score improves' } },
      { label: { uz: 'Dalil kuchayadi', en: 'The evidence strengthens' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    p: [
      'Task 1 da "sharp rise" va "slight increase" farqi nimada?',
      'In Task 1, what is the difference between “sharp rise” and “slight increase”?',
    ],
    options: [
      { label: { uz: 'Birinchi tez, ikkinchi sekin o‘zgarish', en: 'The first is fast, the second gradual' }, correct: true },
      { label: { uz: 'Ikkalasi bir xil', en: 'They are identical' } },
      { label: { uz: 'Birinchi ijobiy, ikkinchi salbiy', en: 'The first is positive, the second negative' } },
      { label: { uz: 'Birinchi prognoz, ikkinchi fakt', en: 'The first is a forecast, the second a fact' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 120,
    p: [
      'Qaysi so‘z Task 2 da band pasaytiradi?',
      'Which word lowers your band in Task 2?',
    ],
    options: [
      { label: { uz: 'Qayta-qayta ishlatilgan "very important"', en: 'Repeatedly using “very important”' }, correct: true },
      { label: { uz: 'Mantiqiy bog‘lanishlarning ko‘pligi', en: 'Consistent logical linking' } },
      { label: { uz: 'Aniq raqam ishlatish', en: 'Using specific figures' } },
      { label: { uz: 'Qisqa xulosa', en: 'A concise conclusion' } },
    ],
  },
  {
    skill: 'ielts-writing',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    p: [
      'Zo‘r Task 2 javobida teza qayerda bo‘lishi kerak?',
      'Where should the thesis sit in a strong Task 2 answer?',
    ],
    options: [
      { label: { uz: 'Kirish oxirida, aniq bayon qilingan', en: 'At the end of the introduction, stated explicitly' }, correct: true },
      { label: { uz: 'Butun javob davomida yashirilgan', en: 'Hidden across the whole answer' } },
      { label: { uz: 'Faqat xulosada', en: 'Only in the conclusion' } },
      { label: { uz: 'Kirishda bitta jumla bilan noaniq', en: 'Vague, in one sentence at the start' } },
    ],
  },

  // ── ielts-speaking ──────────────────────────────────────────────────────
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      'IELTS Speaking Part 1 qisqa savollar qayerda beriladi?',
      'Where do the short questions of IELTS Speaking Part 1 appear?',
    ],
    options: [
      { label: { uz: 'Kun boshida, mavzuga doir', en: 'At the start, on everyday topics' }, correct: true },
      { label: { uz: 'Oxirida, ilmiy mavzular', en: 'At the end, on academic topics' } },
      { label: { uz: 'Faqat yozma qismda', en: 'Only in the written part' } },
      { label: { uz: 'Tayyorgarlikdan keyin', en: 'After preparation time' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      'Band 7 uchun suhbatdagi tabiiylik qanday?',
      'What does naturalness at Band 7 involve?',
    ],
    options: [
      { label: { uz: 'Qisqa to‘xtashlar tabiiy hisoblanadi', en: 'Occasional hesitation is acceptable' }, correct: true },
      { label: { uz: 'Hech qanday to‘xtashmaslik', en: 'No hesitation at all' } },
      { label: { uz: 'Har bir savolga bir jumla', en: 'One sentence per question' } },
      { label: { uz: 'Faqat tayyor matn', en: 'Only memorised phrases' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 60,
    p: [
      'Agar savolni tushunmasangiz, nima qilish kerak?',
      'What should you do if you do not understand a question?',
    ],
    options: [
      { label: { uz: 'Qayta so‘rash va tushuntirishni iltimos qilish', en: 'Ask again and request clarification' }, correct: true },
      { label: { uz: 'Javobni o‘ylab chiqishdan to‘xtab qolish', en: 'Stop and think silently' } },
      { label: { uz: 'Savolni o‘zgartirib berish', en: 'Change the question yourself' } },
      { label: { uz: 'Pass qilish', en: 'Pass' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 75,
    p: [
      'Part 2 da 1 daqiqalik tayyorgarlikdan qanday foydalaniladi?',
      'How is the one-minute preparation in Part 2 used?',
    ],
    options: [
      { label: { uz: 'Noto‘g‘ri qaydlar qilish uchun', en: 'To jot brief notes' }, correct: true },
      { label: { uz: 'To‘liq matn yozish uchun', en: 'To write a full script' } },
      { label: { uz: 'Tinch o‘tirish uchun', en: 'To rest' } },
      { label: { uz: 'Savolni o‘qish uchun', en: 'To read the question again' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 90,
    p: [
      'Uzoq javob berishda eng yaxshi texnika qaysi?',
      'What is the best technique for answering a long question?',
    ],
    options: [
      { label: { uz: 'Javobni ochish → misol → xulosa (kengaytirilgan shakl)', en: 'Answer → example → wrap up (expanded answer)' }, correct: true },
      { label: { uz: 'Faqat "ha" yoki "yo‘q"', en: 'Only “yes” or “no”' } },
      { label: { uz: 'Savolni qisqartirib o‘zgartirish', en: 'Shorten and change the question' } },
      { label: { uz: 'Misol bermaslik', en: 'Avoid examples' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 90,
    p: [
      'Band 8 darajasiga qanday o‘tiladi?',
      'How is Band 8 achieved in speaking?',
    ],
    options: [
      { label: { uz: 'Kam xato, boy lug‘at, tabiiy oqish', en: 'Few errors, rich vocabulary, natural delivery' }, correct: true },
      { label: { uz: 'Har bir so‘z to‘g‘ri talaffuz', en: 'Perfect pronunciation of every word' } },
      { label: { uz: 'Uzun javoblar', en: 'Long answers' } },
      { label: { uz: 'Murakkab grammatikaning ko‘pligi', en: 'Lots of complex grammar' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 120,
    p: [
      'Ayniqsa qaysi bandni to‘ldirish uchun imkon bo‘lmas?',
      'Which band is especially hard to reach?',
    ],
    options: [
      { label: { uz: 'Band 9 — deyarli tabiiy ravishda sof', en: 'Band 9 — near-native clarity' }, correct: true },
      { label: { uz: 'Band 5', en: 'Band 5' } },
      { label: { uz: 'Band 6', en: 'Band 6' } },
      { label: { uz: 'Band 4', en: 'Band 4' } },
    ],
  },
  {
    skill: 'ielts-speaking',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    p: [
      'Part 3 da nima kutiladi?',
      'What is expected in Part 3?',
    ],
    options: [
      { label: { uz: 'Sabab-natija va farqlarni tahlil qilish', en: 'Analysis of causes, effects and comparisons' }, correct: true },
      { label: { uz: 'Faqat kunlik mavzular', en: 'Only everyday topics' } },
      { label: { uz: 'Yozma ish yozish', en: 'Writing an essay' } },
      { label: { uz: 'Tayyorgarlikdan foydalanish', en: 'Using preparation time' } },
    ],
  },
];