import type { UniversityItem } from "./universities";

export interface GradeOption {
  id: string;
  label: string;
  numericGrade: number;
  yearsUntilApply: string;
  stageBadge: string;
  shortDesc: string;
  spokenRoadmap: string;
}

export const GRADE_OPTIONS: GradeOption[] = [
  {
    id: "5-sinf",
    label: "5-sinf",
    numericGrade: 5,
    yearsUntilApply: "6 yil vaqt bor",
    stageBadge: "Eng zo'r vaqt",
    shortDesc: "Ingliz tiliga o'rganish, qiziqarli matematika va kitob o'qish odati.",
    spokenRoadmap:
      "Siz hozir beshinchi sinfdasiz — to'g'risini aytsam, juda erta va zo'r paytda boshlayapsiz! Oldingizda olti yil bor. Hozir o'zingizni qiynamasdan, har kuni inglizcha multfilm va videolar ko'rib tilni odat qiling, mantiqiy misollar ishlang va qiziqqan narsalaringizni yasab ko'ring.",
  },
  {
    id: "6-sinf",
    label: "6-sinf",
    numericGrade: 6,
    yearsUntilApply: "5 yil vaqt bor",
    stageBadge: "Erta start",
    shortDesc: "Asosiy fanlarni yaxshi o'qish, ingliz tili B1 va foydali to'garaklar.",
    spokenRoadmap:
      "Oltinchi sinfda oldingizda besh yil vaqt bor, bu juda katta yutuq. Hozir asosiy vazifangiz — ingliz tilida bemalol gaplashadigan darajaga chiqish, maktab darslaridan besh olib yurish va maktabdagi musobaqalarda qatnashib ko'rish.",
  },
  {
    id: "7-sinf",
    label: "7-sinf",
    numericGrade: 7,
    yearsUntilApply: "4 yil vaqt bor",
    stageBadge: "Qiziqishni topish",
    shortDesc: "Ingliz tili B2 ga yaqinlashish, asosiy ikkita fanni chuqurroq o'rganish.",
    spokenRoadmap:
      "Yettinchi sinfdan boshlab to'rt yil bemalol ulguramiz. Shu yili ingliz tilini ancha kuchaytirib oling, o'zingizga yoqqan ikkita asosiy fanni chuqurroq o'rganing va tuman yoki shahar olimpiadalarida o'zingizni sinab ko'ring.",
  },
  {
    id: "8-sinf",
    label: "8-sinf",
    numericGrade: 8,
    yearsUntilApply: "3 yil vaqt bor",
    stageBadge: "Poydevor yili",
    shortDesc: "Pre-IELTS tugatish, maktab baholarini beshga chiqarish va birinchi kichik loyiha.",
    spokenRoadmap:
      "Sakkizinchi sinf — haqiqiy tayyorgarlik boshlanadigan payt. Chunki keyingi yildan, ya'ni to'qqizinchi sinfdan olgan har bitta bahoyingiz chet elga ketadigan hujjatga tushadi. Shuning uchun hozir ingliz tilini kuchaytirib, hamma fandan baholarni beshga tortib oling.",
  },
  {
    id: "9-sinf",
    label: "9-sinf",
    numericGrade: 9,
    yearsUntilApply: "2.5 yil vaqt bor",
    stageBadge: "Baholar hisobga kiradi",
    shortDesc: "9-sinf baholari hujjatga tushadi! IELTS 6.5+ va SAT ga kirish.",
    spokenRoadmap:
      "Diqqat qiling: to'qqizinchi sinf juda muhim, chunki chet el universitetlari aynan to'qqizinchi sinfdan boshlab baholaringizni ko'radi. Shu yili chorak baholarni tushirmang, IELTS ni olti yarim-yetti atrofida yopib oling va sekin SAT testlarini ko'rishni boshlang.",
  },
  {
    id: "10-sinf",
    label: "10-sinf",
    numericGrade: 10,
    yearsUntilApply: "1.5 yil vaqt bor",
    stageBadge: "Eng qizg'in pallasi",
    shortDesc: "IELTS 7.0+, SAT 1480+ olish va o'z amaliy loyihangizni bitirish.",
    spokenRoadmap:
      "O'ninchi sinf — eng hal qiluvchi yil! Sababi, o'n birinchi sinf kuzidayoq hujjat topshirish boshlanadi. Demak, shu yozning oxirigacha qo'lingizda tayyor IELTS va SAT ballari bo'lishi, hamda ko'rsatishga arziydigan bitta zo'r amaliy ishingiz tayyor turishi kerak.",
  },
  {
    id: "11-sinf",
    label: "11-sinf",
    numericGrade: 11,
    yearsUntilApply: "Hozir topshirish yili",
    stageBadge: "Tezkor reja",
    shortDesc: "Imtihonlarni tezda topshirish, insho yozish va grantlarga ariza berish.",
    spokenRoadmap:
      "Siz o'n birinchi sinfdasiz, demak vaqtni umuman cho'zib bo'lmaydi, lekin to'g'ri reja bilan bemalol ulgurasiz! Yaqin ikki-uch oyda бор e'tiborni IELTS va kirish testidan yuqori ball olishga, o'zingiz haqingizda ta'sirli xat yozishga va muddat tugamasdan grantlarga hujjat yuborishga qaratamiz.",
  },
  {
    id: "litsey-bitiruvchi",
    label: "Litsey / Bitiruvchi",
    numericGrade: 12,
    yearsUntilApply: "Tayyor qabul",
    stageBadge: "To'liq fokus",
    shortDesc: "Maktabdan keyingi yil yoki litsey: kuchli imtihon balli va 100% grant.",
    spokenRoadmap:
      "Litsey yoki bitiruvchi bo'lganingizning katta plyusi bor — chalg'iydigan narsalar kam, bor vaqtingizni tayyorgarlikka bera olasiz. Kuniga to'rt-besh soat jiddiy shug'ullanib, kuchli sertifikat va portfolio yig'amiz-da, to'g'ri yuz foizlik grantlarga hujjat topshiramiz.",
  },
];

