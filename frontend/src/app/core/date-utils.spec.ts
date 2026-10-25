import { addDays, displayDate, formatDate, isValidDate, todayLocal } from './date-utils';

describe('date-utils', () => {
  describe('todayLocal', () => {
    it('uses the local calendar day, never the UTC day', () => {
      // 00:30 local on 1 Jan: in any zone ahead of UTC, toISOString() would say 31 Dec.
      expect(todayLocal(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
      // 23:30 local on 31 Dec: in any zone behind UTC, toISOString() would say 1 Jan.
      expect(todayLocal(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31');
    });

    it('pads month and day', () => {
      expect(todayLocal(new Date(2026, 2, 5, 12))).toBe('2026-03-05');
    });

    it('defaults to now', () => {
      const now = new Date();
      expect(todayLocal()).toBe(formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate()));
    });
  });

  describe('isValidDate', () => {
    const valid = ['2026-02-28', '2028-02-29', '2026-12-31', '0001-01-01', '9999-12-31'];
    const invalid = ['2026-02-29', '2026-02-30', '2026-13-01', '2026-00-10', '2026-01-00', '2026-04-31', '0000-01-01',
      '2026-2-3', '03/02/2026', '2026/02/03', '2026-02-03T10:00:00Z', ' 2026-02-03', '2026-02-03 ', '', 'tomorrow'];

    valid.forEach((v) => it(`accepts ${v}`, () => expect(isValidDate(v)).toBeTrue()));
    invalid.forEach((v) => it(`rejects "${v}"`, () => expect(isValidDate(v)).toBeFalse()));
  });

  describe('addDays', () => {
    it('crosses month ends', () => {
      expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
      expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('crosses year ends', () => {
      expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
      expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    });

    it('knows leap years', () => {
      expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    });

    it('is not thrown off by daylight saving changes', () => {
      for (const start of ['2026-03-28', '2026-10-24', '2026-03-07', '2026-11-01']) {
        expect(addDays(addDays(start, 3), -3)).toBe(start);
        expect(addDays(start, 1) > start).toBeTrue();
      }
    });
  });

  it('displayDate shows the stored day, whatever the time zone', () => {
    const shown = displayDate('2026-03-05');
    expect(shown).toContain('2026');
    expect(shown).toMatch(/\b5\b/);
  });
});
