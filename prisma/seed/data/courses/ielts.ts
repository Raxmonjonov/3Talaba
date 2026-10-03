import type { SeedCourse } from '../../types';

/** IELTS kursi: 6 dars (listening, reading, writing, speaking). */
export const IELTS_COURSE: SeedCourse = {
  slug: 'ielts',
  subject: 'IELTS',
  title: ['IELTS tayyorgarlik', 'IELTS Preparation'],
  description: [
    'Listening, Reading, Writing va Speaking bo‘limlari uchun usullar, mashq va band oshirish strategiyalari.',
    'Strategy, practice and band-improvement techniques for Listening, Reading, Writing and Speaking.',
  ],
  modules: [
    {
      slug: 'ielts-listening',
      title: ['IELTS Listening', 'IELTS Listening'],
      description: ['Tinglash strategiyasi va distractorlar.', 'Listening strategy and distractors.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'ielts-listening-map',
          title: ['Xaritalar, yo‘nalishlar va aniq raqamlar', 'Maps, Directions and Exact Numbers'],
          summary: [
            'Yo‘l beruvchi so‘zlar, o‘lchov birligi va raqam distractorlarini yengish.',
            'Handling direction words, units of measure and number distractors.',
          ],
          objectives: [
            ['Yo‘nalish beruvchi kalit so‘zlarni aniqlash', 'Identify directional keywords'],
            ['Bir xil o‘xshash so‘zlarni farqlash', 'Distinguish confusable place names'],
          ],
          storyAct: 1,
          storyTitle: ['Eslatma xaritasi', 'The Map of Cues'],
          levelRange: '0-3',
          estMinutes: 45,
          xpReward: 40,
          skills: ['ielts-listening'],
          blocks: [
            {
              kind: 'STORY',
              title: ['Eslatma xaritasi', 'The Map of Cues'],
              minMinutes: 5,
              content: {
                uz: 'Siz universitetga yaqinlashmoqchisiz, lekin har bir bino nomi o‘xshab qoladi. Xarita yordamida eslatmalarni to‘plash kerak.',
                en: 'You are approaching a university, but every building name sounds similar. You must collect the cues from a map.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Kalit so‘zlar ro‘yxati', 'The Keyword Checklist'],
              minMinutes: 12,
              content: {
                uz: 'Yo‘nalish: pastda, yuqorida, chapda, o‘ngda, to‘g‘rida, orqada. O‘lchov: metr, kilometr, yard, fut. Har bir kalit so‘z tinglashda qayd qilinadi — masalan "the library is next to" = yonida.',
                en: 'Directions: below, above, left, right, opposite, behind. Units: metre, kilometre, yard, foot. Note every cue word — "next to" means immediately adjacent.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Ikkita bir xil eshitiladigan nom', 'Two Similar-Sounding Names'],
              minMinutes: 10,
              content: {
                uz: '"Harper" va "Harris" degan ikki bino bor. Tinglovchi "turn right at the Harris building, then the Harper building is on your left" dedi. Savol: qaysi birinchi keladi? Javob: avval Harris, so‘ng Harper. Ketma-ketlikni diqqat bilan eslang.',
                en: 'Two buildings: “Harper” and “Harris”. The speaker says “turn right at the Harris building, then the Harper building is on your left.” Which comes first? Answer: Harris first, then Harper. Track the sequence carefully.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Xarita drilli', 'Map Drill'],
              minMinutes: 15,
              content: {
                uz: '8 ta yo‘nalish/joylashuv savoli. Har birida kalit so‘zni va javobni yozing.',
                en: 'Eight direction and location questions. Write the cue word and the answer.',
              },
              skills: ['ielts-listening'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 10,
              content: {
                uz: '8 ta aralash listening savoli.',
                en: 'Eight mixed listening questions.',
              },
              skills: ['ielts-listening'],
            },
          ],
        },
        {
          slug: 'ielts-listening-sections',
          title: ['Bo‘limlar, vaqt va to‘ldirish qoidalari', 'Sections, Timing and Form-Filling Rules'],
          summary: [
            '1–4-bo‘lim qoidalari, kunlik hayot mavzulari va raqam distractorlari.',
            'Sections 1–4, everyday topics and number distractors.',
          ],
          objectives: [
            ['Har bir bo‘limning e’tibor talabini bilish', 'Know what each section demands'],
            ['Noto‘g‘ri raqam distractorlarini filtrlash', 'Filter number distractors'],
          ],
          storyAct: 1,
          storyTitle: ['To‘ldirish qoidasi', 'The Form-Filling Rule'],
          levelRange: '2-5',
          estMinutes: 50,
          xpReward: 45,
          skills: ['ielts-listening'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['To‘rt bo‘limning xarakteri', 'The Four Sections'],
              minMinutes: 12,
              content: {
                uz: '1-bo‘lim kunlik ehtiyojlar (2 kishi), 2-bo‘lim ijtimoiy hayot, 3-bo‘lim ta’lim/ish muhiti, 4-bo‘lim ilmiy ma’ruza. Ochqayotgan savollar soni har doim kamayib boradi.',
                en: 'Section 1: everyday needs (two speakers); 2: social life; 3: education and work; 4: academic lecture. The number of questions decreases each time.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Raqam distractorlarini filtrlash', 'Filtering Number Distractors'],
              minMinutes: 12,
              content: {
                uz: 'Diqat: "The registration fee is 150 pounds, but last year it was 120." Javob 150, chunki joriy qiymat so‘raladi. Eski qiymat distractor.',
                en: 'Note: “The registration fee is 150 pounds, but last year it was 120.” The answer is 150, because the current value is asked. The old value is the distractor.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Forma to‘ldirish drilli', 'Form-Filling Drill'],
              minMinutes: 16,
              content: {
                uz: '10 ta bo‘sh joyni to‘ldirish savoli.',
                en: 'Ten gap-fill questions.',
              },
              skills: ['ielts-listening'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '10 ta aralash listening savoli.',
                en: 'Ten mixed listening questions.',
              },
              skills: ['ielts-listening'],
            },
          ],
        },
      ],
    },
    {
      slug: 'ielts-reading',
      title: ['IELTS Reading', 'IELTS Reading'],
      description: ['Matn strategiyasi, TRUE/FALSE/NOT GIVEN va boshqa savol turlari.', 'Text strategy, TRUE/FALSE/NOT GIVEN and other question types.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'ielts-true-false-not-given',
          title: ['TRUE / FALSE / NOT GIVEN farqi', 'TRUE / FALSE / NOT GIVEN'],
          summary: [
            'Uchta javob variantini aniq farqlash — IELTS reading ning asosiy skill’i.',
            'Distinguishing the three answer options — the core Reading skill.',
          ],
          objectives: [
            ['Matnda bor/yo‘q/aniq emas farqlash', 'Separate stated, contradicted and unspecified'],
            ['Qalqon so‘zlarini qayd qilish', 'Flag hedge words'],
          ],
          storyAct: 2,
          storyTitle: ['Uch rangli kalit', 'The Three-Coloured Key'],
          levelRange: '0-4',
          estMinutes: 55,
          xpReward: 45,
          skills: ['ielts-reading'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Uchta variantning aniq ta’rifi', 'Precise Definitions of the Three Options'],
              minMinutes: 14,
              content: {
                uz: 'TRUE = matnda aniq aytilgan. FALSE = matnda teskari aytilgan. NOT GIVEN = matn bu haqda umuman gapirmaydi. Kalit: matnda gapirmagan narsa NOT GIVEN bo‘ladi — sizning bilimingiz emas.',
                en: 'TRUE = the text states it. FALSE = the text states the opposite. NOT GIVEN = the text says nothing about it. The key: your own knowledge is irrelevant.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Qalqon so‘zlarini izlash', 'Spotting Hedge Words'],
              minMinutes: 12,
              content: {
                uz: '"Researchers suggest a link between X and Y." Bu — faqat faraz; X va Y o‘rtasidagi bog‘liqlik isbotlangan emas. Agar savol "Researchers have proven a link" bo‘lsa, javob FALSE.',
                en: '“Researchers suggest a link between X and Y.” This is only a hypothesis; no proven link exists. If the question says “Researchers have proven a link”, the answer is FALSE.',
              },
            },
            {
              kind: 'DRILL',
              title: ['TFNG drilli', 'TFNG Drill'],
              minMinutes: 16,
              content: {
                uz: '12 ta TRUE/FALSE/NOT GIVEN savoli.',
                en: 'Twelve TRUE/FALSE/NOT GIVEN questions.',
              },
              skills: ['ielts-reading'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '12 ta aralash reading savoli.',
                en: 'Twelve mixed reading questions.',
              },
              skills: ['ielts-reading'],
            },
          ],
        },
        {
          slug: 'ielts-matching-headings',
          title: ['Matching headings va rejalashtirish', 'Matching Headings and Planning'],
          summary: [
            'Sarlavha moslash, 60 daqiqalik reja va vaqt boshqaruvi.',
            'Heading matching, the 60-minute plan and time control.',
          ],
          objectives: [
            ['Paragrafni qisqa sarlavha bilan bog‘lash', 'Match a paragraph to a short heading'],
            ['60 daqiqani uch bosqichga bo‘lish', 'Split the 60 minutes into three stages'],
          ],
          storyAct: 3,
          storyTitle: ['Reja doskasi', 'The Planning Desk'],
          levelRange: '2-5',
          estMinutes: 55,
          xpReward: 45,
          skills: ['ielts-reading'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Uch bosqichli reja', 'The Three-Stage Plan'],
              minMinutes: 12,
              content: {
                uz: '1) 20 daqiqa: sarlavhalarni o‘qib, 2-3 bandli reja tuzing. 2) 20 daqiqa: matnni o‘qib, savollarga javob belgilang. 3) 20 daqiqa: qiyin savollarga qaytiring. Bu tartib tez savollarda yo‘qotilgan vaqtni qaytaradi.',
                en: '1) 20 min: read the headings and make a 2–3 word plan. 2) 20 min: read the passage and mark answers. 3) 20 min: return to hard questions. This order recovers time lost on easy items.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Sarlavhadan foydalanish', 'Using the Headings'],
              minMinutes: 12,
              content: {
                uz: 'Sarlavhadagi bir so‘z butun g‘oyani beradi: "Costs" → iqtisodiy jihatlar; "Origins" → kelib chiqish; "Future" → istiqbol. Paragrafni o‘qishdan oldin sarlavhani tahlil qiling.',
                en: 'One word in a heading carries the whole idea: “Costs” → economics; “Origins” → beginnings; “Future” → prospects. Read the headings before the passage.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Moslashtirish drilli', 'Matching Drill'],
              minMinutes: 16,
              content: {
                uz: '10 ta sarlavha va 8 ta matching savoli.',
                en: 'Ten headings and eight matching questions.',
              },
              skills: ['ielts-reading'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 15,
              content: {
                uz: '14 ta aralash reading savoli va reja vaqti.',
                en: 'Fourteen mixed reading questions with a planning timer.',
              },
              skills: ['ielts-reading'],
            },
          ],
        },
      ],
    },
    {
      slug: 'ielts-writing',
      title: ['IELTS Writing', 'IELTS Writing'],
      description: ['Task 1 vizual tavsif va Task 2 muhokama.', 'Task 1 visual description and Task 2 discussion.'],
      levelRange: '1-5',
      lessons: [
        {
          slug: 'ielts-task1',
          title: ['Task 1: grafik va diagramma', 'Task 1: Graphs and Diagrams'],
          summary: ['Jadval, ustun, chiziqli grafik va boshqa vizual shakllar.', 'Tables, bar charts, line graphs and other visual forms.'],
          objectives: [
            ['Eng katta va eng kichik o‘zgarishni tanlash', 'Identify the largest and smallest changes'],
            ['Guruhlarni taqqoslash', 'Compare groups'],
          ],
          storyAct: 4,
          storyTitle: ['Grafik shahri', 'The City of Graphs'],
          levelRange: '1-4',
          estMinutes: 60,
          xpReward: 50,
          skills: ['ielts-writing'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Vizual til', 'The Visual Language'],
              minMinutes: 14,
              content: {
                uz: 'Ikki o‘lchovli: o‘sish — rise, increase, growth, surge; tushish — fall, decline, decrease, drop; barqaror — level off, remain stable, plateau. Ustun va qator taqqoslang — hech qachon "barchasi oshdi" demang.',
                en: 'Rise, increase, growth, surge; fall, decline, decrease, drop; level off, remain stable, plateau. Compare lines and bars — never write “everything increased”.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Tezlikni aniq ifodalash', 'Expressing Speed Precisely'],
              minMinutes: 12,
              content: {
                uz: 'Natija "sharp rise" bo‘lsa, sabab ko‘rinishi kerak: "The figure climbed sharply from 12% to 45%." Sababsiz "rose" band pasaytiradi.',
                en: 'If the change is a “sharp rise”, give the cause: “The figure climbed sharply from 12% to 45%.” A bare “rose” costs you a band.',
              },
            },
            {
              kind: 'DRILL',
              title: ['1-topshiriq drilli', 'Task 1 Drill'],
              minMinutes: 20,
              content: {
                uz: '1 ta grafik uchun 150 so‘zlik yozuv. Kamida 6 ta o‘zgarishni tasvirlang.',
                en: 'Write 150 words describing one graph. Include at least six changes.',
              },
              skills: ['ielts-writing'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 14,
              content: {
                uz: '1 ta to‘liq Task 1 javobi va 5 ta qisqa tavsif savoli.',
                en: 'One full Task 1 response and five short description questions.',
              },
              skills: ['ielts-writing'],
            },
          ],
        },
        {
          slug: 'ielts-task2',
          title: ['Task 2: muhokama inshosi', 'Task 2: The Discussion Essay'],
          summary: [
            'Teza, dalillar, qarshi argument va xulosa; Task 2 band talablari.',
            'Thesis, evidence, counterargument and conclusion; Task 2 band criteria.',
          ],
          objectives: [
            ['Aniq teza shakllantirish', 'Formulate a clear thesis'],
            ['Qarshi argumentni kuchli qaytarish', 'Strongly answer the counterargument'],
          ],
          storyAct: 4,
          storyTitle: ['Debat zali', 'The Debate Hall'],
          levelRange: '1-5',
          estMinutes: 60,
          xpReward: 50,
          skills: ['ielts-writing'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Kirish, dalil, qarsili, xulosa', 'Introduction, Body, Counter, Conclusion'],
              minMinutes: 14,
              content: {
                uz: 'Kirishda teza aniq bo‘lsin: "While X has benefits, Y matters more because Z." Asosiy abzas = dalil + misol + izoh. Qarsili abzas = qarshi nuqta + uning chegarasi. Xulosa = tavsiya, yangi dalil emas.',
                en: 'State a clear thesis: “While X has benefits, Y matters more because Z.” Body = claim + example + explanation. Counter paragraph = opposing point + its limits. Conclusion = a recommendation, not a new fact.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Kuchli dalil qanday bo‘ladi', 'What Strong Evidence Looks Like'],
              minMinutes: 12,
              content: {
                uz: 'Dalil — raqam, statistika yoki aniq voqea. Uni keltirgach, nima uchun bu tezinga xizmat qilishini bir jumla bilan tushuntiring. Shunda "Task Response" balli oshadi.',
                en: 'Evidence is a figure, a statistic or a specific case. After citing it, explain in one sentence why it supports your claim. This raises Task Response.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Task 2 rejalashtirish', 'Task 2 Planning'],
              minMinutes: 14,
              content: {
                uz: '10 daqiqada: teza (1 jumla), 2 ta asosiy dalil, 1 ta qarsili nuqta, xulosa g‘oyasi. Rejani yozib oling.',
                en: 'In 10 minutes: write a one-sentence thesis, two main points, one counterargument, and a conclusion idea.',
              },
              skills: ['ielts-writing'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 20,
              content: {
                uz: '40 daqiqada 250 so‘zlik to‘liq insho. Oxirida o‘zingizni tekshiruv ro‘yxati bo‘yicha baholang.',
                en: 'Write a full 250-word essay in 40 minutes. Then self-assess against the criteria checklist.',
              },
              skills: ['ielts-writing'],
            },
          ],
        },
      ],
    },
    {
      slug: 'ielts-speaking',
      title: ['IELTS Speaking', 'IELTS Speaking'],
      description: ['Uchta band, kengaytirilgan javob va band 8 sirlari.', 'The three parts, extended answers and band 8 techniques.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'ielts-speaking-part1',
          title: ['Part 1: kunlik mavzular', 'Part 1: Everyday Topics'],
          summary: ['Qisqa javob, kengaytirish va tabiiy oqish.', 'Short answers, extension and natural delivery.'],
          objectives: [
            ['2–3 jumladan iborat javob berish', 'Answer in two or three sentences'],
            ['Tabiiy to‘xtashlardan foydalanish', 'Use natural hesitation'],
          ],
          storyAct: 5,
          storyTitle: ['Bir daqiqalik javob', 'The One-Minute Answer'],
          levelRange: '0-2',
          estMinutes: 40,
          xpReward: 35,
          skills: ['ielts-speaking'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Kengaytirish usuli', 'The Extension Method'],
              minMinutes: 12,
              content: {
                uz: 'Bitta jumla javob yetarli emas. Formula: javob + sabab + misol. "Yes, I do. I started three years ago because… For example, last month I…" Bu band 6 va 7 farqini yaratadi.',
                en: 'One sentence is not enough. Formula: answer + reason + example. “Yes, I do. I started three years ago because… For example, last month I…” This separates Band 6 from Band 7.',
              },
            },
            {
              kind: 'DRILL',
              title: ['1-qism drilli', 'Part 1 Drill'],
              minMinutes: 14,
              content: {
                uz: '10 ta kunlik savolga 2–3 jumladan iborat javob bering, har biriga sabab va misol qo‘shing.',
                en: 'Answer ten everyday questions in two or three sentences each, adding a reason and an example.',
              },
              skills: ['ielts-speaking'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 14,
              content: {
                uz: '3 daqiqalik to‘liq Part 1 mashqi (ovo bilan).',
                en: 'A full three-minute Part 1 rehearsal, out loud.',
              },
              skills: ['ielts-speaking'],
            },
          ],
        },
        {
          slug: 'ielts-speaking-part2-3',
          title: ['Part 2 va Part 3', 'Parts 2 and 3'],
          summary: [
            '1 daqiqalik tayyorgarlik, kengaytirilgan hikoya va tahliliy savollar.',
            'The one-minute preparation, an extended story and abstract questions.',
          ],
          objectives: [
            ['Noto‘g‘ri yozib o‘tmasdan eslatma tuzish', 'Take useful notes, not a script'],
            ['Part 3 da sabab-natija tahlil qilish', 'Analyse causes and effects in Part 3'],
          ],
          storyAct: 5,
          storyTitle: ['Hikoya va tahlil', 'Story and Analysis'],
          levelRange: '2-5',
          estMinutes: 55,
          xpReward: 45,
          skills: ['ielts-speaking'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Eslatmalar strategiyasi', 'Note-Taking Strategy'],
              minMinutes: 12,
              content: {
                uz: '1 daqiqada to‘liq matn yozmang. Faqat kalit so‘zlar va 2 ta savol yozing: "Qayerda? Nima uchun? Nima natija?" Bu sizga 2 daqiqalik javob berish imkonini beradi.',
                en: 'Do not write a script in one minute. Write keywords and two questions: “Where? Why? What was the outcome?” This gives you a two-minute answer.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Part 3 tahlil', 'Part 3 Analysis'],
              minMinutes: 12,
              content: {
                uz: 'Part 3 da javob qisqa emas. Sabab, oqibat va taqqoslash uchun "bu… chunki…", "uning o‘rniga…", "oldingisidan farqli ravishda…" shablonlarini ishlating.',
                en: 'Part 3 answers are longer. Use “this… because…”, “whereas…”, “in contrast to…” to cover cause, effect and comparison.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Part 2 mashqi', 'Part 2 Rehearsal'],
              minMinutes: 16,
              content: {
                uz: 'Kartadagi mavzu uchun 1 daqiqa eslatma va 2 daqiqa monolog.',
                en: 'One minute of notes and a two-minute monologue for a card topic.',
              },
              skills: ['ielts-speaking'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 15,
              content: {
                uz: '6 ta Part 3 tahliliy savolga javob bering.',
                en: 'Answer six abstract Part 3 questions.',
              },
              skills: ['ielts-speaking'],
            },
          ],
        },
      ],
    },
  ],
};