export type DirectionIconKey =
  | "cpu"
  | "cog"
  | "briefcase"
  | "heartPulse"
  | "scale"
  | "atom"
  | "compass"
  | "bookOpen";

export interface DirectionTrack {
  id: string;
  title: string;
  shortTitle: string;
  iconKey: DirectionIconKey;
  coreSubjects: string[];
  spokenSubjects: string;
  spikeProjectIdea: string;
  careerOutcomes: string;
}

export const DIRECTION_TRACKS: DirectionTrack[] = [
  {
    id: "cs-ai",
    title: "Dasturlash va Sun'iy Intellekt (IT & AI)",
    shortTitle: "IT va Sun'iy Intellekt",
    iconKey: "cpu",
    coreSubjects: ["Matematika", "Informatika", "Mantiq / Fizika"],
    spokenSubjects: "matematika, dasturlash va mantiqiy masalalar",
    spikeProjectIdea:
      "odamlar rostdan ishlatadigan bitta foydali sayt, mobil ilova yoki telegram bot yasab ishga tushirish va dasturlash musobaqalarida qatnashish",
    careerOutcomes: "AI dasturchi, IT muhandis, startap asoschisi",
  },
  {
    id: "engineering",
    title: "Muhandislik, Robototexnika va Energetika",
    shortTitle: "Muhandislik va Texnika",
    iconKey: "cog",
    coreSubjects: ["Matematika", "Fizika", "Texnik loyihalash"],
    spokenSubjects: "matematika va fizika",
    spikeProjectIdea:
      "qo'lda ishlaydigan kichik robot, aqlli qurilma yoki quyosh energiyasiga oid foydali moslama yasab, uni videoga olib ko'rsatish",
    careerOutcomes: "Robototexnik, aerokosmik va energetika muhandisi",
  },
  {
    id: "business-econ",
    title: "Biznes, Moliya va Xalqaro Iqtisod",
    shortTitle: "Biznes va Moliya",
    iconKey: "briefcase",
    coreSubjects: ["Matematika", "Iqtisod", "Ingliz tili"],
    spokenSubjects: "matematika, hisob-kitob va iqtisod asoslari",
    spikeProjectIdea:
      "kichkina bo'lsa ham shaxsiy savdo yoki xizmat loyihasini yuritib ko'rish, yoxud maktabda biznes va moliyaviy savodxonlik klubi ochish",
    careerOutcomes: "Moliya tahlilchisi, xalqaro iqtisodchi, tadbirkor",
  },
  {
    id: "medicine-bio",
    title: "Tibbiyot, Biotexnologiya va Salomatlik",
    shortTitle: "Tibbiyot va Biologiya",
    iconKey: "heartPulse",
    coreSubjects: ["Biologiya", "Kimyo", "Matematika"],
    spokenSubjects: "biologiya va kimyo",
    spikeProjectIdea:
      "klinika yoki laboratoriyada shifokorlar yonida ko'ngilli bo'lib tajriba o'rganish va biologiya-kimyo olimpiadalarida qatnashish",
    careerOutcomes: "Xalqaro shifokor, jarroh, biotexnolog olim",
  },
  {
    id: "law-ir",
    title: "Xalqaro Huquq, Diplomatiya va Siyosat",
    shortTitle: "Huquq va Diplomatiya",
    iconKey: "scale",
    coreSubjects: ["Tarix", "Huquq va mantiq", "Nutq va yozuv"],
    spokenSubjects: "tarix, huquq va fikrni chiroyli tushuntirib berish",
    spikeProjectIdea:
      "debat klubi ochish, xalqaro yoshlar konferensiyalarida qatnashish va dolzarb mavzularda maqolalar yozish",
    careerOutcomes: "Xalqaro yurist, diplomat, elchixona va BMT xodimi",
  },
  {
    id: "natural-sciences",
    title: "Aniq Fanlar: Matematika, Fizika va Kimyo",
    shortTitle: "Matematika, Fizika va Kimyo",
    iconKey: "atom",
    coreSubjects: ["Oliy Matematika", "Fizika", "Kimyo"],
    spokenSubjects: "chuqur matematika, fizika va kimyo",
    spikeProjectIdea:
      "fan olimpiadalarida yuqori o'rin olish yoki biror o'qituvchi bilan kichik ilmiy tajriba qilib maqola chiqarish",
    careerOutcomes: "Tadqiqotchi olim, kvant va fan mutaxassisi",
  },
  {
    id: "architecture-design",
    title: "Arxitektura, Shaharsozlik va Dizayn",
    shortTitle: "Arxitektura va Dizayn",
    iconKey: "compass",
    coreSubjects: ["Chizmachilik va Dizayn", "Matematika", "Ijodiy Portfolio"],
    spokenSubjects: "chizmachilik, geometriya va vizual dizayn",
    spikeProjectIdea:
      "o'n besh-yigirma ta eng chiroyli chizma, bino maketi yoki zamonaviy dizayn ishlaringizdan bitta kuchli portfolio to'plami tayyorlash",
    careerOutcomes: "Arxitektor, shaharsoz, mahsulot va UI/UX dizayner",
  },
  {
    id: "humanities-psych",
    title: "Psixologiya, Ta'lim va Ijtimoiy Fanlar",
    shortTitle: "Psixologiya va Ta'lim",
    iconKey: "bookOpen",
    coreSubjects: ["Ingliz tili", "Biologiya / Psixologiya", "Jamiyatshunoslik"],
    spokenSubjects: "psixologiya, ingliz tili va odamlar bilan ishlash",
    spikeProjectIdea:
      "tengdoshlar va kichik sinflar uchun bepul o'quv yoki motivatsiya to'garagi ochib, yoshlarga amalda yordam berish",
    careerOutcomes: "Psixolog, ta'lim loyihalari rahbari, maslahatchi",
  },
];

