import type { SeedCourse } from '../../types';

/** Akademik ingliz tili kursi: 4 dars. */
export const ACADEMIC_ENGLISH_COURSE: SeedCourse = {
  slug: 'academic-english',
  subject: 'ACADEMIC_ENGLISH',
  title: ['Akademik ingliz tili', 'Academic English'],
  description: [
    'Ilmiy yozish va o‘qish uchun grammatika, lug‘at va uslub.',
    'Grammar, vocabulary and style for academic writing and reading.',
  ],
  modules: [
    {
      slug: 'ae-core',
      title: ['Akademik til asoslari', 'Academic Language Foundations'],
      description: ['Tuzilma, zamon va lug‘at.', 'Structure, tense and vocabulary.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'ae-structure-tense',
          title: ['Tuzilma va zamon', 'Structure and Tense'],
          summary: [
            'Tergalarga bog‘liq tuzilmalar, zamon mosligi va modal fe’llar.',
            'Clause-dependent constructions, tense agreement and modal verbs.',
          ],
          objectives: [
            ['Second conditional va counterfactual tuzilish', 'Build second-conditional counterfactuals'],
            ['Modal fe’llarning aniqlik darajasini farqlash', 'Distinguish degrees of certainty in modals'],
          ],
          storyAct: 1,
          storyTitle: ['Zamon zarbasi', 'The Tense Hour'],
          levelRange: '0-3',
          estMinutes: 50,
          xpReward: 40,
          skills: ['academic-grammar'],
          blocks: [
            {
              kind: 'STORY',
              title: ['Zamon zarbasi', 'The Tense Hour'],
              minMinutes: 5,
              content: {
                uz: 'Muharrir sizning yozishingizni tahrirlamoqda. U har bir gapda zamon mosligini tekshiradi. Bir xato butish qatorini buzadi.',
                en: 'An editor is revising your writing. They check tense agreement in every sentence. One slip breaks the whole sequence.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Shartli tuzilishlar', 'Conditional Constructions'],
              minMinutes: 14,
              content: {
                uz: 'Birinchi shart (haqiqiy emas, hozir): If + present, will + base. Ikkinchi shart (counterfactual): If + past, would + base. Uchinchi shart (o‘tmishda bo‘lmagan): If + past perfect, would have + past participle. Namuna: "If I had had more time, I would have learned a third language."',
                en: 'First conditional (unreal, now): If + present, will + base. Second (counterfactual): If + past, would + base. Third (unreal past): If + past perfect, would have + past participle. Example: “If I had had more time, I would have learned a third language.”',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Modal fe’llar va aniqlik', 'Modals and Certainty'],
              minMinutes: 12,
              content: {
                uz: 'Aniqlik ierarxiyasi: must > should > may > might. Ilmiy yozishda ehtiyotkorlik: "The data suggest" (kuchli), "The data may suggest" (kuchsiz). Har bir modal o‘z kuchiga ega — ularni aralashtirib yubormaslik kerak.',
                en: 'Certainty ladder: must > should > may > might. In academic writing, hedge carefully: “The data suggest” (strong), “The data may suggest” (weak). Each modal carries its own strength — do not mix them.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Tuzilma drill', 'Structure Drill'],
              minMinutes: 14,
              content: {
                uz: '10 ta tuzilma tanlash va 3 ta counterfactual jumla tuzing.',
                en: 'Ten structure choices and three counterfactual sentences.',
              },
              skills: ['academic-grammar'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '10 ta aralash grammatika savoli.',
                en: 'Ten mixed grammar questions.',
              },
              skills: ['academic-grammar'],
            },
          ],
        },
        {
          slug: 'ae-article-agreement',
          title: ['Artikl, qo‘shimcha va kelishuv', 'Articles, Modifiers and Agreement'],
          summary: [
            'A/an/the tanlash, predikativ artikl va qo‘shimchilar tartibi.',
            'Choosing a/an/the, predicative articles and modifier order.',
          ],
          objectives: [
            ['Artiklni kontekstga qarab tanlash', 'Choose an article from context'],
            ['Qalqon so‘z va modal felning tartibini to‘g‘rilash', 'Fix hedge-word and modal-verb order'],
          ],
          storyAct: 1,
          storyTitle: ['Artikl kalitlari', 'The Article Keys'],
          levelRange: '0-4',
          estMinutes: 50,
          xpReward: 40,
          skills: ['academic-grammar'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Uch artikl qoidalari', 'The Three Article Rules'],
              minMinutes: 14,
              content: {
                uz: 'A/an — birinchi bo‘lish yoki umumiylik (an engineer, a university). The — aniq, allaqachon aytilgan yoki butun dunyoga xos (the university, the first time). Nol artikl — ko‘pchilik (umumiy) tushunchalar uchun: Knowledge is power.',
                en: 'A/an — first mention or genericity (an engineer, a university). The — specific, already mentioned, or unique (the university, the first time). Zero article — general concepts: Knowledge is power.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Kelishuv xatolari', 'Agreement Errors'],
              minMinutes: 12,
              content: {
                uz: 'Qiyin ishli predikatlar: the data, the research, the information — ular ko‘pchilikka ko‘ra ko‘plik (were), lekin ilmiy uslubda ko‘pincha yagona talqin qilinadi va "was" ishlatiladi. Ikkalasini ham bilish kerak, ammo bitta usulni tanlang va yozimda saqlang.',
                en: 'Tricky subjects: the data, the research, the information take plural agreement (were) traditionally, though modern academic style often treats them as singular (was). Know both, choose one and stay consistent.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Artikl drill', 'Article Drill'],
              minMinutes: 14,
              content: {
                uz: '12 ta artikl tanlash va 4 ta kelishuv tuzatish.',
                en: 'Twelve article choices and four agreement corrections.',
              },
              skills: ['academic-grammar'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '12 ta aralash grammatika savoli.',
                en: 'Twelve mixed grammar questions.',
              },
              skills: ['academic-grammar'],
            },
          ],
        },
        {
          slug: 'ae-vocabulary-building',
          title: ['Akademik lug‘at qurish', 'Building Academic Vocabulary'],
          summary: [
            'Lug‘at oilalarini o‘zlashtirish, so‘z tanlash va qo‘llanish.',
            'Learning word families, choosing and using words precisely.',
          ],
          objectives: [
            ['Lug‘at oilasini bosh qilishdan kengaytirish', 'Expand from a head word to a word family'],
            ['Nisbiy aniq so‘z tanlash', 'Select the precisely relative word'],
          ],
          storyAct: 2,
          storyTitle: ['So‘z oilalari', 'Word Families'],
          levelRange: '1-5',
          estMinutes: 50,
          xpReward: 40,
          skills: ['academic-vocabulary'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Lug‘at oilasi', 'The Word Family'],
              minMinutes: 12,
              content: {
                uz: 'Bitta so‘zni o‘rganish o‘rniga oilasini o‘rganing: verify → verification, verified, verifier. Shu bilan birga ikki qarama-qarshi so‘zni birga o‘rganing: increase / decrease, significant / insignificant. Bu juftliklar imtihonda tez-tez uchraydi.',
                en: 'Learn a family instead of one word: verify → verification, verified, verifier. Pair opposites at the same time: increase / decrease, significant / insignificant. These pairs appear constantly in exams.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Taxmin va dalil farqi', 'Estimate vs Evidence'],
              minMinutes: 12,
              content: {
                uz: 'Muallif qalqon so‘zi bilan dalil chegarasini belgilaydi: "suggest", "may", "is likely to" — dalil kuchsiz; "demonstrates", "proves" — dalil kuchli. Sizning ishingiz dalilni kuchaytirish, lekin haddan oshmasligi.',
                en: 'Hedge words mark the strength of evidence: “suggest”, “may”, “is likely to” are weak; “demonstrates”, “proves” are strong. Your job is to strengthen evidence without overreaching.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Lug‘at oilasi drill', 'Word-Family Drill'],
              minMinutes: 14,
              content: {
                uz: '10 ta bosh so‘zdan oila tuzing va 5 ta qarama-qarshi juftlik yozing.',
                en: 'Build families from ten head words and write five opposite pairs.',
              },
              skills: ['academic-vocabulary'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '12 ta lug‘at va qo‘llanish savoli.',
                en: 'Twelve vocabulary and usage questions.',
              },
              skills: ['academic-vocabulary'],
            },
          ],
        },
        {
          slug: 'ae-reading-style',
          title: ['Akademik o‘qish uslubi', 'Academic Reading Style'],
          summary: [
            'Turli janrli matnlarni tanib olish va muallif pozitsiyasini aniqlash.',
            'Recognising genre and identifying an author’s stance.',
          ],
          objectives: [
            ['Matn janrini va uning vazifasini aniqlash', 'Identify genre and purpose'],
            ['Muallifning pozitsiyasini qalqon so‘zlar orqali topish', 'Locate the stance through hedging'],
          ],
          storyAct: 3,
          storyTitle: ['O‘qish xonasining ovozi', 'Voices of the Reading Room'],
          levelRange: '1-5',
          estMinutes: 55,
          xpReward: 45,
          skills: ['academic-reading-style'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Qalqon so‘z = pozitsiya', 'Hedging = Stance'],
              minMinutes: 14,
              content: {
                uz: 'Muallif qanchalik ko‘p qalqon qo‘llasa, pozitsiyasi shunchalik ehtiyotkor. "This essay argues" — kuchli. "It is sometimes suggested that" — kuchsiz. Matn oxiridagi xulosa va kirishdagi teza o‘rtasidagi farq muallifning o‘zgarishi yoki cheklovini ko‘rsatadi.',
                en: 'The more hedging an author uses, the more cautious the stance. “This essay argues” is strong; “it is sometimes suggested that” is weak. A gap between the opening thesis and the conclusion reveals a shift or a limitation.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Janr va uning vazifasi', 'Genre and Purpose'],
              minMinutes: 12,
              content: {
                uz: 'Tadqiqot maqolasi — dalil to‘plash; sharh — muhokama qilish; metodologiya — usul ta’riflash; siyosat hujjati — tavsiya berish. Janrni bilganingizda siz qanday dalil kutayotganingizni bilasiz.',
                en: 'Research articles assemble evidence; commentaries discuss; methodology papers describe methods; policy documents recommend. Knowing the genre tells you what kind of evidence to expect.',
              },
            },
            {
              kind: 'DRILL',
              title: ['O‘qish drill', 'Reading Drill'],
              minMinutes: 16,
              content: {
                uz: '3 ta qisqa matnni o‘qing: janr, maqsad, muallif pozitsiyasi.',
                en: 'Read three short passages: genre, purpose and author stance.',
              },
              skills: ['academic-reading-style'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '8 ta tahliliy o‘qish savoli.',
                en: 'Eight analytical reading questions.',
              },
              skills: ['academic-reading-style'],
            },
          ],
        },
      ],
    },
  ],
};