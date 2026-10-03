import { describe, it, expect } from 'vitest';
import { applyAnswer, initialState, itemInformation, probabilityCorrect, selectNextItem, thetaToLevel, updateAbility, type Item } from '../../src/lib/server/placement/adaptive';

const item = (difficulty: number, skillId = 'skill-1'): Item => ({
  id: "q-" + difficulty,
  difficulty,
  skillId,
});

describe('placement adaptive (Rasch)', () => {
  it('probabilityCorrect bounds and monotonic', () => {
    expect(probabilityCorrect(0, 0)).toBeGreaterThan(0.4);
    expect(probabilityCorrect(0, 0)).toBeLessThan(0.6);
    expect(probabilityCorrect(2, 0)).toBeGreaterThan(probabilityCorrect(-2, 0));
  });

  it('itemInformation is maximized when theta near difficulty', () => {
    const mid = itemInformation(0, 0);
    expect(mid).toBeGreaterThan(itemInformation(2, 0));
    expect(mid).toBeGreaterThan(itemInformation(-1.5, 0));
  });

  it('selectNextItem chooses unused with highest information', () => {
    const state = initialState();
    const pool: Item[] = [
      { id: 'a', difficulty: -2, skillId: 's1' },
      { id: 'b', difficulty: 0, skillId: 's1' },
      { id: 'c', difficulty: 2, skillId: 's1' },
    ];
    expect(selectNextItem(state, pool)?.id).toBe('b');
  });

  it('updateAbility moves theta toward correct answer', () => {
    expect(updateAbility(0, 1, 0.5, true).theta).toBeGreaterThan(0);
    expect(updateAbility(0, 1, -0.5, false).theta).toBeLessThan(0);
  });

  it('applyAnswer updates state and history', () => {
    let state = initialState();
    state = applyAnswer(state, item(0), true);
    expect(state.answered.length).toBe(1);
    expect(state.history.length).toBe(1);
  });

  it('thetaToLevel maps thresholds', () => {
    expect(thetaToLevel(-2)).toBe(0);
    expect(thetaToLevel(-1)).toBe(1);
    expect(thetaToLevel(-0.5)).toBe(1);
    expect(thetaToLevel(0)).toBe(2);
    expect(thetaToLevel(0.5)).toBe(3);
    expect(thetaToLevel(1.2)).toBe(4);
    expect(thetaToLevel(2)).toBe(5);
  });
});
