import { describe, it, expect } from 'vitest';
import { generatePlan,  } from '../../src/lib/server/curriculum/generator';

describe('curriculum generator', () => {
  it('basic shape', () => {
    const plan = generatePlan({
      level: 0,
      startDate: new Date('2026-01-05'),
      targetExam: 'SAT',
      targetScore: 1400,
      studyDays: [1, 2, 3, 4, 5, 6, 0],
      weakSkills: [],
      lessons: [],
      mockExams: [],
      totalWeeks: 8,
    } );
    expect(plan.mode).toBeDefined();
    expect(plan.weeks.length).toBeGreaterThan(0);
  });
});
