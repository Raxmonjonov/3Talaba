import type { Dictionary } from "./uz";

export const en: Dictionary = {
  meta: {
    title: "3Talab — get into a top university within one year",
    description:
      "Personal preparation for SAT, IELTS and university admission: a placement test, a daily plan, and an AI tutor that guides you with questions instead of handing over answers.",
    ogAlt: "3Talab landing page: placement test, daily plan and AI tutor",
  },

  nav: {
    brand: "3Talab",
    skipToContent: "Skip to main content",
    howItWorks: "How it works",
    preview: "Inside",
    dialogue: "Tutor",
    weekly: "Plans",
    subjects: "Subjects",
    faq: "FAQ",
    login: "Log in",
    register: "Sign up",
    dashboard: "Dashboard",
    logout: "Log out",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Switch theme",
    themeLight: "Light mode",
    themeDark: "Dark mode",
  },

  hero: {
    eyebrow: "A one-year personal plan",
    title: "Get into a top university",
    titleAccent: "within one year",
    subtitle:
      "We first measure your level precisely. Then we build a plan for you, day by day. And the AI tutor never just hands over the answer — it asks questions so you work it out yourself.",
    ctaPrimary: "Test my level for free",
    ctaSecondary: "Log in",
    note: "Signing up is free. No credit card required.",
    benefits: [
      { value: "1 year", label: "A measured plan that fits a year of real progress" },
      { value: "Built for you", label: "Your weakest topics get scheduled first" },
      { value: "Long-lasting", label: "Spaced repetition keeps it from fading" },
    ],
  },

  howItWorks: {
    eyebrow: "Easy to start",
    title: "How it works",
    subtitle:
      "Four steps. The first takes a few minutes; the rest becomes your daily routine.",
    steps: [
      {
        title: "Create an account",
        body: "Enter your name and email. No phone number and no payment details.",
      },
      {
        title: "Take the placement test",
        body: "An adaptive test picks questions from your answers — usually 15–20 is enough.",
      },
      {
        title: "Get a daily plan",
        body: "Each day you are told how much time to spend, which topic to cover and how many exercises to do.",
      },
      {
        title: "Work with the AI tutor",
        body: "Lessons, exercises and explanations. Your mistakes are logged and rescheduled for review.",
      },
    ],
  },

  preview: {
    eyebrow: "What's inside",
    title: "What the test and your plan look like",
    subtitle: "These are real screens from inside the app. This is where you will meet them.",
    placementLabel: "Placement test",
    placementTitle: "SAT Mathematics",
    placementQuestion:
      "If 3x − 7 = 14 and 2x + 5 = 17, what is the value of x?",
    placementProgress: "Question 7 / 25",
    placementOptions: ["x = 4", "x = 6", "x = 9", "x = 11"],
    placementHint: "Add 7 to both sides of the first equation, then divide by 3.",
    planLabel: "Daily plan",
    planTitle: "Today's plan",
    planDay: "Monday · 3 h 40 min",
    planItems: [
      "Algebra: expanding polynomials — 45 min",
      "Reading: close reading of a passage — 40 min",
      "Exercises: 12 questions — 30 min",
      "Writing: outline an essay — 25 min",
      "Mistakes: revisit 4 questions — 20 min",
    ],
    planNote: "The plan updates itself based on yesterday's results.",
  },

  dialogue: {
    eyebrow: "The Socratic method",
    title: "The tutor does not give the answer",
    subtitle:
      "The AI tutor may hold back the answer on purpose. It pushes you to think — which is exactly how the knowledge stays yours.",
    topic: "SAT · Mathematics",
    tutor: "AI tutor",
    student: "You",
    bubbles: [
      {
        from: "tutor",
        text: "Shall we solve it in one go? First, find what x equals in 3x − 7 = 14.",
      },
      {
        from: "student",
        text: "I guessed x = 7, but I checked and 3 · 7 − 7 isn't 14, it's not.",
      },
      {
        from: "tutor",
        text: "Good — checking your answer was the right instinct. Now use the second equation to find it yourself: 2x + 5 = 17.",
      },
      {
        from: "tutor",
        text: "Hint: subtract 5 from both sides first, then divide by 2.",
      },
    ],
    note: "Every step is small, but by the end the whole lesson is genuinely yours.",
  },

  weekly: {
    eyebrow: "Weekly rhythm",
    title: "How much time can you give it?",
    subtitle: "Both options work. The difference is how fast you start and the size of your daily load.",
    regular: {
      title: "Prepared track",
      schedule: "4 days a week × 4 hours",
      description: "For students close to the exam, or who already have a solid base.",
      points: [
        "4 hours a day: 2 h new topics, 1 h exercises, 1 h revisiting mistakes",
        "One full mock exam each week",
        "The plan re-calibrates automatically as your level rises",
      ],
    },
    beginner: {
      title: "Starter track",
      schedule: "7 days a week × 45 min",
      description: "For students who haven't started, or who are returning after a long break.",
      points: [
        "45 minutes a day: 20 min lesson, 15 min exercises, 10 min review",
        "You can postpone a day's work when illness or work gets in the way",
        "Progress is slower, but it never stops",
      ],
    },
    note: "Both plans adapt to your schedule, and you can change yours at any time.",
  },

  subjects: {
    eyebrow: "Subjects",
    title: "What you can prepare for",
    subtitle: "One account, six subjects. Pick what you need now and add the rest later.",
    items: [
      {
        name: "SAT",
        blurb: "Mathematics, reading and writing — matched to the real exam format.",
      },
      {
        name: "IELTS",
        blurb: "All four skills: listening, reading, writing and speaking.",
      },
      {
        name: "Academic English",
        blurb: "The language of textbooks and academic papers, for reading and writing.",
      },
      {
        name: "Mathematics",
        blurb: "Algebra and geometry, for SAT and university programmes.",
      },
      {
        name: "Logic and analysis",
        blurb: "Breaking a problem down to reach the right conclusion.",
      },
      {
        name: "Writing",
        blurb: "Outlining an essay, building an argument and fixing your mistakes.",
      },
    ],
  },

  faq: {
    eyebrow: "Questions",
    title: "Frequently asked questions",
    subtitle: "If your answer isn't here, message us on Telegram.",
    items: [
      {
        q: "How much does it cost?",
        a: "The first stage is free: the placement test and your daily plan. The paid parts are the extended exercise bank and full mock exams. Pricing is being finalised — we'll announce it on Telegram when it's ready.",
      },
      {
        q: "Who is it for?",
        a: "Students from grade 8 upwards who are planning to sit SAT or IELTS and preparing for university, plus current university students. If you're starting from zero, the plan simply begins from zero.",
      },
      {
        q: "How does the placement test work?",
        a: "It's adaptive: after each answer the next question becomes easier or harder. Usually 15–20 questions are enough, so the result isn't a rough guess.",
      },
      {
        q: "Which devices does it work on?",
        a: "Phones, tablets and computers all behave the same. There's no app to install — just open a browser. Short exercises still work on a slow connection.",
      },
      {
        q: "How is my data stored?",
        a: "Your password is encrypted. Your answers, weak topics and plan are visible only to you. Ask us and we'll help you export or delete them.",
      },
      {
        q: "Does the AI just give me the answer?",
        a: "Sometimes — but its main job is to explain and point you forward. If the answer is wrong or the question is unclear, the tutor asks again and you review it together.",
      },
      {
        q: "Which languages are available?",
        a: "Uzbek, English and Russian. You can switch at any time and your plan stays intact.",
      },
    ],
  },

  testimonials: {
    eyebrow: "Results",
    title: "Student results",
    subtitle: "Real results will appear here.",
    placeholder: "No results collected yet",
    note: "There is no public leaderboard — only your own progress. Levels, medals and study stats collect in your personal dashboard.",
  },

  finalCta: {
    title: "Not sure where to begin?",
    subtitle:
      "The placement test takes a couple of minutes. It gives you a clear path for the month ahead.",
    cta: "Test my level for free",
    note: "No card details, no payment and no contract to sign.",
  },

  footer: {
    tagline: "SAT, IELTS and university admission preparation for students in Uzbekistan.",
    contact: "Contact",
    privacy: "Privacy policy",
    terms: "Terms of use",
    rights: "All rights reserved.",
    language: "Language",
  },

  auth: {
    loginTagline: "A calm, patient and productive place to learn",
    registerTagline: "Create your account — we will measure your level and build your plan",
    email: "Email",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    minCharacters: "At least 6 characters",
    gender: "Gender",
    genderHint: "This sets how we address you — you can change it later.",
    ageLabel: "Age (optional)",
    goal: "Your goal",
    loading: "Please wait…",
    loginSubmit: "Log in",
    registerSubmit: "Continue",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",
    registerCta: "Sign up",
    loginCta: "Log in",
    errorFallback: "Something went wrong",
    language: "Language",
    genders: [
      { v: "MALE", l: "Male" },
      { v: "FEMALE", l: "Female" },
      { v: "OTHER", l: "Other" },
    ],
    goals: [
      { id: "SAT", label: "SAT", hint: "Mathematics, reading, writing" },
      { id: "IELTS", label: "IELTS", hint: "Listening, reading, writing, speaking" },
      { id: "UNIVERSITY", label: "University admission", hint: "General preparation" },
      { id: "GENERAL", label: "General knowledge", hint: "Build from zero to a complete base" },
    ],
  },
};
