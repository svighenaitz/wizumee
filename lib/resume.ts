import { z } from 'zod';

const text = z.string().max(10000, 'Massimo 10.000 caratteri');
const short = z.string().max(300, 'Massimo 300 caratteri');
const url = short.refine(
  (v) => !v || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v),
  'Inserisci un URL completo (https://…)',
);
const date = z
  .string()
  .refine((v) => !v || /^\d{4}(-(?:0[1-9]|1[0-2]))?$/.test(v), 'Usa AAAA oppure AAAA-MM');
const entry = z.object({
  id: z.string().min(1),
  organization: short,
  location: short,
  title: short,
  start: short,
  end: short,
  current: z.boolean(),
  description: text,
});
const datedEntry = entry.superRefine((e, ctx) => {
  for (const key of ['start', 'end'] as const) {
    if (key === 'end' && e.current) continue;
    if (!date.safeParse(e[key]).success)
      ctx.addIssue({ code: 'custom', message: 'Usa AAAA oppure AAAA-MM', path: [key] });
  }
  const start = e.start.length === 4 ? `${e.start}-01` : e.start;
  const end = e.end.length === 4 ? `${e.end}-12` : e.end;
  if (start && end && !e.current && start > end)
    ctx.addIssue({
      code: 'custom',
      message: 'La data finale deve seguire quella iniziale',
      path: ['end'],
    });
});
export const sectionKeys = ['education', 'experience', 'projects', 'activities', 'skills'] as const;
export type SectionKey = (typeof sectionKeys)[number];
export const labels: Record<SectionKey, string> = {
  education: 'Formazione',
  experience: 'Esperienze',
  projects: 'Progetti',
  activities: 'Attività e leadership',
  skills: 'Competenze e interessi',
};
export const englishLabels: Record<SectionKey, string> = {
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  activities: 'Leadership & Activities',
  skills: 'Skills & Interests',
};
export const resumeSchema = z.object({
  version: z.literal(1),
  fullName: short.refine((v) => !!v.trim(), 'Inserisci il tuo nome'),
  role: short,
  email: short.refine((v) => !v || z.email().safeParse(v).success, 'Indirizzo email non valido'),
  phone: short,
  address: short,
  linkedin: url,
  website: url,
  summary: text,
  language: z.enum(['it', 'en']),
  education: z.array(datedEntry).max(50),
  experience: z.array(datedEntry).max(50),
  projects: z.array(datedEntry).max(50),
  activities: z.array(datedEntry).max(50),
  skills: z.array(z.object({ id: z.string(), name: short.min(1) })).max(100),
  languages: text,
  laboratory: text,
  interests: text,
  sectionOrder: z
    .array(z.enum(sectionKeys))
    .length(5)
    .refine((a) => new Set(a).size === 5),
});
export type Resume = z.infer<typeof resumeSchema>;
export type Entry = z.infer<typeof entry>;
export type EntryKey = Exclude<SectionKey, 'skills'>;
export const newEntry = (): Entry => ({
  id: crypto.randomUUID(),
  organization: '',
  location: '',
  title: '',
  start: '',
  end: '',
  current: false,
  description: '',
});
export const emptyResume: Resume = {
  version: 1,
  fullName: '',
  role: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  website: '',
  summary: '',
  language: 'it',
  education: [],
  experience: [],
  projects: [],
  activities: [],
  skills: [],
  languages: '',
  laboratory: '',
  interests: '',
  sectionOrder: [...sectionKeys],
};
export const demoResume: Resume = {
  ...emptyResume,
  fullName: 'Alex Morgan',
  role: 'Product Designer',
  email: 'alex.morgan@example.com',
  phone: '+39 333 123 4567',
  address: 'Milano, Italia',
  website: 'https://example.com',
  education: [
    {
      id: 'demo-education',
      organization: 'Politecnico di Milano',
      location: 'Milano, Italia',
      title: 'Laurea magistrale in Design della comunicazione',
      start: '2016',
      end: '2018',
      current: false,
      description: '110/110 con lode\nTesi: progettare servizi digitali accessibili.',
    },
  ],
  experience: [
    {
      id: 'demo-experience-1',
      organization: 'Studio Forma',
      location: 'Milano, Italia',
      title: 'Senior Product Designer',
      start: '2022-03',
      end: '',
      current: true,
      description:
        'Progettato un nuovo percorso di onboarding, aumentando del 24% il completamento delle registrazioni.\nCreato un design system condiviso da 3 team di prodotto.\nCondotto interviste e test di usabilità con oltre 40 clienti.',
    },
    {
      id: 'demo-experience-2',
      organization: 'Orizzonte Digitale',
      location: 'Torino, Italia',
      title: 'UX/UI Designer',
      start: '2018-09',
      end: '2022-02',
      current: false,
      description:
        'Disegnato esperienze web e mobile per servizi dedicati alla mobilità urbana.\nCollaborato con sviluppatori e product manager dal prototipo al rilascio.',
    },
  ],
  activities: [
    {
      id: 'demo-activity',
      organization: 'Design Together',
      location: 'Milano, Italia',
      title: 'Mentor volontario',
      start: '2023',
      end: '',
      current: true,
      description:
        'Affiancato designer junior nella costruzione del portfolio e nella preparazione ai colloqui.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'Figma' },
    { id: 'skill-2', name: 'User research' },
    { id: 'skill-3', name: 'Prototipazione' },
    { id: 'skill-4', name: 'Design system' },
  ],
  languages: 'Italiano madrelingua; inglese C1',
  interests: 'Fotografia, architettura e trekking',
};
export const STORAGE_KEY = 'wizumee.resume.v1';
// Drafts may legitimately contain unfinished or temporarily invalid fields.
const draftSchema = resumeSchema.safeExtend({
  fullName: short,
  email: short,
  linkedin: short,
  website: short,
  education: z.array(entry.extend({ start: short, end: short })).max(50),
  experience: z.array(entry.extend({ start: short, end: short })).max(50),
  projects: z.array(entry.extend({ start: short, end: short })).max(50),
  activities: z.array(entry.extend({ start: short, end: short })).max(50),
});
export function parseDraft(raw: string): Resume {
  const result = draftSchema.parse(JSON.parse(raw));
  for (const key of sectionKeys) {
    if (new Set(result[key].map((e) => e.id)).size !== result[key].length)
      throw new Error('Identificatori duplicati');
  }
  return result;
}
export function bullets(value: string) {
  return value
    .split('\n')
    .map((s) => s.replace(/^\s*[•-]\s*/, '').trim())
    .filter(Boolean);
}
export function hasEntry(e: Entry) {
  return [e.organization, e.title, e.location, e.description, e.start, e.end].some((v) => v.trim());
}
export function dateRange(e: Entry, language: Resume['language']) {
  const format = (d: string) => {
    if (!d || d.length === 4) return d;
    const [y, m] = d.split('-');
    const months =
      language === 'it'
        ? ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number(m) - 1] ?? m} ${y}`;
  };
  return [format(e.start), e.current ? (language === 'it' ? 'Presente' : 'Present') : format(e.end)]
    .filter(Boolean)
    .join(' – ');
}
export function skillRows(r: Resume) {
  return [
    [r.language === 'it' ? 'Tecniche' : 'Technical', r.skills.map((s) => s.name).join(', ')],
    [r.language === 'it' ? 'Lingue' : 'Language', r.languages],
    [r.language === 'it' ? 'Laboratorio' : 'Laboratory', r.laboratory],
    [r.language === 'it' ? 'Interessi' : 'Interests', r.interests],
  ].filter(([, v]) => v.trim());
}
export function fileName(r: Resume, extension: string) {
  return `${
    r.fullName
      .trim()
      .replace(/[^\p{L}\p{N} _-]/gu, '')
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'curriculum'
  }.${extension}`;
}
