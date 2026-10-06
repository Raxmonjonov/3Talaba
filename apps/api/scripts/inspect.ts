import { prisma } from "../src/config/prisma.js";

const courses = await prisma.course.findMany({
  select: { slug: true, subject: true, _count: { select: { modules: true } } },
  orderBy: { slug: "asc" },
});
for (const c of courses) console.log(`${c.slug}  [${c.subject}]  ${c._count.modules} modules`);

const lessons = await prisma.lesson.findMany({ select: { slug: true, module: { select: { course: { select: { slug: true } } } } } });
console.log(`\nlessons: ${lessons.length}`);
const dupes = new Map<string, number>();
for (const l of lessons) dupes.set(l.slug, (dupes.get(l.slug) ?? 0) + 1);
const collided = [...dupes.entries()].filter(([, n]) => n > 1);
console.log(`duplicate lesson slugs: ${collided.length}`);
for (const [s, n] of collided.slice(0, 10)) console.log(`  ${s} x${n}`);

await prisma.$disconnect();