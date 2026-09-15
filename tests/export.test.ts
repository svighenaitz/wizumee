import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import PizZip from 'pizzip';
import { DOMParser } from '@xmldom/xmldom';
import { buildDocx } from '../lib/export';
import { demoResume } from '../lib/resume';
const template = readFileSync('public/templates/2025-template_bullet.docx');
describe('DOCX export', () => {
  it('uses source styles and numbering, escapes text, removes sample content and obeys order', async () => {
    const r = {
      ...demoResume,
      fullName: 'Élisa <Rossi> & Co',
      sectionOrder: [...demoResume.sectionOrder].reverse(),
    };
    const blob = buildDocx(r, template);
    const zip = new PizZip(await blob.arrayBuffer());
    const xml = zip.file('word/document.xml')!.asText();
    expect(xml).toContain('Élisa &lt;Rossi&gt; &amp; Co');
    expect(xml).not.toContain('Firstname');
    expect(xml).not.toContain('[Note:');
    expect(xml).not.toContain('{@body}');
    expect(xml.indexOf('Competenze e interessi')).toBeLessThan(xml.indexOf('Formazione'));
    expect(xml).not.toContain('Progetti');
    const source = new PizZip(template);
    for (const [part, original] of Object.entries(source.files)) {
      if (original.dir || ['word/document.xml', 'docProps/core.xml'].includes(part)) continue;
      expect(zip.file(part)!.asUint8Array(), part).toEqual(original.asUint8Array());
    }
    const errors: string[] = [];
    new DOMParser({ onError: (level, msg) => errors.push(`${level}: ${msg}`) }).parseFromString(
      xml,
      'application/xml',
    );
    expect(errors).toEqual([]);
    expect(xml.match(/<w:sectPr/g)).toHaveLength(1);
  });
});
