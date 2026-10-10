/** Canonical subject keys come from the seed skill bank (`skill.subject`). */
export const SUBJECT_LABELS: Record<string, string> = {
  SAT: "SAT",
  IELTS: "IELTS",
  MATHEMATICS: "Matematika",
  ACADEMIC_ENGLISH: "Akademik ingliz tili",
  LOGIC: "Mantiq",
  WRITING: "Yozuv",
  APPLICATIONS: "Ariza va suhbat",
};

export const PLACEMENT_SUBJECTS: { value: string | null; label: string }[] = [
  { value: null, label: "Barchasi" },
  { value: "SAT", label: "SAT" },
  { value: "IELTS", label: "IELTS" },
  { value: "MATHEMATICS", label: "Matematika" },
  { value: "ACADEMIC_ENGLISH", label: "Akademik ingliz" },
  { value: "LOGIC", label: "Mantiq" },
];

export function subjectLabel(value: string | null): string {
  if (value === null || value === "") return "Barchasi";
  return SUBJECT_LABELS[value] ?? value;
}
