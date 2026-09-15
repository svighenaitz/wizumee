import React from 'react';
import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  bullets,
  dateRange,
  englishLabels,
  hasEntry,
  labels,
  skillRows,
  type Resume,
} from './resume';
export function registerResumeFonts(base = '') {
  Font.register({
    family: 'Carlito',
    fonts: [
      { src: `${base}/fonts/carlito-regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/carlito-bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}
const s = StyleSheet.create({
  page: {
    fontFamily: 'Carlito',
    fontSize: 11,
    lineHeight: 1.16,
    paddingTop: 36,
    paddingBottom: 14,
    paddingHorizontal: 30.25,
    color: '#000',
  },
  header: { textAlign: 'center', marginBottom: 8 },
  name: { fontWeight: 700, marginBottom: 3 },
  rule: { borderTopWidth: 1, borderTopColor: '#000', marginVertical: 5, marginHorizontal: 6 },
  contact: { textAlign: 'center', marginBottom: 2 },
  link: { color: '#000', textDecoration: 'none' },
  summary: { marginTop: 4, marginBottom: 6 },
  heading: { textAlign: 'center', fontWeight: 700, marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 1 },
  left: { flexGrow: 1, flexShrink: 1 },
  right: { textAlign: 'right', maxWidth: '38%', flexShrink: 0 },
  bold: { fontWeight: 700 },
  entry: { marginBottom: 9, paddingHorizontal: 6 },
  bullet: { flexDirection: 'row', marginLeft: 18, paddingRight: 6, marginTop: 1 },
  marker: { width: 12 },
  bulletText: { flex: 1 },
  skill: { marginBottom: 2, paddingHorizontal: 6 },
});
export default function ResumePdf({ resume: r }: { resume: Resume }) {
  const headings = r.language === 'it' ? labels : englishLabels;
  return (
    <Document
      title={`${r.fullName} — Curriculum`}
      author={r.fullName}
      creator="Wizumee"
      language={r.language}
    >
      <Page size="LETTER" style={s.page} wrap>
        <View style={s.header}>
          <Text style={s.name}>{r.fullName}</Text>
          {r.role && <Text>{r.role}</Text>}
          <View style={s.rule} />
          <Text style={s.contact}>{[r.address, r.email, r.phone].filter(Boolean).join(' • ')}</Text>
          {(r.linkedin || r.website) && (
            <Text style={s.contact}>
              {r.linkedin && (
                <Link style={s.link} src={r.linkedin}>
                  {r.linkedin}
                </Link>
              )}
              {r.linkedin && r.website ? ' • ' : ''}
              {r.website && (
                <Link style={s.link} src={r.website}>
                  {r.website}
                </Link>
              )}
            </Text>
          )}
        </View>
        {r.summary && (
          <Text style={s.summary} orphans={2} widows={2}>
            {r.summary}
          </Text>
        )}
        {r.sectionOrder.map((key) => {
          if (key === 'skills') {
            const rows = skillRows(r);
            return rows.length ? (
              <View key={key}>
                <Text style={s.heading} minPresenceAhead={24}>
                  {headings[key]}
                </Text>
                {rows.map(([label, value]) => (
                  <Text key={label} style={s.skill} orphans={2} widows={2}>
                    <Text style={s.bold}>{label}: </Text>
                    {value}
                  </Text>
                ))}
              </View>
            ) : null;
          }
          const entries = r[key].filter(hasEntry);
          if (!entries.length) return null;
          return (
            <View key={key}>
              <Text style={s.heading} minPresenceAhead={60}>
                {headings[key]}
              </Text>
              {entries.map((e) => {
                const lines = bullets(e.description);
                const renderLine = (line: string, i: number) =>
                  key === 'education' ? (
                    <Text key={i} orphans={2} widows={2}>
                      {line}
                    </Text>
                  ) : (
                    <View key={i} style={s.bullet}>
                      <Text style={s.marker}>•</Text>
                      <Text style={s.bulletText} orphans={2} widows={2}>
                        {line}
                      </Text>
                    </View>
                  );
                const keepFirst = !!lines[0] && lines[0].length < 700;
                return (
                  <View key={e.id} style={s.entry}>
                    <View wrap={false}>
                      <View style={s.row}>
                        <Text style={[s.left, s.bold]}>{e.organization}</Text>
                        <Text style={s.right}>{e.location}</Text>
                      </View>
                      <View style={s.row}>
                        <Text style={key === 'education' ? s.left : [s.left, s.bold]}>
                          {e.title}
                        </Text>
                        <Text style={s.right}>{dateRange(e, r.language)}</Text>
                      </View>
                      {keepFirst && renderLine(lines[0], 0)}
                    </View>
                    {lines.slice(keepFirst ? 1 : 0).map(renderLine)}
                  </View>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