export interface AptitudeQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    weights: Partial<Record<string, number>>;
  }>;
}

export const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: "q1",
    question: "Qaysi dars va mashg'ulot sizga ko'proq yoqadi?",
    options: [
      {
        id: "math-code",
        label: "Matematika, kompyuter va kod yozish",
        weights: { "cs-ai": 4, "natural-sciences": 2, engineering: 2 },
      },
      {
        id: "physics-build",
        label: "Fizika, texnika va narsalar yasash",
        weights: { engineering: 4, "natural-sciences": 3, "cs-ai": 1 },
      },
      {
        id: "bio-chem",
        label: "Biologiya, kimyo va tibbiyot",
        weights: { "medicine-bio": 4, "natural-sciences": 2, "humanities-psych": 1 },
      },
      {
        id: "econ-lead",
        label: "Biznes, pul hisob-kitobi va boshqaruv",
        weights: { "business-econ": 4, "law-ir": 2 },
      },
      {
        id: "history-debate",
        label: "Tarix, huquq, chet tillari va bahs-munozara",
        weights: { "law-ir": 4, "humanities-psych": 3 },
      },
      {
        id: "art-space",
        label: "Chizmachilik, binolar va dizayn",
        weights: { "architecture-design": 4, engineering: 1 },
      },
    ],
  },
  {
    id: "q2",
    question: "Kelajakda o'zingizni qaysi ishda ko'rasiz?",
    options: [
      {
        id: "ai-future",
        label: "Kuchli dasturlar va sun'iy intellekt yaratishda",
        weights: { "cs-ai": 4, engineering: 1 },
      },
      {
        id: "clean-tech",
        label: "Yangi texnologiya, mashina, robot yoki zavodlar qurishda",
        weights: { engineering: 4, "natural-sciences": 2 },
      },
      {
        id: "health-cure",
        label: "Odamlarni davolash va yangi dorilar topishda",
        weights: { "medicine-bio": 4, "natural-sciences": 1 },
      },
      {
        id: "global-market",
        label: "Katta kompaniya ochish, bank va moliya sohasida",
        weights: { "business-econ": 4, "cs-ai": 1 },
      },
      {
        id: "justice-policy",
        label: "Xalqaro tashkilotlar, elchixona yoki huquq sohasida",
        weights: { "law-ir": 4, "humanities-psych": 3 },
      },
      {
        id: "smart-cities",
        label: "Chiroyli shaharlar, binolar va dizayn loyihalashda",
        weights: { "architecture-design": 4, engineering: 1 },
      },
    ],
  },
  {
    id: "q3",
    question: "Qanday ishlash uslubi sizga qulay?",
    options: [
      {
        id: "coding-logic",
        label: "Kompyuter oldida qiyin masalalarga yechim topish",
        weights: { "cs-ai": 3, "natural-sciences": 2, "business-econ": 1 },
      },
      {
        id: "lab-research",
        label: "Tajriba o'tkazish va chuqur o'rganish",
        weights: { "medicine-bio": 3, "natural-sciences": 3, engineering: 2 },
      },
      {
        id: "team-negotiate",
        label: "Odamlar bilan muloqot qilish va jamoani boshqarish",
        weights: { "business-econ": 3, "law-ir": 3, "humanities-psych": 3 },
      },
      {
        id: "visual-create",
        label: "Yangi g'oyalarni chizish va maketini yasash",
        weights: { "architecture-design": 4, engineering: 2 },
      },
    ],
  },
];

export function rankDirectionsByAnswers(
  answers: Record<string, string>,
): Array<{ track: DirectionTrack; score: number; matchPercent: number }> {
  const scores = new Map<string, number>();
  for (const track of DIRECTION_TRACKS) {
    scores.set(track.id, 0);
  }

  for (const q of APTITUDE_QUESTIONS) {
    const chosenId = answers[q.id];
    if (!chosenId) continue;
    const opt = q.options.find((o) => o.id === chosenId);
    if (!opt) continue;
    for (const [trackId, weight] of Object.entries(opt.weights)) {
      scores.set(trackId, (scores.get(trackId) ?? 0) + (weight ?? 0));
    }
  }

  const maxPossible = 11;
  return [...DIRECTION_TRACKS]
    .map((track) => {
      const score = scores.get(track.id) ?? 0;
      const matchPercent = Math.min(99, Math.max(55, Math.round(58 + (score / maxPossible) * 41)));
      return { track, score, matchPercent };
    })
    .sort((a, b) => b.score - a.score);
}

