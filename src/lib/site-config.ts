/**
 * 3Talaba Campus — yagona brend, navigatsiya va aloqa konfiguratsiyasi.
 * Navbar, Footer va Landing seksiyalari shu fayldan foydalanadi,
 * shuning uchun nom, raqam va linklar butun saytda bir xil bo'lib qoladi.
 */

export const BRAND = {
  name: "3Talaba",
  fullName: "3Talaba Campus",
  aiName: "Talaba AI",
  tagline: "Xalqaro O'quv Platformasi",
} as const;

/** Butun saytda bir xil ko'rsatiladigan natija maqsadlari. */
export const TARGETS = {
  sat: "SAT 1500+ (Math 800)",
  satShort: "1500+",
  satMath: "Math 800",
  ielts: "IELTS 7.5+",
  ieltsShort: "7.5+",
  program: "Tizimli 12 oylik tayyorgarlik",
} as const;

/** Bosh sahifa seksiyalari anchorlari (Navbar va Footer shu qiymatlardan foydalanadi). */
export const SECTION_IDS = {
  programs: "dasturlar",
  roadmap: "tizim",
  aiCoach: "ai-murabbiy",
  practice: "mashq",
  pricing: "pricing",
  faq: "faq",
} as const;

export interface NavLinkItem {
  href: string;
  label: string;
  tone?: "default" | "gold" | "neon";
}

/** Ro'yxatdan o'tmagan foydalanuvchi uchun asosiy, ixcham Navbar tuzilmasi.
 * Qolgan barcha qo'shimcha bo'limlar Sozlamalar (/settings) ichida jamlangan.
 */
export const GUEST_NAV_LINKS: NavLinkItem[] = [
  { href: "/learn", label: "Darslar" },
  { href: "/math", label: "Matematika" },
  { href: "/practice", label: "Amaliyot" },
  { href: "/simulator", label: "IELTS Simulyator", tone: "neon" },
  { href: "/coach", label: "Talaba AI", tone: "gold" },
];

/** Tizimga kirgan o'quvchi uchun asosiy, ixcham Navbar tuzilmasi.
 * Profil, Xarita, Tarix, AI Examiner, Tariflar va boshqa bo'limlar /settings ichida.
 */
export const STUDENT_NAV_LINKS: NavLinkItem[] = [
  { href: "/learn", label: "Darslar" },
  { href: "/math", label: "Matematika" },
  { href: "/practice", label: "Amaliyot" },
  { href: "/simulator", label: "IELTS Simulyator", tone: "neon" },
  { href: "/coach", label: "Talaba AI", tone: "gold" },
];

/** Sozlamalar (/settings) bo'limiga ko'chirilgan barcha qo'shimcha sahifalar ro'yxati. */
export interface SettingsSectionLink {
  href: string;
  label: string;
  description: string;
  category: "personal" | "tools" | "info";
  badge?: string;
}

export const SETTINGS_EXTRA_SECTIONS: SettingsSectionLink[] = [
  {
    href: "/profile",
    label: "Mening Profilim",
    description: "12 oylik xarita, konspektlar va savollar banki bir joyda",
    category: "personal",
    badge: "Kabinet",
  },
  {
    href: "/progress",
    label: "Progress & Reyting",
    description: "XP ballari, darajalar, nishonlar va respublika peshqadamlari",
    category: "personal",
    badge: "XP",
  },
  {
    href: "/roadmap",
    label: "12 Oylik Yo'l Xaritasi",
    description: "365 kunlik shaxsiy o'qish grafigi va kunlik vaqt rejasi",
    category: "personal",
  },
  {
    href: "/history",
    label: "Dars Tarixi & Konspektlar",
    description: "O'tilgan darslar, muhim formulalar va namuna misollar",
    category: "personal",
  },
  {
    href: "/examiner",
    label: "AI Writing Examiner",
    description: "IELTS Writing insholarini 4 mezon bo'yicha AI baholash",
    category: "tools",
    badge: "AI",
  },
  {
    href: "/placement",
    label: "Diagnostika Testi",
    description: "Joriy SAT & IELTS darajangizni aniqlash va qayta topshirish",
    category: "tools",
  },
  {
    href: "/onboarding",
    label: "Maqsadlarni Sozlash",
    description: "Maqsadli universitet, sinf va kunlik o'qish vaqtini o'zgartirish",
    category: "tools",
  },
  {
    href: "/guardian",
    label: "Ota-ona & Ustoz Ko'rinishi",
    description: "Haftalik o'sish hisoboti va maxsus ulashish kodi",
    category: "info",
  },
  {
    href: "/admin",
    label: "Admin Panel",
    description: "Foydalanuvchilar, savollar banki va kontent boshqaruvi",
    category: "info",
    badge: "Admin",
  },
  {
    href: "/settings?tab=billing",
    label: "Tariflar & Pro Obuna",
    description: "Joriy tarifni ko'rish va qayta ro'yxatdan o'tmasdan Pro Campus'ga o'tish",
    category: "info",
    badge: "Pro",
  },
  {
    href: `/#${SECTION_IDS.faq}`,
    label: "Ko'p So'raladigan Savollar (FAQ)",
    description: "Platforma va imtihonlarga tayyorgarlik bo'yicha javoblar",
    category: "info",
  },
];

/**
 * Aloqa kanallari.
 * DIQQAT: haqiqiy Telegram kanal, bot va email manzillaringizni shu yerda yangilang.
 */
export const CONTACTS = {
  telegramChannel: {
    label: "Telegram kanal",
    handle: "@talaba3_campus",
    href: "https://t.me/talaba3_campus",
  },
  supportBot: {
    label: "Support bot",
    handle: "@talaba3_support_bot",
    href: "https://t.me/talaba3_support_bot",
  },
  email: {
    label: "Email",
    handle: "support@3talaba.uz",
    href: "mailto:support@3talaba.uz",
  },
} as const;

export const LEGAL_LINKS: NavLinkItem[] = [
  { href: "/terms", label: "Foydalanish shartlari" },
  { href: "/privacy", label: "Maxfiylik siyosati" },
];
