import { describe, expect, it } from 'vitest';
import {
  demoResume,
  emptyResume,
  parseDraft,
  resumeSchema,
  dateRange,
  fileName,
} from '../lib/resume';
describe('resume data', () => {
  it('validates a complete CV, rejects unsafe URLs and reversed dates', () => {
    expect(resumeSchema.safeParse(demoResume).success).toBe(true);
    expect(resumeSchema.safeParse({ ...demoResume, website: 'javascript:alert(1)' }).success).toBe(
      false,
    );
    expect(
      resumeSchema.safeParse({
        ...demoResume,
        experience: [{ ...demoResume.experience[1], start: '2025', end: '2020' }],
      }).success,
    ).toBe(false);
  });
  it('restores an incomplete draft without requiring valid export fields', () => {
    expect(parseDraft(JSON.stringify({ ...emptyResume, email: 'editing@' })).email).toBe(
      'editing@',
    );
    expect(() => parseDraft('{invalid')).toThrow();
    expect(() =>
      parseDraft(
        JSON.stringify({
          ...demoResume,
          sectionOrder: ['skills', 'skills', 'skills', 'skills', 'skills'],
        }),
      ),
    ).toThrow();
  });
  it('formats present roles and safe filenames', () => {
    expect(dateRange(demoResume.experience[0], 'it')).toBe('mar 2022 – Presente');
    expect(fileName({ ...demoResume, fullName: '../Élisa / Rossi' }, 'pdf')).toBe(
      'Élisa-Rossi.pdf',
    );
  });
});

it('accepts mixed year/month intervals, ignores hidden end dates and rejects blank names', () => {
  const e = { ...demoResume.experience[1], start: '2022-03', end: '2022' };
  expect(resumeSchema.safeParse({ ...demoResume, experience: [e] }).success).toBe(true);
  expect(
    resumeSchema.safeParse({
      ...demoResume,
      experience: [{ ...e, current: true, end: 'unfinished' }],
    }).success,
  ).toBe(true);
  expect(resumeSchema.safeParse({ ...demoResume, fullName: '   ' }).success).toBe(false);
  expect(() => parseDraft(JSON.stringify({ ...demoResume, experience: [e, e] }))).toThrow();
});