export interface CountryAdmissionProfile {
  portalSpoken: string;
  languageSpoken: string;
  examsSpoken: string;
  pathwaySpoken: string;
  scholarshipSpoken: string;
  deadlineSpoken: string;
  minIelts: string;
  examBadge: string;
  grantBadge: string;
}

const DEFAULT_COUNTRY_PROFILE: CountryAdmissionProfile = {
  portalSpoken: "universitetning o'z saytidan onlayn hujjat topshirasiz",
  languageSpoken: "IELTS dan kamida yetti ball yoki TOEFL dan yuz ball atrofida olish kerak",
  examsSpoken: "SAT testidan ming to'rt yuz ellikdan balandroq ball yig'ish juda katta yordam beradi",
  pathwaySpoken: "o'n birinchi sinf shahodatnomasi va yaxshi baholar bilan topshirsa bo'ladi",
  scholarshipSpoken: "universitetning o'z grantlari va O'zbekistondagi El-yurt umidi jamg'armasi orqali to'liq tekinga o'qisa bo'ladi",
  deadlineSpoken: "noyabrdan fevralgacha hujjat qabul qilinadi",
  minIelts: "IELTS 6.5 - 7.0",
  examBadge: "SAT 1450+ / GPA",
  grantBadge: "100% gacha Grant",
};

