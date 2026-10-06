import type { SeedQuestion } from '../types';

/** Academic English: grammar (18), vocabulary (14), reading style (8) = 40. */
export const ACADEMIC_QUESTIONS: SeedQuestion[] = [
  // ── academic-grammar ─────────────────────────────────────────────────────
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      'To‘g‘ri variantni tanlang: "Agar men ___ ko‘proq vaqtim bo‘lsa, uchinchi tilni o‘rganar edim."',
      'Choose the correct option: “If I ___ more time, I would learn a third language.”',
    ],
    options: [
      {
        label: { uz: 'had', en: 'had' },
        correct: true,
        explanation: {
          uz: 'Bu ikkinchi shartli gap (unreal holat): if + o‘tmish shakli, would + asosiy shakl.',
          en: 'This is a second conditional (unreal situation): if + past form, would + base form.',
        },
      },
      { label: { uz: 'have', en: 'have' } },
      { label: { uz: 'will have', en: 'will have' } },
      { label: { uz: 'would have', en: 'would have' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      'To‘g‘ri artiklni tanlang: "U nemis kompaniyasida ___ muhandis sifatida ishlaydi."',
      'Choose the correct article: “She works as ___ engineer at a German company.”',
    ],
    options: [
      {
        label: { uz: 'an', en: 'an' },
        correct: true,
        explanation: {
          uz: 'Kasb nomi bilan birga ishlatilganda artikl kerak bo‘ladi: as an engineer.',
          en: 'Occupational nouns take an article when used with a verb: as an engineer.',
        },
      },
      { label: { uz: 'a', en: 'a' } },
      { label: { uz: 'the', en: 'the' } },
      { label: { uz: '— (artiklsiz)', en: '— (no article)' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 45,
    p: [
      'To‘g‘ri shaklni tanlang: "Ma’lumotlar uch yil davomida ___ to‘plandi."',
      'Choose the correct form: “The data ___ collected over three years.”',
    ],
    options: [
      { label: { uz: 'was', en: 'was' } },
      {
        label: { uz: 'were', en: 'were' },
        correct: true,
        explanation: {
          uz: '"Data" so‘zi ko‘plikda talab qilinadi (rasmiy akademik uslubda).',
          en: 'In formal academic English “data” takes the plural.',
        },
      },
      { label: { uz: 'has been', en: 'has been' } },
      { label: { uz: 'is', en: 'is' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      'To‘g‘ri modalni tanlang: “Shanba oldidan shaklni topshirishingiz ___ ; muddat qat’iy.”',
      'Choose the correct modal: “You ___ submit the form before Friday; the deadline is strict.”',
    ],
    options: [
      { label: { uz: 'must', en: 'must' }, correct: true },
      { label: { uz: 'might', en: 'might' } },
      { label: { uz: 'could', en: 'could' } },
      { label: { uz: 'would', en: 'would' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 60,
    p: [
      'To‘g‘ri nisbiy olmoshni tanlang: “Professor, ___ ma’ruzasiga biz qatnashgan, Nobel mukofoti laureati.”',
      'Choose the correct relative pronoun: “The professor, ___ lecture we attended, is a Nobel laureate.”',
    ],
    options: [
      { label: { uz: 'whose', en: 'whose' }, correct: true },
      { label: { uz: 'who', en: 'who' } },
      { label: { uz: 'which', en: 'which' } },
      { label: { uz: 'whom', en: 'whom' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 60,
    p: [
      'To‘g‘ri zamon shaklini tanlang: “Biz kelganimizda ma’ruza ___ edi.”',
      'Choose the correct tense: “By the time we arrived, the lecture ___.”',
    ],
    options: [
      { label: { uz: 'had already started', en: 'had already started' }, correct: true },
      { label: { uz: 'has already started', en: 'has already started' } },
      { label: { uz: 'was already starting', en: 'was already starting' } },
      { label: { uz: 'already started', en: 'already started' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 75,
    p: [
      'To‘g‘ri passiv shaklni tanlang: “Natijalar ikki mustaqil muharrir tomonidan ___ .”',
      'Choose the correct passive: “The results ___ by two independent reviewers.”',
    ],
    options: [
      { label: { uz: 'were verified', en: 'were verified' }, correct: true },
      { label: { uz: 'was verified', en: 'was verified' } },
      { label: { uz: 'have verified', en: 'have verified' } },
      { label: { uz: 'are verifying', en: 'are verifying' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 75,
    p: [
      'To‘g‘ri miqdorni tanlang: “O‘quvchilarning ___ topshirmalarni vaqtida topshirdi.”',
      'Choose the correct quantifier: “___ of the students had submitted the assignment on time.”',
    ],
    options: [
      { label: { uz: 'Most', en: 'Most' }, correct: true },
      { label: { uz: 'Much', en: 'Much' } },
      { label: { uz: 'Few', en: 'Few' } },
      { label: { uz: 'A number of much', en: 'A number of much' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 90,
    p: [
      'To‘g‘ri jumlani tanlang:',
      'Choose the correct sentence:',
    ],
    options: [
      { label: {
        uz: 'Not until the analysis was completed did we notice the discrepancy.',
        en: 'Not until the analysis was completed did we notice the discrepancy.',
      }, correct: true },
      { label: {
        uz: 'Not until the analysis was completed we noticed the discrepancy.',
        en: 'Not until the analysis was completed we noticed the discrepancy.',
      } },
      { label: {
        uz: 'Until the analysis was not completed, we did not notice the discrepancy.',
        en: 'Until the analysis was not completed, we did not notice the discrepancy.',
      } },
      { label: {
        uz: 'Not until the analysis was completed we did notice the discrepancy.',
        en: 'Not until the analysis was completed we did notice the discrepancy.',
      } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 90,
    p: [
      'Eng mos so‘zni tanlang: “Xulosa oldingi adabiyot bilan ___ .”',
      'Choose the best word: “The findings ___ with the earlier literature.”',
    ],
    options: [
      { label: { uz: 'are consistent', en: 'are consistent' }, correct: true },
      { label: { uz: 'are consistent to', en: 'are consistent to' } },
      { label: { uz: 'consistent are', en: 'consistent are' } },
      { label: { uz: 'is consistent', en: 'is consistent' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 90,
    p: [
      'To‘g‘ri shaklni tanlang: “U taklifni ___ rad etdi.”',
      'Choose the correct form: “She denied ___ the invitation.”',
    ],
    options: [
      { label: { uz: 'receiving', en: 'receiving' }, correct: true },
      { label: { uz: 'to receive', en: 'to receive' } },
      { label: { uz: 'that she received', en: 'that she received' } },
      { label: { uz: 'of receiving', en: 'of receiving' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 90,
    p: [
      'To‘g‘ri shaklni tanlang: “___ qancha ko‘p urinsa, u shuncha kam yaxshilanadi.”',
      'Choose the correct form: “___ harder she tried, the less she improved.”',
    ],
    options: [
      { label: { uz: 'However', en: 'However' }, correct: true },
      { label: { uz: 'How', en: 'How' } },
      { label: { uz: 'Whatever', en: 'Whatever' } },
      { label: { uz: 'Though', en: 'Though' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 120,
    p: [
      'Eng mos tuzilmani tanlang: “Tajriba boshlang‘ich gipotezani ___ bajarildi.”',
      'Choose the best structure: “The experiment failed, ___ the initial hypothesis.”',
    ],
    options: [
      { label: { uz: 'contradicting', en: 'contradicting' }, correct: true },
      { label: { uz: 'to contradict', en: 'to contradict' } },
      { label: { uz: 'contradicted', en: 'contradicted' } },
      { label: { uz: 'contradict', en: 'contradict' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 120,
    p: [
      'To‘g‘ri shartlini tanlang: “Agar namuna kattaroq bo‘lganida, baholash ancha ___ bo‘lardi.”',
      'Choose the correct conditional: “If the sample had been larger, the estimate ___ more precise.”',
    ],
    options: [
      { label: { uz: 'would have been', en: 'would have been' }, correct: true },
      { label: { uz: 'would be', en: 'would be' } },
      { label: { uz: 'will be', en: 'will be' } },
      { label: { uz: 'has been', en: 'has been' } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    p: [
      'To‘g‘ri jumlani tanlang (not / nor kelishuvi):',
      'Choose the correct sentence (not / nor agreement):',
    ],
    options: [
      { label: {
        uz: 'Neither the reviewers nor the editor noticed the missing citation.',
        en: 'Neither the reviewers nor the editor noticed the missing citation.',
      }, correct: true },
      { label: {
        uz: 'Neither the reviewers nor the editor was noticing the missing citation.',
        en: 'Neither the reviewers nor the editor was noticing the missing citation.',
      } },
      { label: {
        uz: 'Neither the reviewers nor the editor have noticed the missing citation.',
        en: 'Neither the reviewers nor the editor have noticed the missing citation.',
      } },
      { label: {
        uz: 'Neither the reviewers or the editor noticed the missing citation.',
        en: 'Neither the reviewers or the editor noticed the missing citation.',
      } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    p: [
      'Erkin qoldirilgan qat’sh (dangling participle) bo‘lmasligi uchun eng yaxshi variantni tanlang:',
      'Choose the best option to avoid a dangling participle:',
    ],
    options: [
      { label: {
        uz: 'Reviewing the draft, the editor noticed three inconsistencies.',
        en: 'Reviewing the draft, the editor noticed three inconsistencies.',
      }, correct: true },
      { label: {
        uz: 'The draft being reviewed, three inconsistencies were noticed.',
        en: 'The draft being reviewed, three inconsistencies were noticed.',
      } },
      { label: {
        uz: 'While being reviewed, the editor noticed three inconsistencies.',
        en: 'While being reviewed, the editor noticed three inconsistencies.',
      } },
      { label: {
        uz: 'Reviewed the draft, the editor noticed three inconsistencies.',
        en: 'Reviewed the draft, the editor noticed three inconsistencies.',
      } },
    ],
  },
  {
    skill: 'academic-grammar',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 180,
    p: [
      'Rasmiy akademik uslub uchun eng mos so‘zni tanlang:',
      'Choose the best word for a formal academic register:',
    ],
    options: [
      { label: {
        uz: 'The results demonstrated a statistically significant effect.',
        en: 'The results demonstrated a statistically significant effect.',
      }, correct: true },
      { label: {
        uz: 'The results were really super significant.',
        en: 'The results were really super significant.',
      } },
      { label: {
        uz: 'The results, you know, showed a big effect.',
        en: 'The results, you know, showed a big effect.',
      } },
      { label: {
        uz: 'The results were a huge effect, honestly.',
        en: 'The results were a huge effect, honestly.',
      } },
    ],
  },

  // ── academic-vocabulary ──────────────────────────────────────────────────
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      'Eng mos so‘zni tanlang: Tadqiqotchilar ikki o‘zgaruvchi o‘rtasida ___ bog‘lanishni aniqladilar.',
      'Choose the best word: The researchers ___ a correlation between the two variables.',
    ],
    options: [
      { label: { uz: 'identified', en: 'identified' }, correct: true },
      { label: { uz: 'identifieded', en: 'identifieded' } },
      { label: { uz: 'identify', en: 'identify' } },
      { label: { uz: 'identifies', en: 'identifies' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 45,
    p: [
      '“Precise” ga yaqin so‘zni tanlang: O‘lchov juda ___ bo‘ldi, chegarasi faqat 0.01%.',
      'Choose the word closest to “precise”: The measurement was extremely ___, with only a 0.01% margin.',
    ],
    options: [
      { label: { uz: 'exact', en: 'exact' }, correct: true },
      { label: { uz: 'expensive', en: 'expensive' } },
      { label: { uz: 'extreme', en: 'extreme' } },
      { label: { uz: 'excellent', en: 'excellent' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      'Eng mos so‘zni tanlang: “consequently” qaysi so‘zga eng yaqin:',
      'Choose the best word: “consequently” most nearly means:',
    ],
    options: [
      { label: { uz: 'natijada', en: 'therefore' }, correct: true },
      { label: { uz: 'baxtli ravishda', en: 'fortunately' } },
      { label: { uz: 'taxminan', en: 'approximately' } },
      { label: { uz: 'qarshi ravishda', en: 'on the contrary' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 60,
    p: [
      'Eng mos so‘zni tanlang: Siyosat uzilishlarni kamaytirish uchun ___ bosqichlarda joriy etildi.',
      'Choose the best word: The policy was implemented in ___ stages to reduce disruption.',
    ],
    options: [
      { label: { uz: 'successive', en: 'successive' }, correct: true },
      { label: { uz: 'success', en: 'success' } },
      { label: { uz: 'successive are', en: 'successive are' } },
      { label: { uz: 'successful', en: 'successful' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      '“To refute” ga yaqin so‘zni tanlang: Mualliflar oldingi da’voni ___ muvaffaqiyatsiz bo‘ldi.',
      'Choose the word closest to “to refute”: The authors were unable to ___ the earlier claim.',
    ],
    options: [
      { label: { uz: 'disprove', en: 'disprove' }, correct: true },
      { label: { uz: 'refuse', en: 'refuse' } },
      { label: { uz: 'remove', en: 'remove' } },
      { label: { uz: 'reduce', en: 'reduce' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 75,
    p: [
      'Eng mos so‘zni tanlang: “a substantial decline” qaysi ifodaga eng yaqin:',
      'Choose the best word: “a substantial decline” most nearly means:',
    ],
    options: [
      { label: { uz: 'sezilarli pasayish', en: 'a noticeable decrease' }, correct: true },
      { label: { uz: 'kichik pasayish', en: 'a slight decrease' } },
      { label: { uz: 'vaqtincha pasayish', en: 'a temporary decrease' } },
      { label: { uz: 'mavjud pasayish', en: 'an existing decrease' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      'Eng mos so‘zni tanlang: Dalil ___; u hech bir tomonni qo‘llab-quvvatlamaydi.',
      'Choose the best word: The evidence is ___; it does not support either side.',
    ],
    options: [
      { label: { uz: 'equivocal', en: 'equivocal' }, correct: true },
      { label: { uz: 'enormous', en: 'enormous' } },
      { label: { uz: 'evident', en: 'evident' } },
      { label: { uz: 'external', en: 'external' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 90,
    p: [
      'Eng mos so‘zni tanlang: Mualliflar o’n besh turdagi matnning ___ tuzilmasini yaratdilar.',
      'Choose the best word: The authors ___ a taxonomy of fifteen discourse types.',
    ],
    options: [
      { label: { uz: 'propose', en: 'propose' }, correct: true },
      { label: { uz: 'purposed', en: 'purposed' } },
      { label: { uz: 'purposes', en: 'purposes' } },
      { label: { uz: 'proposing', en: 'proposing' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    p: [
      'Eng mos so‘zni tanlang: Model 2010-yildan beri kuzatilgan uzoq muddatli tendensiyani ___ qilmaydi.',
      'Choose the best word: The model does not ___ the long-term trend observed since 2010.',
    ],
    options: [
      { label: { uz: 'account for', en: 'account for' }, correct: true },
      { label: { uz: 'apply for', en: 'apply for' } },
      { label: { uz: 'approve of', en: 'approve of' } },
      { label: { uz: 'allow for', en: 'allow for' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    p: [
      'Eng mos so‘zni tanlang: “corroborate” qaysi so‘zga eng yaqin:',
      'Choose the best word: “corroborate” most nearly means:',
    ],
    options: [
      { label: { uz: 'tasdiqlash', en: 'to confirm with supporting evidence' }, correct: true },
      { label: { uz: 'bekor qilish', en: 'to cancel' } },
      { label: { uz: 'muddatini uzaytirish', en: 'to postpone' } },
      { label: { uz: 'taqqoslash', en: 'to compare' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    p: [
      'Eng mos so‘zni tanlang: Namuna hajmi statistik jihatdan ___ natijalar olish uchun juda kichik bo‘ldi.',
      'Choose the best word: The sample size was too small to yield statistically ___ results.',
    ],
    options: [
      { label: { uz: 'significant', en: 'significant' }, correct: true },
      { label: { uz: 'insignificant', en: 'insignificant' } },
      { label: { uz: 'significant are', en: 'significant are' } },
      { label: { uz: 'signify', en: 'signify' } },
    ],
  },
  {
    skill: 'academic-vocabulary',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 180,
    p: [
      'Eng mos so‘zni tanlang: “mitigate” qaysi so‘zga eng yaqin:',
      'Choose the best word: “mitigate” most nearly means:',
    ],
    options: [
      { label: { uz: 'kamaytirish (zararni)', en: 'to reduce the severity of' }, correct: true },
      { label: { uz: 'yo‘qotish', en: 'to eliminate entirely' } },
      { label: { uz: 'ko‘paytirish', en: 'to increase' } },
      { label: { uz: 'o‘lchash', en: 'to measure' } },
    ],
  },

  // ── academic-reading-style ───────────────────────────────────────────────
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    passage: [
      'Many readers assume that neutral tone means an absence of opinion. In academic writing this is a common misreading.',
      'Many readers assume that a neutral tone means an absence of opinion. In academic writing this is a common misreading.',
    ],
    p: [
      'Muallifga ko‘ra, noto‘g‘ri tushunish qaysi?',
      'According to the author, which misreading is common?',
    ],
    options: [
      { label: { uz: 'Noto‘g‘ri ton fikr yo‘qligini bildiradi', en: 'That a neutral tone means no opinion' }, correct: true },
      { label: { uz: 'Noto‘g‘ri ton obyektivlikni bildiradi', en: 'That a neutral tone means objectivity' } },
      { label: { uz: 'Noto‘g‘ri ton ilmiylikni bildiradi', en: 'That a neutral tone means academicity' } },
      { label: { uz: 'Noto‘g‘ri ton qisqaligini bildiradi', en: 'That a neutral tone means brevity' } },
    ],
  },
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    passage: [
      'Passiv tovuz uslub kamchiligi emas. U mas’uliyatni belgilash va o‘quvchini dalilga yo‘naltirish vositasi.',
      'The passive voice is not a stylistic flaw. It is a tool for assigning responsibility and for keeping the reader focused on the evidence.',
    ],
    p: [
      'Muallif passiv tilga qanday munosabatda?',
      'What is the author’s stance on the passive voice?',
    ],
    options: [
      { label: { uz: 'Uni vosita deb qaraydi', en: 'Regards it as a purposeful tool' }, correct: true },
      { label: { uz: 'Uni har doim xato deb qaraydi', en: 'Regards it as always wrong' } },
      { label: { uz: 'Uni butunlay keraksiz deb qaraydi', en: 'Regards it as entirely unnecessary' } },
      { label: { uz: 'Uni muhokama qilmaydi', en: 'Does not discuss it' } },
    ],
  },
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    passage: [
      'To‘g‘ri joylashgan o‘tish so‘zi gaplarni shunchaki bog‘lamaydi; u o‘quvchiga keyingi gap qaysi da’voni xizmat qilishini bildiradi.',
      'A well-placed transition does not merely connect sentences; it signals which claim the next sentence serves.',
    ],
    p: [
      'Bog‘lanish so‘zining asosiy vazifasi nima?',
      'What is the main function of a transition?',
    ],
    options: [
      { label: { uz: 'Keyingi teza funksiyasini ko‘rsatish', en: 'To signal the function of the next claim' }, correct: true },
      { label: { uz: 'Jumlani uzaytirish', en: 'To lengthen the sentence' } },
      { label: { uz: 'Soniylikni oshirish', en: 'To increase the word count' } },
      { label: { uz: 'O‘qish tezligini oshirish', en: 'To increase reading speed' } },
    ],
  },
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    passage: [
      'Writers are often told to "be clear". Clarity, however, requires a decision about what to leave out.',
      'Writers are often told to “be clear”. Clarity, however, requires deciding what to leave out.',
    ],
    p: [
      'Muallifning urg‘usi nimada?',
      'What is the author’s emphasis on?',
    ],
    options: [
      { label: { uz: 'Aniqlik nima bilan chiqarilishi kerak', en: 'That clarity requires omission' }, correct: true },
      { label: { uz: 'Qisqalik har doim yaxshi', en: 'That brevity is always good' } },
      { label: { uz: 'Murakkab til kerak', en: 'That complex wording is needed' } },
      { label: { uz: 'Tuzatish kerak emas', en: 'That no editing is needed' } },
    ],
  },
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    passage: [
      '“Korrelyatsiya sabab emas” degan da’vo o‘z-o‘zidan o‘tinchi darajada to‘g‘ri va amalda foydasiz. U faqat usul bilan birga foydali bo‘ladi.',
      'The claim that “correlation is not causation” is trivially true and practically useless alone. It becomes useful only when paired with a method.',
    ],
    p: [
      'Muallifning fikriga ko‘ra, bu tamoyil qachon foydali?',
      'According to the author, when is this principle useful?',
    ],
    options: [
      { label: { uz: 'Metod bilan birga qo‘llanganda', en: 'When used together with a method' }, correct: true },
      { label: { uz: 'Yolg‘iz qo‘llanganda', en: 'When used on its own' } },
      { label: { uz: 'Statistika ishlatilganda', en: 'When statistics are used' } },
      { label: { uz: 'Muhokamada', en: 'In discussion' } },
    ],
  },
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    passage: [
      'Tarixiylar bir vaqtlar rasmiy hujjatlarni bo‘lgan voqealarning shaffof yozuvlari deb qaragan. Arxiv tadqiqotlari bu taxminni murakkablashtirdi.',
      'Historians once treated official documents as transparent records of events. Archival work has since complicated that assumption.',
    ],
    p: [
      'Qaysi xulosa matnga mos?',
      'Which conclusion matches the text?',
    ],
    options: [
      { label: { uz: 'Qarash o‘zgargan, xulosalar ham chuqurlashtirilgan', en: 'The view changed and interpretations deepened' }, correct: true },
      { label: { uz: 'Qarash o‘zgarmagan', en: 'The view stayed the same' } },
      { label: { uz: 'Arxivlar yo‘qolgan', en: 'The archives were lost' } },
      { label: { uz: 'Tarix fanidan voz kechirilgan', en: 'The field was abandoned' } },
    ],
  },
  {
    skill: 'academic-reading-style',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 180,
    passage: [
      'Mualliflikka asoslangan dalil zaif bo‘ladi faqat shunda, agar usha muallif mavzuga aloqasi bo‘lmasa. Agar muallif bevosita soha mutaxassisi bo‘lsa, uni rad etish o‘zi ham xato.',
      'Argument from authority is weak only when the authority is irrelevant. When the authority is directly competent, dismissing it is itself an error.',
    ],
    p: [
      'Muallif nima bilan kelishadi?',
      'What does the author agree with?',
    ],
    options: [
      { label: { uz: 'Mutaxassislik darajasi muhim', en: 'That the degree of expertise matters' }, correct: true },
      { label: { uz: 'Har qanday xulosaga ishonish kerak', en: 'That every conclusion must be trusted' } },
      { label: { uz: 'Manbalar umuman kerak emas', en: 'That sources are never needed' } },
      { label: { uz: 'Logika har doim ustun', en: 'That logic always wins' } },
    ],
  },
];