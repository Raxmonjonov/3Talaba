import type { SeedCourse } from '../../types';

/** Ariza kursi: 4 dars. */
export const APPLICATIONS_COURSE: SeedCourse = {
  slug: 'applications',
  subject: 'APPLICATIONS',
  title: ['Ariza va suhbat', 'Applications and Interview'],
  description: [
    'Common App, UCAS personal statement, cover letter va intervyu.',
    'Common App, UCAS personal statement, cover letter and interview.',
  ],
  modules: [
    {
      slug: 'applications-writing',
      title: ['Ariza yozish', 'Application Writing'],
      description: ['Shaxsiy hikoya va ariza matnlari.', 'Personal narrative and application documents.'],
      levelRange: '1-5',
      lessons: [
        {
          slug: 'apps-common-app',
          title: ['Common App Personal Essay', 'Common App Personal Essay'],
          summary: [
            '650 so‘zlik shaxsiy hikoya: tanlov, qiyinchilik, o‘zgarish.',
            'A 650-word personal narrative: choice, difficulty, change.',
          ],
          objectives: [
            ['Kirish abzasida qiziqish manbai ko‘rsatish', 'Show in the opening paragraph what drives you'],
            ['Natijani emas, o‘zgarishni yozish', 'Write about change, not just outcome'],
          ],
          storyAct: 1,
          storyTitle: ['650 so‘z chegarasi', 'The 650-Word Border'],
          levelRange: '1-4',
          estMinutes: 60,
          xpReward: 50,
          skills: ['common-app'],
          blocks: [
            {
              kind: 'STORY',
              title: ['650 so‘z chegarasi', 'The 650-Word Border'],
              minMinutes: 5,
              content: {
                uz: 'Ko‘pchilik 650 so‘z chegarasiga sig‘ishi uchun hikoya qisqartiradi va asosiy voqeani yo‘qotadi. Siz esa har bir so‘zni tanlab ishlatasiz.',
                en: 'Most applicants shrink their story to fit 650 words and lose the essential event. You will choose every word deliberately.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Uch savolli skelet', 'The Three-Question Skeleton'],
              minMinutes: 14,
              content: {
                uz: 'Common App hikoyasi uch savolga javob beradi: (1) Nima bo‘ldi? (2) Nima qiyin bo‘ldi? (3) Meni o‘zgartirdimi? Uchinchisi yetishmayotgan hikoya yuqori ball olmaydi. Har bir qism 1-2 abzas.',
                en: 'A Common App story answers three questions: (1) What happened? (2) What was difficult? (3) How did it change me? Without the third, the story scores poorly. Give each part one or two paragraphs.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Natijadan o‘zgarishga', 'From Outcome to Change'],
              minMinutes: 12,
              content: {
                uz: 'Zaif: "I organised a charity event and raised 1 200 dollars." Kuchli: "I organised a charity event and raised 1 200 dollars — but the real lesson was learning to say no to the committee chair, which I had never done before."',
                en: 'Weak: “I organised a charity event and raised 1 200 dollars.” Strong: “I organised a charity event and raised 1 200 dollars — but the real lesson was learning to say no to the committee chair, which I had never done before.”',
              },
            },
            {
              kind: 'DRILL',
              title: ['Hikoya mashqi', 'Narrative Drill'],
              minMinutes: 18,
              content: {
                uz: '2 ta tanlangan tajriba uchun uch savolga javob bering.',
                en: 'Answer the three questions for two chosen experiences.',
              },
              skills: ['common-app'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 11,
              content: {
                uz: '1 ta 650 so‘zlik to‘liq insho yoki reja.',
                en: 'One full 650-word essay or its plan.',
              },
              skills: ['common-app'],
            },
          ],
        },
        {
          slug: 'apps-ucas',
          title: ['UCAS personal statement', 'UCAS Personal Statement'],
          summary: [
            '4000 belgi, bir sahifa, kurs va motivatsiyani bog‘lash.',
            '4000 characters, one page, linking the course to your motivation.',
          ],
          objectives: [
            ['Kurs tanlash sababini o‘lchov bilan eslatish', 'Explain the course choice with measurable detail'],
            ['Umumiy baholarni dalil bilan almashtirish', 'Replace generic claims with evidence'],
          ],
          storyAct: 2,
          storyTitle: ['Bir sahifa chegarasi', 'The One-Page Border'],
          levelRange: '1-4',
          estMinutes: 50,
          xpReward: 45,
          skills: ['ucas-statement'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Chegara va tuzilma', 'The Limit and the Structure'],
              minMinutes: 14,
              content: {
                uz: 'UCAS statement 47 qator yoki 4000 belgi. Uchr xil ichki tuzilma: (1) hozirgi nuqtangiz va qiziqishingiz, (2) nima qildingiz (dalil bilan), (3) nima uchun aynan bu kurs. Uchinchisiz statement zaif hisoblanadi.',
                en: 'The UCAS statement is 47 lines or 4000 characters. Three-part structure: (1) where you are and what interests you, (2) what you did, with evidence, (3) why this specific course. Without part three, the statement is weak.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['"Men juda motivatsiyaliMAN"', '“I Am Highly Motivated”'],
              minMinutes: 12,
              content: {
                uz: 'Motivatsiya — xususiyat emas, harakat. "I am highly motivated" o‘rniga: "I rebuilt our physics club’s experiment schedule after two members left, and attendance rose from six to twenty." Harakat va natija motivatsiyani o‘zi ko‘rsatadi.',
                en: 'Motivation is not a trait, it is a record of action. Replace “I am highly motivated” with: “I rebuilt our physics club’s experiment schedule after two members left, and attendance rose from six to twenty.”',
              },
            },
            {
              kind: 'DRILL',
              title: ['UCAS reja mashqi', 'UCAS Planning Drill'],
              minMinutes: 14,
              content: {
                uz: 'Kurs nomi va 2 ta o‘lchovli faoliyat uchun reja tuzing.',
                en: 'Plan a statement for a specific course and two measurable activities.',
              },
              skills: ['ucas-statement'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: 'To‘liq 4000 belgili statement yozing va belgilardan oshmasligini tekshiring.',
                en: 'Write a full 4000-character statement and verify the limit.',
              },
              skills: ['ucas-statement'],
            },
          ],
        },
        {
          slug: 'apps-cover-letter',
          title: ['Cover letter', 'Cover Letter'],
          summary: [
            'Rolga mos dalil, bir sahifa va aniq keyingi qadam.',
            'Role-specific evidence, one page and a clear next step.',
          ],
          objectives: [
            ['Birinchi abzasda rol va moslikni ko‘rsatish', 'Show role and match in the first paragraph'],
            ['Aniq, o‘lchovli natijani keltirish', 'Present a specific, measurable outcome'],
          ],
          storyAct: 3,
          storyTitle: ['Bir sahifa hikoyasi', 'The One-Page Story'],
          levelRange: '1-4',
          estMinutes: 45,
          xpReward: 40,
          skills: ['cover-letter'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Uch abzaslik tuzilma', 'The Three-Paragraph Structure'],
              minMinutes: 14,
              content: {
                uz: '1-abzas: qaysi rolga murojaat qilinayotgani + bitta aniq moslik. 2-abzas: o‘lchovli dalil (savdo +18%, muddat −3 kun). 3-abzas: aniq keyingi qadam ("Muhokamaga tayyorman"). CV’ni takrorlash — foizni eng ko‘p yo‘qotadigan xato.',
                en: 'Paragraph 1: the exact role plus one concrete match. Paragraph 2: measurable evidence (sales +18%, deadline −3 days). Paragraph 3: a specific next step (“I am available for an interview on any weekday”). Repeating the CV costs the most marks.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Cover letter mashqi', 'Cover Letter Drill'],
              minMinutes: 16,
              content: {
                uz: '1 ta haqiqiy ish o‘rni uchun 3 abzasli cover letter yozing.',
                en: 'Write a three-paragraph cover letter for a real job posting.',
              },
              skills: ['cover-letter'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 15,
              content: {
                uz: 'Letter va CV’ni solishtirib, takrorlangan bandlarni olib tashlang.',
                en: 'Compare the letter with your CV and delete any repeated line.',
              },
              skills: ['cover-letter'],
            },
          ],
        },
        {
          slug: 'apps-interview',
          title: ['Suhbat (interview)', 'Interview'],
          summary: [
            'STAR metodi, "nima uchun biz?" va "o‘zingiz haqingizda" savollari.',
            'STAR method, “why us?” and “tell me about yourself”.',
          ],
          objectives: [
            ['STAR bilan 90 soniyalik javob tuzish', 'Build a 90-second answer with STAR'],
            ['Aniq bo‘lmagan savolga halol hal qaror usulini berish', 'Handle a question you cannot answer'],
          ],
          storyAct: 4,
          storyTitle: ['90 soniyalik javob', 'The 90-Second Answer'],
          levelRange: '2-5',
          estMinutes: 55,
          xpReward: 45,
          skills: ['interview'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['STAR ketma-ketligi', 'The STAR Sequence'],
              minMinutes: 14,
              content: {
                uz: 'Situation (20%) — qayerda, qachon. Task (15%) — sizning mas’uliyatingiz. Action (45%) — siz aniq nima qildingiz. Result (20%) — o‘lchovli natija. Action qismi eng uzun bo‘lishi kerak: "we" emas, "I".',
                en: 'Situation (20%) — where and when. Task (15%) — your responsibility. Action (45%) — what you specifically did. Result (20%) — a measurable outcome. Action is the longest part, and it must be “I”, not “we”.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['"Nima uchun biz?" savoliga javob', 'Answering “Why Us?”'],
              minMinutes: 12,
              content: {
                uz: 'Javob "siz katta kompaniya" bilan emas, "sizning shu moduli" bilan boshlanadi. Tuzilma: ularning aniq xususiyati + sizning aniq dalilingiz + bu qanday bog‘lanadi. Masalan: "Sizning modulida amaliy kompaniya ishlari bor; mening loyihamda 40 soatlik stajim bo‘ldi."',
                en: 'Do not answer “you are a big company”; start from their specific feature. Structure: their concrete feature + your concrete evidence + the link. For example: “Your module includes a live company placement; I completed a 40-hour internship last summer.”',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Bilmaslikni hal qilish', 'Handling “I Don’t Know”'],
              minMinutes: 10,
              content: {
                uz: 'To‘g‘ri javob: "Men buni aniq bilmayman, lekin shunda qilardim: birinchi manbani tekshirib, keyin kichik hisob-kitob qilib, natijani sizga ko‘rsatgan bo‘lardim. Maylimi, buni hozir aniqlaymizmi?" Bu halol, ko‘rsatkichli va suhbatni oldinga olib boradi.',
                en: 'A good answer: “I don’t know yet, but I would first check the primary source, then run a small calculation and show you the result. May we look it up now?” This is honest, shows method and keeps the interview moving.',
              },
            },
            {
              kind: 'DRILL',
              title: ['STAR drilli', 'STAR Drill'],
              minMinutes: 16,
              content: {
                uz: '2 ta STAR javobini 90 soniya uchun yozib, ovoz bilan aytib bering.',
                en: 'Write two STAR answers for 90 seconds and deliver them out loud.',
              },
              skills: ['interview'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '6 ta savolga yozma javob va bitta savol sizning savolingiz uchun.',
                en: 'Written answers to six questions plus one question of your own.',
              },
              skills: ['interview'],
            },
          ],
        },
      ],
    },
  ],
};