export const COUNTRY_ADMISSION_PROFILES: Record<string, CountryAdmissionProfile> = {
  AQSH: {
    portalSpoken: "Common App degan bitta qulay sayt orqali bir vaqtda bir nechta universitetga hujjat yuborasiz",
    languageSpoken: "IELTS dan yetti yoki yetti yarim, yoxud TOEFL dan yuz o'n ball atrofida olish kerak",
    examsSpoken: "SAT imtihonidan ming besh yuz ball atrofida yig'sangiz eshiklar katta ochiladi",
    pathwaySpoken: "maktabni bitirib, o'n bir yillik shahodatnoma bilan to'g'ri birinchi kursga kirasiz",
    scholarshipSpoken: "Amerikaning zo'r tomoni — oilangiz daromadiga qarab o'qish, yotoqxona va hatto ovqat puligacha yuz foiz qoplab beradigan Need-blind grantlari bor, yana El-yurt umidi jamg'armasi ham bor",
    deadlineSpoken: "erta topshirish birinchi noyabrda, asosiy qabul esa birinchi yanvarda tugaydi",
    minIelts: "IELTS 7.0 - 7.5",
    examBadge: "SAT 1480 - 1550+",
    grantBadge: "Full-Need Grant",
  },
  "Buyuk Britaniya": {
    portalSpoken: "UCAS degan markaziy sayt orqali bittada beshtagacha universitetni tanlab topshirasiz",
    languageSpoken: "IELTS dan yetti yoki yetti yarim ball kerak bo'ladi",
    examsSpoken: "tanlagan sohangizga qarab matematika, tibbiyot yoki huquqdan ichki test bo'ladi, Oksford va Kembrijda esa ustozlar bilan jonli suhbat ham bor",
    pathwaySpoken: "bizning o'n bir yillik maktabdan keyin ko'pincha bir yillik Foundation tayyorlov kursida o'qiladi yoki A-Level va IB diplomi bo'lsa to'g'ri birinchi kursga kiriladi",
    scholarshipSpoken: "El-yurt umidi davlat granti hamda universitetlarning iqtidorli yoshlar uchun maxsus chegirma va stipendiyalari bor",
    deadlineSpoken: "Oksford va Kembrij uchun o'n beshinchi oktyabrgacha, qolganlariga yanvar oxirigacha topshiriladi",
    minIelts: "IELTS 7.0 - 7.5",
    examBadge: "A-Level / Foundation",
    grantBadge: "El-Yurt Umidi & Merit",
  },
  Germaniya: {
    portalSpoken: "Uni-Assist portali yoki universitetning o'z sayti orqali hujjat topshirasiz",
    languageSpoken: "inglizcha guruhlarga IELTS olti yarim-yetti ball, nemischa guruhlarga esa nemis tilidan B ikki yoki C bir daraja kerak",
    examsSpoken: "chet ellik o'quvchilar uchun TestAS degan mantiqiy-akademik testni topshirib qo'ysangiz, kirish imkoniyatingiz keskin oshadi",
    pathwaySpoken: "o'n birinchi sinfdan keyin Germaniyada bir yil Studienkolleg degan tayyorlov kursida o'qib, keyin asosiy o'qishga kirasiz",
    scholarshipSpoken: "eng zo'r yangilik — Germaniya davlat universitetlarida o'qishning o'zi deyarli tekin! Ustiga DAAD stipendiyasini yutsangiz yashash pulingiz ham chiqadi",
    deadlineSpoken: "kuzgi o'qishga maydan o'n beshinchi iyulgacha hujjat ketadi",
    minIelts: "IELTS 6.5 / TestDaF",
    examBadge: "Studienkolleg / TestAS",
    grantBadge: "Tekin O'qish + DAAD",
  },
  Shveytsariya: {
    portalSpoken: "to'g'ridan-to'g'ri universitet saytidan hujjat topshirasiz",
    languageSpoken: "IELTS yetti ball bilan birga nemis yoki fransuz tilini ham yaxshi bilish talab qilinadi",
    examsSpoken: "matematika va fizikadan kuchli kirish imtihoni yoki xalqaro IB diplomi so'raladi",
    pathwaySpoken: "maktab baholari juda a'lo bo'lishi va kuchli matematika tayyorgarligi kerak",
    scholarshipSpoken: "bu yerda davlat universitetlarida kontrakt narxi Yevropa va Amerikaga qaraganda ancha arzon, yana El-yurt umidi granti bilan ketsangiz ham bo'ladi",
    deadlineSpoken: "dekabrdan aprelgacha hujjat olinadi",
    minIelts: "IELTS 7.0 + C1",
    examBadge: "Math Exam / IB",
    grantBadge: "Past Kontrakt",
  },
  Singapur: {
    portalSpoken: "universitetning xalqaro abituriyentlar saytidan topshirasiz",
    languageSpoken: "IELTS dan kamida yetti ball kerak",
    examsSpoken: "SAT dan ming besh yuz atrofida ball va AP fanlari yoki xalqaro olimpiada medali juda katta ustunlik beradi",
    pathwaySpoken: "maktab shahodatnomasi va kuchli xalqaro test natijalari bilan to'g'ri birinchi kursga qabul qiladi",
    scholarshipSpoken: "Singapurda fan va texnologiya bo'yicha o'qish va yashash pulini to'liq ko'taradigan juda zo'r grantlar bor",
    deadlineSpoken: "yanvardan mart boshigacha davom etadi",
    minIelts: "IELTS 7.0",
    examBadge: "SAT 1500+ / AP",
    grantBadge: "ASEAN / S&T Grant",
  },
  Gonkong: {
    portalSpoken: "xalqaro talabalar uchun Non-JUPAS portali orqali topshirasiz",
    languageSpoken: "IELTS olti yarim yoki yetti ball yetarli",
    examsSpoken: "SAT ming to'rt yuz sakson plyus yoki maktabdan juda a'lo baholar va olimpiada natijalari kerak",
    pathwaySpoken: "o'n bir yillik shahodatnoma bilan to'g'ri to'rt yillik bakalavrga kirasiz",
    scholarshipSpoken: "O'zbekistonlik yoshlar uchun Belt and Road degan yuz foizlik grant bor — o'qish ham, yotoqxona ham tekin bo'ladi",
    deadlineSpoken: "erta qabul noyabrda, asosiy qabul yanvarda yakunlanadi",
    minIelts: "IELTS 6.5 - 7.0",
    examBadge: "SAT 1480+ / GPA",
    grantBadge: "Belt & Road 100%",
  },
  Xitoy: {
    portalSpoken: "CSC davlat grant sayti va universitet portali orqali yuborasiz",
    languageSpoken: "inglizcha o'qishga IELTS olti yarim, xitoycha o'qishga HSK to'rt yoki besh kerak",
    examsSpoken: "matematika testi va onlayn suhbat bo'ladi",
    pathwaySpoken: "maktab shahodatnomasi bilan to'g'ri birinchi kursga yoki bir yil til kursiga kirasiz",
    scholarshipSpoken: "Xitoy hukumati CSC granti o'qishni, yotoqxonani tekin qiladi va har oy qo'lingizga stipendiya ham beradi",
    deadlineSpoken: "dekabrdan mart oyigacha topshiriladi",
    minIelts: "IELTS 6.5 / HSK 4-5",
    examBadge: "CSCA / Suhbat",
    grantBadge: "CSC To'liq Grant",
  },
  "Janubiy Koreya": {
    portalSpoken: "universitet sayti yoki GKS grant dasturi orqali hujjat topshirasiz",
    languageSpoken: "IELTS olti yarim-yetti ball, agar ustiga koreys tilidan TOPIK ham bo'lsa imkoniyatingiz ikki barobar oshadi",
    examsSpoken: "KAIST kabi texnika universitetlarida matematika bilimiga va suhbatga qattiq qarashadi",
    pathwaySpoken: "o'n birinchi sinf shahodatnomasi bilan to'g'ri bakalavrga qabul qiladi",
    scholarshipSpoken: "mashhur GKS granti bor — samolyot chiptangizgacha olib beradi, o'qish tekin va har oy stipendiya olasiz. KAIST da esa kirgan hamma chet ellik talaba deyarli tekin o'qiydi!",
    deadlineSpoken: "kuzgi o'qishga fevral-martda, bahorgisiga sentyabrda topshiriladi",
    minIelts: "IELTS 6.5 / TOPIK",
    examBadge: "GPA + Math / SAT",
    grantBadge: "GKS & KAIST 100%",
  },
  Yaponiya: {
    portalSpoken: "MEXT dasturi yoki universitetning ingliz tilidagi G-o'ttiz guruhlari orqali topshirasiz",
    languageSpoken: "inglizcha yo'nalishga IELTS yetti, yaponcha yo'nalishga JLPT N ikki daraja kerak",
    examsSpoken: "ingliz dasturlariga SAT, yapon dasturlariga esa elchixonada kirish testlari bo'ladi",
    pathwaySpoken: "MEXT granti orqali yoki xalqaro testlar bilan kirish mumkin",
    scholarshipSpoken: "Yaponiyaning MEXT granti eng zo'r grantlardan biri — bilet, kontrakt va oylik yashash puli to'liq beriladi",
    deadlineSpoken: "elchixona orqali may-iyunda, universitet orqali noyabr-yanvarda bo'ladi",
    minIelts: "IELTS 6.5 - 7.0",
    examBadge: "MEXT / SAT / EJU",
    grantBadge: "MEXT 100% Grant",
  },
  Kanada: {
    portalSpoken: "universitet sayti orqali onlayn topshirasiz",
    languageSpoken: "IELTS olti yarim yoki yetti ball so'raladi",
    examsSpoken: "asosan maktab baholaringizga qaraladi, SAT bo'lsa yana ham plyus bo'ladi",
    pathwaySpoken: "o'n bir yillik maktab shahodatnomasi bilan to'g'ri birinchi kursga kirasiz",
    scholarshipSpoken: "Toronto universitetida Lester Pirson degan yuz foizlik grant bor, boshqa universitetlarda ham katta chegirma grantlar beriladi",
    deadlineSpoken: "noyabrdan yanvar o'rtasigacha davom etadi",
    minIelts: "IELTS 6.5 - 7.0",
    examBadge: "Yuqori GPA / SAT",
    grantBadge: "Pearson & Merit",
  },
  Avstraliya: {
    portalSpoken: "universitetning xalqaro qabul saytidan yuborasiz",
    languageSpoken: "IELTS olti yarim yoki yetti ball kerak",
    examsSpoken: "Foundation baholari yoki SAT natijasi bilan kiriladi",
    pathwaySpoken: "ko'pincha bir yillik Foundation kursi yoki yuqori SAT bilan birinchi kursga kiriladi",
    scholarshipSpoken: "universitetlarning xalqaro chegirma grantlari hamda El-yurt umidi to'liq stipendiyasi mavjud",
    deadlineSpoken: "yiliga ikki marta — fevral va iyul semestrlariga qabul bor",
    minIelts: "IELTS 6.5 - 7.0",
    examBadge: "Foundation / SAT",
    grantBadge: "Merit & El-Yurt",
  },
  Niderlandiya: {
    portalSpoken: "Studielink degan yagona sayt orqali ro'yxatdan o'tasiz",
    languageSpoken: "IELTS olti yarim yoki yetti ball yetarli",
    examsSpoken: "texnika yo'nalishlarida onlayn matematika va mantiq saralash testi bo'ladi",
    pathwaySpoken: "bir yillik Foundation yoki xalqaro diplom bilan kirasiz",
    scholarshipSpoken: "NL Scholarship va universitet grantlari mavjud",
    deadlineSpoken: "mashhur yo'nalishlarga o'n beshinchi yanvargacha, qolganiga birinchi aprelgacha",
    minIelts: "IELTS 6.5 - 7.0",
    examBadge: "Numerus Fixus",
    grantBadge: "NL Scholarship",
  },
  Italiya: {
    portalSpoken: "Universitaly sayti va universitet portali orqali topshirasiz",
    languageSpoken: "ingliz tilidagi guruhlarga IELTS olti yoki olti yarim ball ham o'tadi",
    examsSpoken: "muhandislik va iqtisodga TOLC testi yoki SAT, tibbiyotga esa IMAT testi topshiriladi",
    pathwaySpoken: "Italiyada o'n ikki yil o'qish sharti bor, shuning uchun litsey diplomi yoki bir yillik Foundation kerak bo'ladi",
    scholarshipSpoken: "Italiyaning DSU granti juda mashhur — o'qish tekin bo'ladi va yiliga yetti ming yevrogacha stipendiya berishadi!",
    deadlineSpoken: "fevraldan may oyigacha topshiriladi",
    minIelts: "IELTS 6.0 - 6.5",
    examBadge: "TOLC / SAT / IMAT",
    grantBadge: "DSU + €7000 Grant",
  },
  "Saudiya Arabistoni": {
    portalSpoken: "universitet saytidan onlayn topshirasiz",
    languageSpoken: "IELTS olti yarim ball yetarli",
    examsSpoken: "KFUPM kabi kuchli oliygohlarga SAT dan ming to'rt yuz sakson-ming besh yuz ball olsa, eshik katta ochiladi",
    pathwaySpoken: "maktabni bitirib to'g'ri birinchi kursga ingliz tilidagi guruhga kirasiz",
    scholarshipSpoken: "bu yerda qabul qilingan talabaga deyarli hamma narsa tekin: o'qish, yotoqxona, oylik stipendiya va hatto har yilgi samolyot chiptasi ham beriladi!",
    deadlineSpoken: "yanvar-fevral va may-iyun oylarida qabul ochiladi",
    minIelts: "IELTS 6.0 - 6.5",
    examBadge: "SAT 1450 - 1500+",
    grantBadge: "100% To'liq Grant",
  },
  BAA: {
    portalSpoken: "universitet saytidan bevosita hujjat yuborasiz",
    languageSpoken: "IELTS olti yarim ball kerak",
    examsSpoken: "SAT matematika bali va qisqa onlayn suhbat bo'ladi",
    pathwaySpoken: "o'n bir yillik shahodatnoma bilan to'g'ri kirasiz",
    scholarshipSpoken: "Khalifa University kabi joylarda yuz foizlik to'liq grantlar bor",
    deadlineSpoken: "yanvardan aprelgacha davom etadi",
    minIelts: "IELTS 6.5",
    examBadge: "SAT + GPA",
    grantBadge: "100% gacha Grant",
  },
  Qatar: {
    portalSpoken: "Qatar University saytidan onlayn hujjat yuborasiz",
    languageSpoken: "IELTS olti yoki olti yarim ball kerak",
    examsSpoken: "SAT matematika qismi va yuqori maktab baholari so'raladi",
    pathwaySpoken: "maktab shahodatnomasi bilan to'g'ri birinchi kursga qabul qilinadi",
    scholarshipSpoken: "xalqaro grant yutsangiz o'qish, yotoqxona va har oylik stipendiya to'liq beriladi",
    deadlineSpoken: "fevral-mart oylarida qabul bo'ladi",
    minIelts: "IELTS 6.0 - 6.5",
    examBadge: "SAT Math + GPA",
    grantBadge: "To'liq Stipendiya",
  },
};

