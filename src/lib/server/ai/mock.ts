/**
 * Test va demo uchun deterministik AI stub.
 *
 * Kalit talamaydi, tarmoqqa chiqmaydi, har doim bir xil javob beradi —
 * shuning uchun E2E va integration testlari barqaror bo'ladi.
 * Talab: "AI chaqiruvlari testda stub qilinadi (`AI_PROVIDER=test-mock`)".
 */

const REPLIES = [
  'Yaxshi savol. Keling, buni oddiy misol orqali ko‘rib chiqamiz. Seni qiziqtirgan savolni avval o‘zing qo‘yib ko‘r: agar bu yerda ikki soniya turgan bo‘lsa, nima uchun shunday?',
  'Muhim nuqtani ushlading. Endi bitta kichik qadam: avvalgi javobingda birinchi qatorni o‘zing izohlab ber. Men xato bo‘lsa to‘xtataman.',
  'Bu yerda ko‘pchilar to‘xtab qoladi. Sababi shuki, ikki qadamni birlashtirib yuborishadi. Sen qil: avval bitta qadamni mustaqil bajar, keyin ikkinchisini.',
  'Ajoyib. Endi shuni tekshiramiz: o‘zgartirilgan holatda natija qanday o‘zgaradi? Bitta misol o‘ylab ko‘r.',
  'Chuqurroq ketamiz. Bu formulani koding: nega aynan shu shaklda? Boshqa yechim bormi?',
];

const ONBOARDING_REPLIES = [
  'Rahmat, bu juda muhim. Endi savol: kunlik qancha vaqt qo‘shishga tayyorsan? Haqiqiy raqamni ayt — reja shunga mos tuziladi.',
  'Tushundim. Yana bitta narsa: qaysi kunlaring bo‘sh bo‘ladi? Haftada necha kun o‘qish rejalashtiramiz.',
  'Zo‘r. Oxirgi savol: o‘qishda qanday o‘zingni sezasan — ko‘proq tushuntirish yoqadimi, ko‘proq mustaqil mashqmi?',
];

const LESSON_REPLIES = [
  'Qiziq! Buni o‘z so‘zlaring bilan tushuntirsa, qanchalik chuqur o‘rganishing ko‘rinadi.',
  'To‘g‘ri yo‘nalish. Endi yanada bitta qadam — oldingisini qiyoslab ko‘r.',
  'Zo‘r. Shu mavzuni eslab qol — keyingi blokka aynan shu kerak bo‘ladi.',
];

export function mockReply(kind: 'LESSON' | 'ONBOARDING' | 'GENERAL', variant: number): string {
  const pool =
    kind === 'ONBOARDING' ? ONBOARDING_REPLIES : kind === 'LESSON' ? LESSON_REPLIES : REPLIES;
  return pool[variant % pool.length] as string;
}

export function mockChunkedReply(
  kind: 'LESSON' | 'ONBOARDING' | 'GENERAL',
  variant: number,
  chunkSize = 18,
): string[] {
  const text = mockReply(kind, variant);
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export function mockOnboardingSummary(): string {
  return [
    'Siz o‘rta darajadagi o‘quvchisiz, asosiy ehtiyoj — ingliz tili va yozma ish.',
    'Kunlik 60 daqiqa, haftada 4 marta. Tushuntirish va mustaqil mashq aralash usul yoqadi.',
  ].join(' ');
}