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

/** Ro'yxatdan o'tmagan foydalanuvchi uchun Navbar tuzilmasi:
 * O'quv Dasturlari (/learn) | Matematika (/math) | Amaliyot (/practice) | Talaba AI (/coach) | Tariflar (/#pricing) | FAQ (/#faq)
 */
export const GUEST_NAV_LINKS: NavLinkItem[] = [
  { href: "/learn", label: "O'quv Dasturlari" },
  { href: "/math", label: "Matematika" },
  { href: "/practice", label: "Amaliyot" },
  { href: "/coach", label: "Talaba AI", tone: "gold" },
  { href: "/#pricing", label: "Tariflar" },
  { href: "/#faq", label: "FAQ" },
];

/** Tizimga kirgan o'quvchi uchun Navbar tuzilmasi (shaxsiy kabinet sahifalari). */
export const STUDENT_NAV_LINKS: NavLinkItem[] = [
  { href: "/learn", label: "Darslar" },
  { href: "/math", label: "Matematika" },
  { href: "/practice", label: "Amaliyot" },
  { href: "/coach", label: "Talaba AI", tone: "gold" },
  { href: "/profile", label: "Mening Profilim", tone: "neon" },
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