export function getCountryProfile(country: string): CountryAdmissionProfile {
  return COUNTRY_ADMISSION_PROFILES[country] ?? DEFAULT_COUNTRY_PROFILE;
}

export type PillarIconKey =
  | "graduation"
  | "globe"
  | "target"
  | "sparkles"
  | "users"
  | "feather"
  | "award";

export interface LessonModuleItem {
  index: number;
  id: string;
  iconKey: PillarIconKey;
  accentFrom: string;
  accentTo: string;
  spokenScript: string;
}

export function buildPersonalizedLessonModules(params: {
  university: UniversityItem;
  grade: GradeOption;
  direction: DirectionTrack;
  studentName?: string;
}): LessonModuleItem[] {
  const { university, grade, direction, studentName } = params;
  const profile = getCountryProfile(university.country);
  const firstName = studentName?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName ? `Salom, ${firstName}!` : "Salom, do'stim!";

  return [
    {
      index: 0,
      id: "pillar-academic",
      iconKey: "graduation",
      accentFrom: "rgba(56, 189, 248, 0.45)",
      accentTo: "rgba(99, 102, 241, 0.35)",
      spokenScript: `${greeting} Zo'r tanlov qildingiz — ${university.name} dunyoda ${university.rank}-o'rinda turadi! Keling, hozir qiyin va quruq gaplarsiz, ${direction.shortTitle} sohasiga qanday kirishni oddiy tilda gaplashib olamiz. Biror joyda savol tug'ilsa tortinmang, klaviaturadagi probel tugmasini bosib turib xuddi men bilan yuzma-yuz gaplashgandek so'rayvering, darhol to'xtab javob beraman! Demak, eng birinchi narsa — maktabdagi baholaringiz. Bu universitetga ${profile.portalSpoken}, va kirish tartibi bo'yicha ${profile.pathwaySpoken}. Sizning sohangizda eng kerakli darslar — ${direction.spokenSubjects}. Shuning uchun bugundan boshlab maktabdagi chorak baholarni beshga tortish birinchi vazifamiz!`,
    },
    {
      index: 1,
      id: "pillar-language",
      iconKey: "globe",
      accentFrom: "rgba(16, 185, 129, 0.45)",
      accentTo: "rgba(6, 182, 212, 0.35)",
      spokenScript: `Ikkinchi qadam — til masalasi! Bu yerga kirish uchun ${profile.languageSpoken}. Ko'pchilik erta-yu kech grammatika kitob yodlab qiynaladi, lekin eng zo'r va tabiiy yo'li boshqacha: har kuni yarim soat o'zingiz tanlagan ${direction.shortTitle} mavzusida inglizcha videolar ko'ring, audio eshiting va haftada ikki marta kichik insho yozib ko'ring. Shunda ham zerikmaysiz, ham kerakli ball o'z-o'zidan chiqadi.`,
    },
    {
      index: 2,
      id: "pillar-exams",
      iconKey: "target",
      accentFrom: "rgba(245, 158, 11, 0.45)",
      accentTo: "rgba(249, 115, 22, 0.35)",
      spokenScript: `Uchinchi narsa — kirish testlari! Aniqrog'i, ${profile.examsSpoken}. Yuqori ball olishning bitta zo'r siri bor: quruq test ishlayvermasdan, bitta xatolar daftari tuting. Har hafta bitta to'liq sinov testi ishlang-da, xato chiqqan har bitta savolni nega xato qilganingizni topib, o'shanga o'xshash o'nta misol ishlang. Shu usul bilan ballingiz ikki-uch oyda keskin o'sadi!`,
    },
    {
      index: 3,
      id: "pillar-spike",
      iconKey: "sparkles",
      accentFrom: "rgba(168, 85, 247, 0.45)",
      accentTo: "rgba(236, 72, 153, 0.35)",
      spokenScript: `To'rtinchi va eng qiziq qismi — sizni boshqalardan ajratib turadigan amaliy ish! O'zingiz o'ylang, top universitetga minglab a'lochi bolalar hujjat topshiradi. Qabuldagilar sizni nega tanlashi kerak? Javob oddiy: amaliy ish bilan! Sizning sohangiz uchun eng zo'r g'oya — ${direction.spikeProjectIdea}. O'nta qog'oz sertifikatdan ko'ra o'zingiz qilgan bitta tirik loyiha ming marta kuchli ishlaydi!`,
    },
    {
      index: 4,
      id: "pillar-leadership",
      iconKey: "users",
      accentFrom: "rgba(59, 130, 246, 0.45)",
      accentTo: "rgba(37, 99, 235, 0.35)",
      spokenScript: `Beshinchi narsa — jamoa va faollik! Chet eldagi ustozlar faqat xonasiga qamalib dars qiladigan emas, atrofdagilarga ham foydasi tegadigan bolalarni qadrlaydi. Maktabingizda kichik to'garak oching, kichik sinflarga bilgan narsangizni o'rgating yoki jamoaviy tanlovda sardor bo'ling. Qancha odamga foydangiz tekkanini keyin hujjatda yozib ko'rsatamiz.`,
    },
    {
      index: 5,
      id: "pillar-essays",
      iconKey: "feather",
      accentFrom: "rgba(20, 184, 166, 0.45)",
      accentTo: "rgba(56, 189, 248, 0.35)",
      spokenScript: `Oltinchi qadam — o'zingiz haqingizdagi xat, ya'ni Personal Statement va ustozlar tavsiyasi! Ko'pchilik bu xatda o'zini maqtab yozadi, bu xato. Uning o'rniga nega aynan ${direction.shortTitle} sohasiga qiziqib qolganingizni, hayotingizdagi bitta oddiy va samimiy voqea orqali aytib bering. Yana sizni yaxshi taniydigan ikkita maktab o'qituvchisidan iliq tavsiyanoma ham olamiz.`,
    },
    {
      index: 6,
      id: "pillar-scholarship",
      iconKey: "award",
      accentFrom: "rgba(251, 191, 36, 0.5)",
      accentTo: "rgba(16, 185, 129, 0.4)",
      spokenScript: `Va nihoyat yettinchi qadam — yuz foiz grant yutib, tekinga o'qish! Ko'pchilik chet elda o'qish uchun juda katta pul kerak deb qo'rqadi, lekin bilingki, ${profile.scholarshipSpoken}. Hujjat topshirish vaqti esa — ${profile.deadlineSpoken}. ${grade.spokenRoadmap} Xo'sh, qaysi qismi bo'yicha savolingiz bor? Probelni bosib turib bemalol so'rang! Agar hammasi tushunarli bo'lsa, o'ng pastdagi yashil tugmani bosib keyingi qadamga o'tsangiz bo'ladi.`,
    },
  ];
}

