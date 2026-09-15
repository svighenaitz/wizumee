import React from 'react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderToBuffer } from '@react-pdf/renderer';
import ResumePdf, { registerResumeFonts } from '../lib/pdf-document';
import { buildDocx } from '../lib/export';
import { demoResume, type Resume } from '../lib/resume';
await mkdir('qa', { recursive: true });
registerResumeFonts(`${process.cwd()}/public`);
const template = await readFile('public/templates/2025-template_bullet.docx');
const long: Resume = {
  ...demoResume,
  fullName: 'Élisa Rossi — Curriculum',
  experience: Array.from({ length: 14 }, (_, i) => ({
    ...demoResume.experience[0],
    id: `long-${i}`,
    organization: `Organizzazione ${i + 1} — Ricerca & Sviluppo`,
    description: Array.from(
      { length: 5 },
      (_, j) =>
        `Risultato ${j + 1}: progettazione di esperienze accessibili e miglioramento della qualità, con attività di analisi e collaborazione tra team internazionali. Verifica della leggibilità e della continuità del testo su più pagine.`,
    ).join('\n'),
  })),
};
for (const [name, data] of [
  ['demo', demoResume],
  ['long', long],
] as const) {
  await writeFile(`qa/${name}.docx`, new Uint8Array(await buildDocx(data, template).arrayBuffer()));
  await writeFile(`qa/${name}.pdf`, await renderToBuffer(<ResumePdf resume={data} />));
}
