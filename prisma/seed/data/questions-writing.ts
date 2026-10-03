import type { SeedQuestion } from '../types';

/** Yozma ish (12) + ariza (14) = 26. */
export const WRITING_APPLICATION_QUESTIONS: SeedQuestion[] = [
  // ── essay-structure ──────────────────────────────────────────────────────
  {
    skill: 'essay-structure',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      'Beshta abzasdan iborat esse tartibini to‘g‘ri tanlang:',
      'Choose the correct order of a five-paragraph essay:',
    ],
    options: [
      {
        label: {
          uz: 'Kirish → asosiy abzas → ikkinchi asosiy abzas → xulosa',
          en: 'Introduction → body 1 → body 2 → conclusion',
        }, correct: true,
      },
      {
        label: {
          uz: 'Kirish → xulosa → asosiy abzaslar',
          en: 'Introduction → conclusion → body paragraphs',
        },
      },
      {
        label: {
          uz: 'Asosiy abzaslar → kirish → xulosa',
          en: 'Body paragraphs → introduction → conclusion',
        },
      },
      {
        label: {
          uz: 'Xulosa → kirish → asosiy abzaslar',
          en: 'Conclusion → introduction → body paragraphs',
        },
      },
    ],
  },
  {
    skill: 'essay-structure',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      'Bahs-munozar essesining muqaddimasi kamida nmani o‘z ichiga olishi shart?',
      'What must the introduction of an argumentative essay contain at minimum?',
    ],
    options: [
      { label: {
        uz: 'Teza (aniq pozitsiya) va uni asoslash uchun yo‘nalish',
        en: 'A thesis (clear position) and the direction of the argument',
      }, correct: true },
      { label: {
        uz: 'Barcha ma’lumotlarni keltirish',
        en: 'All of the evidence',
      } },
      { label: {
        uz: 'Ikki qarama-qarshi qo‘llanma',
        en: 'Two opposing manuals',
      } },
      { label: {
        uz: 'Xulosani oldindan aytish',
        en: 'The conclusion in advance',
      } },
    ],
  },
  {
    skill: 'essay-structure',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      'Qaysi jumla asosiy abzas uchun mavzu jumlasi sifatida eng yaxshi ishlaydi?',
      'Which sentence best functions as a topic sentence for a body paragraph?',
    ],
    options: [
      {
        label: {
          uz: 'Universities should fund public-transit research, because such projects reduce urban emissions.',
          en: 'Universities should fund public-transit research, because such projects reduce urban emissions.',
        }, correct: true,
      },
      {
        label: {
          uz: 'There are many reasons for this issue.',
          en: 'There are many reasons for this issue.',
        },
      },
      {
        label: {
          uz: 'As I will show below, this is important.',
          en: 'As I will show below, this is important.',
        },
      },
      {
        label: {
          uz: 'In conclusion, this helps a lot.',
          en: 'In conclusion, this helps a lot.',
        },
      },
    ],
  },
  {
    skill: 'essay-structure',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      'Qaysi biri haqiqiy muqaddim — savolning oddiy takrori emas?',
      'Which is a genuine introduction, not just a summary of the question?',
    ],
    options: [
      {
        label: {
          uz: 'Although remote work is popular, its effect on junior training is underexamined. This essay argues that in-person mentoring matters more.',
          en: 'Although remote work is popular, its effect on junior training is underexamined. This essay argues that in-person mentoring matters more.',
        }, correct: true,
      },
      {
        label: {
          uz: 'This essay will discuss the advantages and disadvantages of remote work.',
          en: 'This essay will discuss the advantages and disadvantages of remote work.',
        },
      },
      {
        label: {
          uz: 'There are two sides to every question.',
          en: 'There are two sides to every question.',
        },
      },
      {
        label: {
          uz: 'In today’s society, remote work is very important.',
          en: 'In today’s society, remote work is very important.',
        },
      },
    ],
  },
  {
    skill: 'essay-structure',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 120,
    p: [
      'Qaysi taqqoslash jumlasi mantiqiy to‘g‘ri?',
      'Which comparison sentence is logically correct?',
    ],
    options: [
      {
        label: {
          uz: 'A is more likely than B to cause harm (e.g. 30% vs 10%).',
          en: 'A is more likely than B to cause harm (e.g. 30% vs 10%).',
        }, correct: true,
      },
      {
        label: {
          uz: 'A causes twice more harm than B (30% vs 10%).',
          en: 'A causes twice more harm than B (30% vs 10%).',
        },
      },
      {
        label: {
          uz: 'A is more harmful, as 30% > 10%.',
          en: 'A is more harmful, as 30% > 10%.',
        },
      },
      {
        label: {
          uz: 'A harms less, since 30% is greater than 10%.',
          en: 'A harms less, since 30% is greater than 10%.',
        },
      },
    ],
  },
  {
    skill: 'essay-structure',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 150,
    p: [
      'Xulosa nimani qilishi kerak, xulosa (summary) esa qilmaydi?',
      'What should a conclusion do that a summary does not?',
    ],
    options: [
      {
        label: {
          uz: 'Ta’sir doirasini kengaytirish va yangi tavsiya berish',
          en: 'Extend the implications and offer a recommendation',
        }, correct: true,
      },
      {
        label: {
          uz: 'Kirishdagi barcha gaplarni takrorlash',
          en: 'Repeat every sentence from the introduction',
        },
      },
      {
        label: {
          uz: 'Yangi raqamlar kiritish',
          en: 'Introduce new figures',
        },
      },
      {
        label: {
          uz: 'Ma’lumot manbalarini sanab o‘tish',
          en: 'List source references',
        },
      },
    ],
  },

  // ── essay-argumentation ──────────────────────────────────────────────────
  {
    skill: 'essay-argumentation',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 120,
    passage: [
      'Oldindan chop etilgan ish: “Yangi usul eslab qolishni 8% ga oshiradi.” Katta namuna bilan keyingi tadqiqot 1% ni qayd etadi.',
      'Preprint says: “The new method improves retention by 8%.” A later, larger study reports 1%.',
    ],
    p: [
      'Qaysi baholash eng yaxshi?',
      'Which is the best evaluation?',
    ],
    options: [
      {
        label: {
          uz: 'Keyingi tadqiqot katta namuna bilan 1% natija berdi; 8% ehtimol namuna farqi bilan bog‘liq',
          en: 'A later larger study found 1%; the 8% is likely due to sample differences',
        }, correct: true,
      },
      {
        label: {
          uz: '8% to‘g‘ri, chunki preprint birinchi bo‘lib chiqqan',
          en: '8% is correct because the preprint came first',
        },
      },
      {
        label: {
          uz: 'Ikkalasi ham to‘g‘ri, savol turli kontekstlarga tegishli',
          en: 'Both are correct because the questions cover different contexts',
        },
      },
      {
        label: {
          uz: 'Keyingi tadqiqot xato, chunki natija kichraydi',
          en: 'The later study is wrong because the result shrank',
        },
      },
    ],
  },
  {
    skill: 'essay-argumentation',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    p: [
      'Qaysi jumla kuchli da’voni eng yaxshi cheklaydi?',
      'Which sentence best qualifies a strong claim?',
    ],
    options: [
      {
        label: {
          uz: 'The benefit was observed mainly in urban districts, so rural impact is unknown.',
          en: 'The benefit was observed mainly in urban districts, so rural impact is unknown.',
        }, correct: true,
      },
      {
        label: {
          uz: 'The benefit was observed mainly in urban districts.',
          en: 'The benefit was observed mainly in urban districts.',
        },
      },
      {
        label: {
          uz: 'The benefit was definitely observed everywhere.',
          en: 'The benefit was definitely observed everywhere.',
        },
      },
      {
        label: {
          uz: 'It is not possible to say anything about districts.',
          en: 'It is not possible to say anything about districts.',
        },
      },
    ],
  },
  {
    skill: 'essay-argumentation',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 180,
    passage: [
      'Argument: “O‘quvchilar yuqori ball oldi, demak yangi o‘quv rejasi yaxshilanishga sabab bo‘ldi.”',
      'Arguing: “Because students scored higher, the new curriculum caused the improvement.”',
    ],
    p: [
      'Bu argumentdagi kamchilik nimada?',
      'What is the flaw in this argument?',
    ],
    options: [
      {
        label: {
          uz: 'Sabab-natija chalkashtirilgan; o‘zgarish boshqa omillar bilan ham bo‘lgan bo‘lishi mumkin',
          en: 'Correlation is mistaken for cause; other factors may explain the change',
        }, correct: true,
      },
      {
        label: {
          uz: 'Natijalar aniq raqamda emas',
          en: 'The results lack precise numbers',
        },
      },
      {
        label: {
          uz: 'Ta’lim ma’lum emas',
          en: 'The curriculum is unknown',
        },
      },
      {
        label: {
          uz: 'Xulosa noto‘g‘ri emas',
          en: 'There is no flaw',
        },
      },
    ],
  },
  {
    skill: 'essay-argumentation',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 210,
    p: [
      'To‘liq ballli esse uchun qaysi abzas tuzilmasi eng kuchli?',
      'Which paragraph structure is the strongest for a full-mark essay?',
    ],
    options: [
      {
        label: {
          uz: 'Har bir abzas = bitta teza + 2–3 dalil (ma’lumot/misol/iqtibos) + qisqa bog‘lanish',
          en: 'Each paragraph = one claim + 2–3 pieces of evidence (data/example/quotation) + a short link',
        }, correct: true,
      },
      {
        label: {
          uz: 'Barcha dalillar bir abzasda',
          en: 'All evidence in a single paragraph',
        },
      },
      {
        label: {
          uz: 'Faqat fikr, dalilsiz',
          en: 'Opinion only, without evidence',
        },
      },
      {
        label: {
          uz: 'Har bir dalil alohida abzas, tezasiz',
          en: 'One paragraph per piece of evidence, no claims',
        },
      },
    ],
  },
  {
    skill: 'essay-argumentation',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 240,
    passage: [
      'Student writes: "Many people think X. However, some think Y."',
      'Student writes: “Many people think X. However, some think Y.”',
    ],
    p: [
      'Nima yetishmaydi?',
      'What is missing?',
    ],
    options: [
      {
        label: {
          uz: 'Muallifning o‘z pozitsiyasi va uni qo‘llab-quvvatlovchi dalil',
          en: 'The writer’s own position and supporting evidence',
        }, correct: true,
      },
      {
        label: {
          uz: 'Qo‘shimcha manba',
          en: 'An extra source',
        },
      },
      {
        label: {
          uz: 'Uzunroq jumla',
          en: 'A longer sentence',
        },
      },
      {
        label: {
          uz: 'Ko‘proq sarlavha',
          en: 'More headings',
        },
      },
    ],
  },
  {
    skill: 'essay-argumentation',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 270,
    p: [
      'Asosiy abzaslarda yuqori ballli javobni o‘rtacha balllidan nima ajratib turadi?',
      'What distinguishes a top-band response from a mid-band one in body paragraphs?',
    ],
    options: [
      {
        label: {
          uz: 'Dalillar teza bilan aniq bog‘lanadi va manbalar ko‘rsatiladi',
          en: 'Evidence is explicitly linked to the claim and sources are named',
        }, correct: true,
      },
      {
        label: {
          uz: 'Uzunroq yozish',
          en: 'Longer writing',
        },
      },
      {
        label: {
          uz: 'Ko‘p savollar qo‘yish',
          en: 'More rhetorical questions',
        },
      },
      {
        label: {
          uz: 'Ko‘proq Undab topshiriq ishlatish',
          en: 'More connectors',
        },
      },
    ],
  },

  // ── common-app ───────────────────────────────────────────────────────────
  {
    skill: 'common-app',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 120,
    p: [
      'Common App PersonalEssay da 650 so‘z chegarasi. Eng muhim bo‘lim qaysi?',
      'In the Common App Personal Essay (650 words), which section matters most?',
    ],
    options: [
      {
        label: {
          uz: 'Kirish abzasi — sizni qiziqtiradigan narsani aniq ko‘rsatadi',
          en: 'The opening paragraph, which shows what genuinely drives you',
        }, correct: true,
      },
      {
        label: {
          uz: 'Oxirgi abzas',
          en: 'The closing paragraph',
        },
      },
      {
        label: {
          uz: 'Saravhatlar ro‘yxati',
          en: 'The list of headings',
        },
      },
      {
        label: {
          uz: 'Faqat ko‘nikmalar ro‘yxati',
          en: 'The list of skills',
        },
      },
    ],
  },
  {
    skill: 'common-app',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    p: [
      'Common App da biror tajribani yozishda nima tavsiya qilinadi?',
      'In the Common App, what is recommended when writing about an experience?',
    ],
    options: [
      {
        label: {
          uz: 'Faqat natijani emas, o‘zingizni qanday o‘zgartirganingizni ko‘rsating',
          en: 'Show how you changed, not just the outcome',
        }, correct: true,
      },
      {
        label: {
          uz: 'Faqat natijani yozing',
          en: 'Write only about the outcome',
        },
      },
      {
        label: {
          uz: 'Faqat jamoatga ko‘rsatilgan yutuqlarni yozing',
          en: 'Write only visible achievements',
        },
      },
      {
        label: {
          uz: 'Faqat muvaffaqiyatsizlikdan yozing',
          en: 'Write only about failure',
        },
      },
    ],
  },
  {
    skill: 'common-app',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 180,
    p: [
      'Personal Essay da "nima qildim?" emas, "meni o‘zgartirdimi?" savoli qanday ishlaydi?',
      'In the Personal Essay, how does the “what changed in me?” question work?',
    ],
    options: [
      {
        label: {
          uz: 'Tanlov, qiyinchilik va undan kelib chiqqan o‘zgarish uchun aniq javob talab qiladi',
          en: 'It requires a specific answer: the choice, the difficulty, and the resulting change',
        }, correct: true,
      },
      {
        label: {
          uz: 'Rost bo‘lishi shart emas',
          en: 'It does not have to be true',
        },
      },
      {
        label: {
          uz: 'Faqat kasbiy natijaga qaratilgan',
          en: 'It is only about professional results',
        },
      },
      {
        label: {
          uz: 'Faqat boshqalar fikri',
          en: 'It is only about other people’s opinions',
        },
      },
    ],
  },
  {
    skill: 'common-app',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 210,
    p: [
      'Activity (past 1.5 band) qismida qanday aniq bo‘lish kerak?',
      'In the Activities section, how should you be specific?',
    ],
    options: [
      {
        label: {
          uz: 'Rol, mas’uliyat va natija (kamida bitta raqam) bilan',
          en: 'Role, responsibility and at least one outcome figure',
        }, correct: true,
      },
      {
        label: {
          uz: 'Faqat faoliyat nomi bilan',
          en: 'Only by naming the activity',
        },
      },
      {
        label: {
          uz: 'Faqat sana bilan',
          en: 'Only by giving the date',
        },
      },
      {
        label: {
          uz: 'Faqat joy bilan',
          en: 'Only by naming the location',
        },
      },
    ],
  },

  // ── ucas-statement ───────────────────────────────────────────────────────
  {
    skill: 'ucas-statement',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 120,
    p: [
      'UCAS personal statement qaysi formatda?',
      'Which format does the UCAS personal statement use?',
    ],
    options: [
      {
        label: {
          uz: 'Bir sahifa, 47 qator yoki 4000 belgidan oshmasligi kerak',
          en: 'One page, no more than 47 lines or 4 000 characters',
        }, correct: true,
      },
      {
        label: {
          uz: 'Cheksiz uzunlik',
          en: 'No length limit',
        },
      },
      {
        label: {
          uz: 'Faqat 100 so‘z',
          en: 'Exactly 100 words',
        },
      },
      {
        label: {
          uz: 'Ish joyini tavsiflash',
          en: 'A description of the workplace',
        },
      },
    ],
  },
  {
    skill: 'ucas-statement',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    p: [
      'UCAS personal statement da "I am highly motivated" kabi iboralar nima uchun zaif?',
      'Why is a phrase like “I am highly motivated” weak in a UCAS personal statement?',
    ],
    options: [
      {
        label: {
          uz: 'Bu umumiy baho; o‘lchov dalil bilan ko‘rsatilishi kerak',
          en: 'It is an unsupported general claim; it must be shown with evidence',
        }, correct: true,
      },
      {
        label: {
          uz: 'Bu juda uzun ibora',
          en: 'It is too long',
        },
      },
      {
        label: {
          uz: 'Bu noto‘g‘ri grammatika',
          en: 'It is grammatically incorrect',
        },
      },
      {
        label: {
          uz: 'Bu yaroq emas',
          en: 'It is not relevant',
        },
      },
    ],
  },
  {
    skill: 'ucas-statement',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 180,
    p: [
      'Kurs tanlashda UCAS statement qismida qanday bog‘lanish kerak?',
      'When discussing the chosen course, what link is required in a UCAS statement?',
    ],
    options: [
      {
        label: {
          uz: 'Nima uchun aynan bu modul va o‘lchovchi parametrlar bilan bog‘lanish',
          en: 'Why this specific module, with measurable parameters',
        }, correct: true,
      },
      {
        label: {
          uz: 'Faqat moduli ro‘yxatdan o‘tkazish',
          en: 'Only listing the modules',
        },
      },
      {
        label: {
          uz: 'Faqat reyting talablarini ko‘rsatish',
          en: 'Only mentioning grade requirements',
        },
      },
      {
        label: {
          uz: 'Faqat universitet reytingini ko‘rsatish',
          en: 'Only mentioning university rankings',
        },
      },
    ],
  },
  {
    skill: 'ucas-statement',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 210,
    p: [
      'Qaysi formulanish UCAS statement uchun eng kuchli?',
      'Which phrasing is strongest for a UCAS statement?',
    ],
    options: [
      {
        label: {
          uz: 'I chose this course because its third-year module on X builds directly on my project on Y.',
          en: 'I chose this course because its third-year module on X builds directly on my project on Y.',
        }, correct: true,
      },
      {
        label: {
          uz: 'I chose this course because it is the best in the country.',
          en: 'I chose this course because it is the best in the country.',
        },
      },
      {
        label: {
          uz: 'I chose this course because it is cheap.',
          en: 'I chose this course because it is cheap.',
        },
      },
      {
        label: {
          uz: 'I chose this course because everyone chooses it.',
          en: 'I chose this course because everyone chooses it.',
        },
      },
    ],
  },

  // ── cover-letter ─────────────────────────────────────────────────────────
  {
    skill: 'cover-letter',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 120,
    p: [
      'Cover letter ning birinchi abzasida nima bo‘lishi kerak?',
      'What must the first paragraph of a cover letter contain?',
    ],
    options: [
      {
        label: {
          uz: 'Qaysi rolga murojaat qilinayotgani va biror aniq moslik',
          en: 'The specific role you are applying for and one concrete match',
        }, correct: true,
      },
      {
        label: {
          uz: 'Faqat salomlashish',
          en: 'Only a greeting',
        },
      },
      {
        label: {
          uz: 'Faqat ilhomlantiruvchi jumla',
          en: 'Only an inspirational line',
        },
      },
      {
        label: {
          uz: 'Faqat ma’lumotnoma',
          en: 'Only a list of documents',
        },
      },
    ],
  },
  {
    skill: 'cover-letter',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    p: [
      'Cover letterda eng kuchli dalil qaysi?',
      'What is the strongest evidence in a cover letter?',
    ],
    options: [
      {
        label: {
          uz: 'Aniq natija: masalan, "savdo +18% ga oshdi"',
          en: 'A specific outcome, e.g. “sales rose 18%”',
        }, correct: true,
      },
      {
        label: {
          uz: 'I am a hard worker.',
          en: 'I am a hard worker.',
        },
      },
      {
        label: {
          uz: 'I have many years of experience.',
          en: 'I have many years of experience.',
        },
      },
      {
        label: {
          uz: 'Please find attached my CV.',
          en: 'Please find attached my CV.',
        },
      },
    ],
  },
  {
    skill: 'cover-letter',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 180,
    p: [
      'Nima uchun cover letterda CV’ni takrorlash xato?',
      'Why is repeating the CV in a cover letter a mistake?',
    ],
    options: [
      {
        label: {
          uz: 'CV allaqachon o‘qilgan; qisqa, aniq dalil kerak',
          en: 'The CV is already read; you need short, specific evidence',
        }, correct: true,
      },
      {
        label: {
          uz: 'Takrorlash grammatik xato',
          en: 'Repetition is a grammatical error',
        },
      },
      {
        label: {
          uz: 'CV uzun bo‘lgani uchun',
          en: 'Because the CV is long',
        },
      },
      {
        label: {
          uz: 'Cover letter bir sahifadan oshmasligi kerak',
          en: 'Because the letter must fit one page',
        },
      },
    ],
  },
  {
    skill: 'cover-letter',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 210,
    p: [
      'Cover letter yakunida qanday harakat kutiladi?',
      'What closing action is expected in a cover letter?',
    ],
    options: [
      {
        label: {
          uz: 'Aniq, o‘lchovli keyingi qadam (masalan, suhbatga tayyor bo‘lish)',
          en: 'A specific, measurable next step (e.g. readiness to interview)',
        }, correct: true,
      },
      {
        label: {
          uz: 'Yana bir savol berish',
          en: 'Asking another question',
        },
      },
      {
        label: {
          uz: 'Nazariyani takrorlash',
          en: 'Repeating the theory',
        },
      },
      {
        label: {
          uz: 'Hech narsa',
          en: 'Nothing',
        },
      },
    ],
  },

  // ── interview ────────────────────────────────────────────────────────────
  {
    skill: 'interview',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 120,
    p: [
      'Interviewda "Tell me about yourself" savolining maqsadi?',
      'What is the purpose of “Tell me about yourself” in an interview?',
    ],
    options: [
      {
        label: {
          uz: 'Qisqa professional hikoya va rolga moslikni ko‘rsatish',
          en: 'A brief professional story that shows fit for the role',
        }, correct: true,
      },
      {
        label: {
          uz: 'Barcha hayotni qisqacha aytib berish',
          en: 'Retelling your whole life briefly',
        },
      },
      {
        label: {
          uz: 'Ma’lumotnoma o‘qish',
          en: 'Reading the CV',
        },
      },
      {
        label: {
          uz: 'Salomlashishni takrorlash',
          en: 'Repeating the greeting',
        },
      },
    ],
  },
  {
    skill: 'interview',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    passage: [
      'HR: "Nima uchun biz?" Talaba: "Siz katta kompaniya, men esa yaxshi ish kerak edi."',
      'HR: “Why us?” Student: “You are a big company and I needed a good job.”',
    ],
    p: [
      'Bu javobdagi asosiy muammo qaysi?',
      'What is the main problem with this answer?',
    ],
    options: [
      {
        label: {
          uz: 'Javob o‘z ehtiyojidan boshlangan va rolga oid dalil yo‘q',
          en: 'The answer starts from own need and gives no role-specific evidence',
        }, correct: true,
      },
      {
        label: {
          uz: 'Javob juda qisqa',
          en: 'The answer is too short',
        },
      },
      {
        label: {
          uz: 'Javodda raqam yo‘q',
          en: 'There is no figure in the answer',
        },
      },
      {
        label: {
          uz: 'Javob noto‘g‘ri',
          en: 'The answer is wrong',
        },
      },
    ],
  },
  {
    skill: 'interview',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 180,
    p: [
      'STAR metodi nima?',
      'What is the STAR method?',
    ],
    options: [
      {
        label: {
          uz: 'Situation, Task, Action, Result — voqeani to‘rt qismda yetkazish',
          en: 'Situation, Task, Action, Result — telling a story in four parts',
        }, correct: true,
      },
      {
        label: {
          uz: 'Situation, Timing, Attitude, Reward',
          en: 'Situation, Timing, Attitude, Reward',
        },
      },
      {
        label: {
          uz: 'Strategy, Team, Action, Review',
          en: 'Strategy, Team, Action, Review',
        },
      },
      {
        label: {
          uz: 'Situation, Task, Aim, Result',
          en: 'Situation, Task, Aim, Result',
        },
      },
    ],
  },
  {
    skill: 'interview',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 210,
    p: [
      'Interviewda savolga aniq javob bilmasangiz nima qilish kerak?',
      'If you do not know an answer in an interview, what should you do?',
    ],
    options: [
      {
        label: {
          uz: 'Bu qoror aylanishini aytib, o‘ylash vaqtini so‘rash',
          en: 'Explain how you would work it out and ask for time to think',
        }, correct: true,
      },
      {
        label: {
          uz: 'Javobni o‘ylab topish',
          en: 'Invent an answer',
        },
      },
      {
        label: {
          uz: 'Savolni o‘zgartirish',
          en: 'Change the question',
        },
      },
      {
        label: {
          uz: 'Javobsiz qolish',
          en: 'Stay silent',
        },
      },
    ],
  },
  {
    skill: 'interview',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 240,
    p: [
      'Suhbat oxirida talaba qanday savol berishi ma’qul?',
      'Which question should a candidate ask at the end of an interview?',
    ],
    options: [
      {
        label: {
          uz: 'Kundalik vazifalardan biri bo‘yicha batafsil misol so‘rash',
          en: 'Asking for a concrete example of a day-to-day task',
        }, correct: true,
      },
      {
        label: {
          uz: 'Ish vaqti qachon boshlanadi?',
          en: 'When does the working day start?',
        },
      },
      {
        label: {
          uz: 'Reyting qanday?',
          en: 'What is the ranking?',
        },
      },
      {
        label: {
          uz: 'Hech qanday savol bermaslik',
          en: 'Ask nothing',
        },
      },
    ],
  },
];