export function buildSmartAdmissionReply(params: {
  question: string;
  university: UniversityItem;
  grade: GradeOption;
  direction: DirectionTrack;
  currentModuleIndex: number;
}): string {
  const { question, university, grade, direction } = params;
  const profile = getCountryProfile(university.country);
  const q = question.toLowerCase();

  if (!q.trim()) {
    return `Ovozingiz biroz pastroq keldi shekilli. Probelni bosib turib savolingizni bemalol qaytadan aytavering, diqqat bilan eshityapman!`;
  }

  if (q.includes("ielts") || q.includes("toefl") || q.includes("ingliz") || q.includes("til")) {
    return `Til bo'yicha gap bunday: ${university.name} uchun ${profile.languageSpoken}. Siz hozir ${grade.label}da ekansiz, har kuni yarim soat video ko'rib, so'z boyligini oshirib borsangiz, bu ballni qiyinchiliksiz olasiz!`;
  }

  if (
    q.includes("grant") ||
    q.includes("stipendiya") ||
    q.includes("bepul") ||
    q.includes("tekin") ||
    q.includes("pul") ||
    q.includes("kontrakt")
  ) {
    return `Pul tomonidan xavotir olmang! Chunki ${profile.scholarshipSpoken}. Asosiysi — bahoyingiz, test balingiz va qilgan amaliy ishingiz kuchli bo'lsa, o'qish pulini to'liq yopib keta olasiz.`;
  }

  if (q.includes("sat") || q.includes("act") || q.includes("imtihon") || q.includes("test")) {
    return `Imtihon haqida aytsam, ${profile.examsSpoken}. Ayniqsa ${direction.shortTitle} yo'nalishida matematikadan baland ball olsangiz, qabuldagilar sizga juda yaxshi ko'z bilan qaraydi.`;
  }

  if (q.includes("baho") || q.includes("gpa") || q.includes("maktab") || q.includes("uch") || q.includes("to'rt")) {
    return `Maktab baholari rostdan muhim! Lekin oldin uch yoki to'rt baho olgan bo'lsangiz ham tushkunlikka tushmang — bugundan boshlab ayniqsa ${direction.spokenSubjects} darslaridan besh olib, o'sish ko'rsatsangiz, komissiya buni juda yaxshi qabul qiladi.`;
  }

  if (q.includes("loyiha") || q.includes("portfolio") || q.includes("olimpiada") || q.includes("nima qil")) {
    return `Sizga eng zo'r maslahatim — ${direction.spikeProjectIdea}. Kichkinasidan bugunoq boshlayvering, har oy oz-ozdan qo'shib borsangiz, zo'r natija chiqadi!`;
  }

  if (q.includes("insho") || q.includes("essay") || q.includes("motiv") || q.includes("xat")) {
    return `Insho yozganda murakkab so'zlar shart emas. Nega aynan ${direction.shortTitle} sizga yoqishini bitta hayotiy misol bilan oddiy va rostgo'y qilib tushuntirib bersangiz, eng kuchli xat shu bo'ladi!`;
  }

  if (q.includes("qachon") || q.includes("muddat") || q.includes("ulgur")) {
    return `Vaqt bo'yicha aytadigan bo'lsam, ${profile.deadlineSpoken}. ${grade.spokenRoadmap}`;
  }

  return `Juda yaxshi savol berdingiz! ${university.name} da o'qish uchun eng asosiysi — ${profile.pathwaySpoken}, va ${profile.examsSpoken}. Hozir ${grade.label}dan boshlab kuniga ikki soat vaqt ajratsangiz, albatta niyatga yetasiz. Yana nima qiziqtiryapti, probelni bosib so'rayvering!`;
}
