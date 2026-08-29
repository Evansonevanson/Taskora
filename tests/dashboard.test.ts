import { describe, it, expect } from 'vitest';
import { calculateProgressPercentage } from '@/lib/data/tasks';

describe('Admin Dashboard Stats & Progress Calculation', () => {
  it('returns 0% when total tasks is 0', () => {
    expect(calculateProgressPercentage(0, 0)).toBe(0);
    expect(calculateProgressPercentage(5, 0)).toBe(0);
  });

  it('returns 0% when completed is 0 and total > 0', () => {
    expect(calculateProgressPercentage(0, 10)).toBe(0);
  });

  it('correctly calculates half completion (50%)', () => {
    expect(calculateProgressPercentage(5, 10)).toBe(50);
  });

  it('correctly rounds floating percentages', () => {
    // 1 / 3 = 33.333... -> 33
    expect(calculateProgressPercentage(1, 3)).toBe(33);
    // 2 / 3 = 66.666... -> 67
    expect(calculateProgressPercentage(2, 3)).toBe(67);
  });

  it('caps percentage between 0 and 100', () => {
    expect(calculateProgressPercentage(10, 10)).toBe(100);
    expect(calculateProgressPercentage(15, 10)).toBe(100);
    expect(calculateProgressPercentage(-2, 10)).toBe(0);
  });
});
