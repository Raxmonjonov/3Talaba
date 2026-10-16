import { prisma } from "../src/lib/prisma";
import { ensureCurriculumSeeded } from "../src/lib/curriculum/ensure-seeded";

async function main() {
  console.log("🌱 3Talab original o'quv kontenti va savollar banki seed qilinmoqda...");
  await ensureCurriculumSeeded();

  const [subjects, topics, lessons, questions, badges] = await Promise.all([
    prisma.subject.count(),
    prisma.topic.count(),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.badge.count(),
  ]);

  console.log(
    `✅ Seed muvaffaqiyatli yakunlandi: ${subjects} ta fan, ${topics} ta mavzu, ${lessons} ta dars, ${questions} ta original savol, ${badges} ta nishon!`,
  );
}

main()
  .catch((err) => {
    console.error("Seed xatoligi:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
