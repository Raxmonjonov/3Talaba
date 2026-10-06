import type { SeedCourse } from '../../types';

/** Yozma ish kursi: 4 dars. */
export const WRITING_COURSE: SeedCourse = {
  slug: 'writing',
  subject: 'WRITING',
  title: ['Yozma ish', 'Writing'],
  description: [
    'Essay tuzilmasi, dalil, argumentatsiya va mustaqil tahrir.',
    'Essay structure, evidence, argumentation and independent writing.',
  ],
  modules: [
    {
      slug: 'writing-essays',
      title: ['Essiylar', 'Essays'],
      description: ['Tuzilma va argumentatsiya.', 'Structure and argumentation.'],
      levelRange: '1-5',
      lessons: [
        {
          slug: 'writing-structure',
          title: ['Essay tuzilmasi', 'Essay Structure'],
          summary: [
            'Kirish, asosiy abzaslar va xulosa; teza qayerda turadi.',
            'Introduction, body paragraphs and conclusion; where the thesis sits.',
          ],
          objectives: [
            ['Kirishda aniq teza shakllantirish', 'State an explicit thesis in the introduction'],
            ['Har bir abzasga bitta vazifa berish', 'Give each paragraph a single job'],
          ],
          storyAct: 1,
          storyTitle: ['Besh abzasli skelet', 'The Five-Paragraph Skeleton'],
          levelRange: '1-3',
          estMinutes: 50,
          xpReward: 40,
          skills: ['essay-structure'],
          blocks: [
            {
              kind: 'STORY',
              title: ['Besh abzasli skelet', 'The Five-Paragraph Skeleton'],
              minMinutes: 5,
              content: {
                uz: 'Tezislar yozuvchi har bir abzas boshlanishida o‘z o‘rnini yo‘qotadi. Bugun skeletni qurib, uni mustahkamlaymiz.',
                en: 'Timid writers lose their place at every paragraph opening. Today we build the skeleton and then strengthen it.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Abzas vazifalari', 'The Job of Each Paragraph'],
              minMinutes: 14,
              content: {
                uz: 'Kirish: kontekst + teza. 1-abzas: asosiy dalil 1. 2-abzas: asosiy dalil 2. 3-abzas: qarshi nuqta va uning chegarasi. Xulosa: ta’sir + tavsiya. Har bir abzasda bitta teza bo‘lsa, yozuv kuzatilishi oson bo‘ladi.',
                en: 'Introduction: context + thesis. Body 1: main evidence 1. Body 2: main evidence 2. Body 3: the counterargument and its limits. Conclusion: implications + recommendation. One claim per paragraph makes your writing easy to follow.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Kuchsiz va kuchli kirish', 'Weak vs Strong Opening'],
              minMinutes: 12,
              content: {
                uz: 'Kuchsiz: "In today’s society, remote work is a very important topic." Kuchli: "Although remote work is now common, its effect on the training of junior staff remains underexamined. This essay argues that in-person mentoring matters more than flexibility at the early career stage."',
                en: 'Weak: “In today’s society, remote work is a very important topic.” Strong: “Although remote work is now common, its effect on the training of junior staff remains underexamined. This essay argues that in-person mentoring matters more than flexibility at the early career stage.”',
              },
            },
            {
              kind: 'DRILL',
              title: ['Tuzilma drill', 'Structure Drill'],
              minMinutes: 14,
              content: {
                uz: '3 ta mavzu uchun: teza, 2 ta asosiy teza, qarshi nuqta, xulosa g‘oyasi.',
                en: 'For three topics: a thesis, two main claims, a counterargument and a conclusion idea.',
              },
              skills: ['essay-structure'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '1 ta 300 so‘zlik to‘liq insho + o‘z-o‘zini tekshirish.',
                en: 'One full 300-word essay plus a self-check.',
              },
              skills: ['essay-structure'],
            },
          ],
        },
        {
          slug: 'writing-evidence',
          title: ['Dalil va manbalar', 'Evidence and Sources'],
          summary: [
            'Kuchli dalil qanday bo‘ladi, uni qanday kiritish kerak.',
            'What makes evidence strong and how to integrate it.',
          ],
          objectives: [
            ['Dalilni tezga bog‘lash', 'Link evidence to the claim quickly'],
            ['Keltirish iborasini tabiiy qo‘llash', 'Use citation phrasing naturally'],
          ],
          storyAct: 2,
          storyTitle: ['Dalil ombaxonasi', 'The Evidence Vault'],
          levelRange: '1-4',
          estMinutes: 50,
          xpReward: 40,
          skills: ['essay-argumentation'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Dalil va izoh juftligi', 'Evidence Plus Explanation'],
              minMinutes: 14,
              content: {
                uz: 'Dalilsiz fakt — zaif. Ishlatish tartibi: teza → dalil → izoh. Masalan: "Ratios were lower in rural districts, so the policy’s benefit is concentrated in urban areas." Bir qatlik dalil emas, uch qatlik zanjir kerak.',
                en: 'A fact without interpretation is weak. The order is: claim → evidence → explanation. For example: “Ratios were lower in rural districts, so the policy’s benefit is concentrated in urban areas.” Three links, not one.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Keltirish shakllari', 'Citation Phrasing'],
              minMinutes: 12,
              content: {
                uz: 'Turli shakllar: "According to X (2021)…", "A study of 4 000 respondents found…", "As Smith argues, …", "The data show that…". Har birida manba turi aniq bo‘lishi kerak.',
                en: 'Different forms: “According to X (2021)…”, “A study of 4 000 respondents found…”, “As Smith argues, …”, “The data show that…”. In each case the type of source must be clear.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Dalil drill', 'Evidence Drill'],
              minMinutes: 14,
              content: {
                uz: '5 ta teza uchun 2 ta dalil va izoh yozing.',
                en: 'Write two pieces of evidence plus explanation for five claims.',
              },
              skills: ['essay-argumentation'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '1 ta dalilga boy 300 so‘zlik insho.',
                en: 'One 300-word essay rich in evidence.',
              },
              skills: ['essay-argumentation'],
            },
          ],
        },
        {
          slug: 'writing-counterargument',
          title: ['Qarshi argument va xulosa', 'Counterargument and Conclusion'],
          summary: [
            'Kuchli qarsili va band oshiruvchi xulosa.',
            'A strong rebuttal paragraph and a band-lifting conclusion.',
          ],
          objectives: [
            ['Qarshi nuqtani kuchliroq qilib taqdim etish', 'Represent the opposing view at its strongest'],
            ['Cheklashni qaytarishda ishlatish', 'Use limits and qualifications to strengthen the claim'],
          ],
          storyAct: 3,
          storyTitle: ['Kengash va natija', 'The Panel and the Verdict'],
          levelRange: '2-5',
          estMinutes: 55,
          xpReward: 45,
          skills: ['essay-argumentation'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Kuchli qarsili', 'The Strong Rebuttal'],
              minMinutes: 14,
              content: {
                uz: 'Qarsili abzas tartibi: qarshi nuqta (mening tezamga eng yaqin shaklda) → nima uchun ba’zi hollarda to‘g‘ri → lekin shu chegaraning miqdori → mening tezam aylanadigan maydon. Eng kuchli qarsili = ko‘p ball.',
                en: 'Rebuttal structure: the opposing view at its strongest → when it holds → the size of that limitation → the domain where your claim still wins. A strong rebuttal earns marks.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Xulosa qanday ishlaydi', 'How the Conclusion Works'],
              minMinutes: 12,
              content: {
                uz: 'Xulosa yangi dalil kiritmaydi. U uch narsani qiladi: tezani takrorlaydi, uning ta’sirini ko‘rsatadi, amaliy tavsiya beradi. Cheklovni ham aytib o‘tish tezani kuchaytiradi.',
                en: 'A conclusion introduces no new evidence. It restates the thesis, shows its implications and gives a practical recommendation. Naming a limitation strengthens the thesis.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Qarsili drill', 'Rebuttal Drill'],
              minMinutes: 16,
              content: {
                uz: '3 ta mavzu uchun kuchli qarsili abzasini yozing.',
                en: 'Write a strong rebuttal paragraph for three topics.',
              },
              skills: ['essay-argumentation'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '1 ta 350 so‘zlik yakuniy insho.',
                en: 'One final 350-word essay.',
              },
              skills: ['essay-argumentation'],
            },
          ],
        },
        {
          slug: 'writing-independent',
          title: ['Mustaqil tahrir mashqi', 'Independent Writing Practice'],
          summary: [
            'Rejalashtirish, vaqt nazorati va baholash mezonlari.',
            'Planning, time control and self-assessment against criteria.',
          ],
          objectives: [
            ['25 daqiqada reja tuzish', 'Plan in 25 minutes'],
            ['Mezonlar bo‘yicha o‘z-o‘zini baholash', 'Self-assess against criteria'],
          ],
          storyAct: 4,
          storyTitle: ['Yozma mashq zali', 'The Writing Hall'],
          levelRange: '2-5',
          estMinutes: 60,
          xpReward: 50,
          skills: ['essay-structure'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Vaqt taqsimoti', 'Time Allocation'],
              minMinutes: 12,
              content: {
                uz: '60 daqiqa: 10 reja, 40 yozish, 10 tekshirish. Tekshiruv vaqtini olib qo‘yish — eng tez ball yo‘qotish. Tekshirish ro‘yxati: teza aniqmi, har bir abzasda bitta teza, har bir dalil izohlanganmi, xulosa yangi dalil kiritmaganmi.',
                en: '60 minutes: 10 planning, 40 writing, 10 checking. Skipping the check is the fastest way to lose marks. Checklist: is the thesis explicit, does each paragraph carry one claim, is each piece of evidence interpreted, does the conclusion add no new evidence?',
              },
            },
            {
              kind: 'DRILL',
              title: ['To‘liq mashq', 'Full Rehearsal'],
              minMinutes: 45,
              content: {
                uz: 'Berilgan mavzu uchun 60 daqiqalik to‘liq mustaqil yozuv. Vaqtni ko‘rsating.',
                en: 'A full 60-minute independent write-up on the given topic. Track the time.',
              },
              skills: ['essay-structure'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 15,
              content: {
                uz: 'Mezonlar bo‘yicha o‘z-o‘zini baholang va ikki zaif joyni belgilang.',
                en: 'Score yourself against the criteria and mark two weak spots.',
              },
              skills: ['essay-structure'],
            },
          ],
        },
      ],
    },
  ],
};