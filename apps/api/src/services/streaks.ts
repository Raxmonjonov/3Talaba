/** Pure helpers for study streaks so the controller stays thin and testable. */

/** UTC calendar day so keys match `Date#toISOString().slice(0, 10)` rows. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function utcMidnightDaysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/**
 * Current streak counts consecutive active days ending today (UTC), or
 * yesterday if today has no minutes yet so an unfinished day does not zero
 * the run. Best streak is the longest run anywhere in the provided set.
 */
export function computeStreaks(activeDays: Set<string>): {
  current: number;
  best: number;
  todayActive: boolean;
} {
  const todayActive = activeDays.has(dayKey(new Date()));

  const cursor = utcMidnightDaysAgo(0);
  if (!activeDays.has(dayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let current = 0;
  while (activeDays.has(dayKey(cursor))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of [...activeDays].sort()) {
    if (prev) {
      const prevDate = new Date(`${prev}T00:00:00Z`);
      const nextDate = new Date(`${day}T00:00:00Z`);
      const diffDays = Math.round(
        (nextDate.getTime() - prevDate.getTime()) / 86_400_000
      );
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = day;
  }

  return { current, best, todayActive };
}
