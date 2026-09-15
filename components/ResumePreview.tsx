import {
  bullets,
  dateRange,
  englishLabels,
  hasEntry,
  labels,
  skillRows,
  type Resume,
} from '@/lib/resume';
export default function ResumePreview({ resume: r }: { resume: Resume }) {
  const headings = r.language === 'it' ? labels : englishLabels;
  return (
    <article className="resume-paper" aria-label="Anteprima curriculum">
      <header className="resume-header">
        <h1>{r.fullName || 'Nome e cognome'}</h1>
        {r.role && <p>{r.role}</p>}
        <div className="resume-rule" />
        <p>{[r.address, r.email, r.phone].filter(Boolean).join(' • ')}</p>
        <p>{[r.linkedin, r.website].filter(Boolean).join(' • ')}</p>
      </header>
      {r.summary && <p className="resume-summary">{r.summary}</p>}
      {r.sectionOrder.map((key) => {
        if (key === 'skills') {
          const rows = skillRows(r);
          return rows.length ? (
            <section key={key}>
              <h2>{headings[key]}</h2>
              {rows.map(([label, value]) => (
                <p key={label}>
                  <strong>{label}: </strong>
                  {value}
                </p>
              ))}
            </section>
          ) : null;
        }
        const entries = r[key].filter(hasEntry);
        if (!entries.length) return null;
        return (
          <section key={key}>
            <h2>{headings[key]}</h2>
            {entries.map((e) => (
              <div className="resume-entry" key={e.id}>
                <div className="resume-row">
                  <strong>{e.organization}</strong>
                  <span>{e.location}</span>
                </div>
                <div className="resume-row">
                  <span>{e.title}</span>
                  <span>{dateRange(e, r.language)}</span>
                </div>
                {key === 'education' ? (
                  bullets(e.description).map((b, i) => <p key={i}>{b}</p>)
                ) : (
                  <ul>
                    {bullets(e.description).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        );
      })}
    </article>
  );
}
