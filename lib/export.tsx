import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import {
  bullets,
  dateRange,
  englishLabels,
  hasEntry,
  labels,
  resumeSchema,
  skillRows,
  type Resume,
} from './resume';

// Only user text enters this escape function; OOXML structure comes from the retained template.
export function xmlText(text: string) {
  return (
    text
      // eslint-disable-next-line no-control-regex -- XML 1.0 forbids these control characters.
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  );
}
export function buildDocx(data: Resume, template: ArrayBuffer | Uint8Array): Blob {
  const r = resumeSchema.parse(data);
  const zip = new PizZip(template);
  const source = zip.file('word/document.xml')!.asText();
  const contentTypes = zip.file('[Content_Types].xml')!.asUint8Array();
  const paragraphs = source.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)!;
  // Clone the source's paragraph styles and geometry; dynamic text uses right tabs
  // instead of the source's fixed character spacing and embedded column breaks.
  function paragraph(index: number, content: string, additions = '') {
    let props = paragraphs[index]?.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? '<w:pPr></w:pPr>';
    props = props
      .replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/g, '')
      .replace(/<w:tabs>[\s\S]*?<\/w:tabs>/g, '')
      .replace(/<w:ind[^>]*\/>/g, '')
      .replace(/<w:spacing[^>]*\/>/g, '')
      .replace(/<w:jc[^>]*\/>/g, '');
    return `<w:p>${props.replace('</w:pPr>', `${additions}<w:widowControl/></w:pPr>`)}${content}</w:p>`;
  }
  function run(value: string, bold = false) {
    return `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/>${bold ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${xmlText(value)}</w:t></w:r>`;
  }
  const center = '<w:jc w:val="center"/>';
  const regular = '<w:spacing w:after="20" w:line="278" w:lineRule="auto"/><w:ind w:left="120"/>';
  const keep = '<w:keepNext/>';
  const row = (left: string, right: string, bold: boolean) =>
    paragraph(
      9,
      run(left, bold) + '<w:r><w:tab/></w:r>' + run(right),
      `${regular}${keep}<w:tabs><w:tab w:val="right" w:pos="10790"/></w:tabs>`,
    );
  let body = paragraph(1, run(r.fullName, true), center + keep);
  if (r.role) body += paragraph(6, run(r.role), center + keep);
  // Retain the original vector line in the name block.
  body += paragraphs[4];
  const contact = [r.address, r.email, r.phone].filter(Boolean).join(' • ');
  if (contact) body += paragraph(6, run(contact), center + '<w:spacing w:before="91"/>' + keep);
  const links = [r.linkedin, r.website].filter(Boolean).join(' • ');
  if (links) body += paragraph(6, run(links), center + keep);
  if (r.summary) body += paragraph(11, run(r.summary), regular);
  const headings = r.language === 'it' ? labels : englishLabels;
  for (const key of r.sectionOrder) {
    const entries = key === 'skills' ? [] : r[key].filter(hasEntry);
    if (key === 'skills' ? !skillRows(r).length : !entries.length) continue;
    body += paragraph(
      8,
      run(headings[key], true),
      center + keep + '<w:spacing w:before="240" w:after="120"/>',
    );
    if (key === 'skills') {
      for (const [label, value] of skillRows(r))
        body += paragraph(44, run(`${label}: `, true) + run(value), regular);
      continue;
    }
    for (const e of entries) {
      body += row(e.organization, e.location, true);
      body += row(e.title, dateRange(e, r.language), key !== 'education');
      const lines = bullets(e.description);
      for (const line of lines)
        body += paragraph(
          key === 'education' ? 11 : 24,
          run(line),
          key === 'education'
            ? regular
            : '<w:spacing w:line="278" w:lineRule="auto" w:after="20"/><w:ind w:left="720" w:hanging="360"/>',
        );
      body += paragraph(0, '', '<w:spacing w:after="140" w:line="20" w:lineRule="exact"/>');
    }
  }
  // The original contains continuous layout-only sections. A flowing resume uses
  // the first section's Letter geometry as a single column for arbitrary lengths.
  const section = source.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/)![0];
  zip.file(
    'word/document.xml',
    source.replace(
      /<w:body>[\s\S]*<\/w:body>/,
      `<w:body><w:p><w:r><w:t>{@body}</w:t></w:r></w:p>${section}</w:body>`,
    ),
  );
  // Source-author metadata is irrelevant to a user's new CV.
  zip.file(
    'docProps/core.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>' +
      xmlText(r.fullName) +
      '</dc:creator><dc:title>Curriculum</dc:title><cp:lastModifiedBy>Wizumee</cp:lastModifiedBy></cp:coreProperties>',
  );
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render({ body });
  // Docxtemplater normalizes XML declaration line endings; retain the untouched part.
  doc.getZip().file('[Content_Types].xml', contentTypes);
  return doc.toBlob();
}
export async function exportDocx(r: Resume) {
  const response = await fetch('/templates/2025-template_bullet.docx');
  if (!response.ok) throw new Error('Template non disponibile');
  return buildDocx(r, await response.arrayBuffer());
}
export async function exportPdf(data: Resume) {
  const r = resumeSchema.parse(data);
  const [{ pdf }, { default: ResumePdf, registerResumeFonts }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./pdf-document'),
  ]);
  registerResumeFonts();
  return pdf(ResumePdf({ resume: r })).toBlob();
}
