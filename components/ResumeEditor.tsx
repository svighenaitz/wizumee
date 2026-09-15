'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Download,
  FileText,
  LoaderCircle,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  demoResume,
  emptyResume,
  fileName,
  labels,
  parseDraft,
  resumeSchema,
  STORAGE_KEY,
  type Resume,
  type SectionKey,
} from '@/lib/resume';
import EntryFields, { Field } from './EntryFields';
import ResumePreview from './ResumePreview';
import SortableList from './SortableList';
import ConfirmDialog from './ConfirmDialog';

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export default function ResumeEditor() {
  const [notice, setNotice] = useState('');
  const canSave = useRef(true);
  const methods = useForm<Resume>({
    defaultValues: async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseDraft(stored) : structuredClone(demoResume);
      } catch {
        canSave.current = false;
        setNotice(
          'La bozza salvata non è leggibile. Esporta un backup e crea una nuova bozza per riattivare il salvataggio.',
        );
        return structuredClone(demoResume);
      }
    },
    resolver: zodResolver(resumeSchema),
    mode: 'onBlur',
  });
  const { control, reset, getValues, setValue, handleSubmit } = methods;
  const ready = !methods.formState.isLoading;
  const watched = useWatch({ control }) as Resume;
  const resume = ready ? watched : demoResume;
  const skills = useFieldArray({ control, name: 'skills' });
  const [saveStatus, setSaveStatus] = useState('Caricamento…');
  const [busy, setBusy] = useState<'pdf' | 'docx' | null>(null);
  const [skill, setSkill] = useState('');
  const [active, setActive] = useState<SectionKey | 'personal'>('personal');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [confirm, setConfirm] = useState<'empty' | 'demo' | null>(null);
  const [undo, setUndo] = useState<Resume | null>(null);
  const [theme, setTheme] = useState<'studio' | 'classic'>(() => {
    if (typeof window === 'undefined') return 'classic';
    const stored = window.localStorage.getItem('wizumee.theme');
    return stored === 'studio' ? 'studio' : 'classic';
  });
  const fileInput = useRef<HTMLInputElement>(null);
  function changeTheme(next: 'studio' | 'classic') {
    setTheme(next);
    localStorage.setItem('wizumee.theme', next);
  }
  useEffect(() => {
    if (!ready) return;
    if (!canSave.current) {
      setSaveStatus('Salvataggio sospeso');
      return;
    }
    setSaveStatus('Salvataggio…');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
        setSaveStatus('Salvato sul dispositivo');
      } catch {
        setSaveStatus('Salvataggio non disponibile');
        setNotice(
          'Il browser non consente il salvataggio. Scarica un backup JSON per conservare il lavoro.',
        );
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [resume, ready]);
  useEffect(() => {
    const flush = () => {
      if (ready && canSave.current) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
        } catch {
          /* Status is reported by the autosave effect. */
        }
      }
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [getValues, ready]);
  async function exportResume(format: 'pdf' | 'docx') {
    if (busy) return;
    await handleSubmit(
      async (data) => {
        setBusy(format);
        setNotice('');
        try {
          const { exportDocx, exportPdf } = await import('@/lib/export');
          const blob = await (format === 'pdf' ? exportPdf(data) : exportDocx(data));
          saveBlob(blob, fileName(data, format));
          setNotice(`${format.toUpperCase()} scaricato.`);
        } catch (error) {
          console.error(error);
          setNotice(
            'Esportazione non riuscita. I tuoi dati sono al sicuro: riprova o scarica un backup JSON.',
          );
        } finally {
          setBusy(null);
        }
      },
      (errors) => {
        const first = Object.keys(errors)[0];
        setActive(
          first && ['education', 'experience', 'projects', 'activities', 'skills'].includes(first)
            ? (first as SectionKey)
            : 'personal',
        );
        setMobileView('editor');
        setNotice('Controlla i campi evidenziati prima di esportare.');
      },
    )(undefined);
  }
  function changeDocument(value: Resume) {
    setUndo(structuredClone(getValues()));
    reset(structuredClone(value));
    canSave.current = true;
    setNotice('Bozza aggiornata. Puoi annullare questa operazione.');
    setConfirm(null);
  }
  function addSkill() {
    const name = skill.trim();
    if (!name) return;
    if (name.length > 300 || skills.fields.length >= 100) {
      setNotice('Limite competenze raggiunto (100 voci, 300 caratteri per voce).');
      return;
    }
    if (getValues('skills').some((s) => s.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setNotice('Questa competenza è già presente.');
      return;
    }
    skills.append({ id: crypto.randomUUID(), name });
    setSkill('');
  }
  function moveSection(index: number, direction: number) {
    const order = [...getValues('sectionOrder')];
    const [key] = order.splice(index, 1);
    order.splice(index + direction, 0, key);
    setValue('sectionOrder', order, { shouldDirty: true });
  }
  async function importBackup(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10_000_000) throw new Error('File troppo grande');
      const data = parseDraft(await file.text());
      changeDocument(data);
      setNotice('Backup importato. Puoi annullare per ripristinare la bozza precedente.');
    } catch {
      setNotice('File non valido. Scegli un backup JSON di Wizumee (massimo 10 MB).');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }
  return (
    <FormProvider {...methods}>
      <div className={`app-shell theme-${theme}`}>
        <header className="app-header">
          <Link href="/" className="brand" aria-label="Wizumee, pagina iniziale">
            <span className="brand-mark">
              w<span>✦</span>
            </span>
            wizumee<span className="brand-dot">.</span>
          </Link>
          <span className="header-caption">IL TUO PROSSIMO PASSO</span>
          <div className="theme-switch" role="group" aria-label="Tema grafico">
            <button
              type="button"
              className={theme === 'classic' ? 'active' : ''}
              aria-pressed={theme === 'classic'}
              onClick={() => changeTheme('classic')}
            >
              Classic
            </button>
            <button
              type="button"
              className={theme === 'studio' ? 'active' : ''}
              aria-pressed={theme === 'studio'}
              onClick={() => changeTheme('studio')}
            >
              Studio
            </button>
          </div>
          <div className="save-state" role="status">
            <span className="status-dot" />
            {saveStatus}
          </div>
        </header>
        <main className="workspace">
          <div className="page-heading">
            <div>
              <div className="eyebrow">POCHE PAROLE. GRANDI POSSIBILITÀ.</div>
              <h1>
                La tua storia, <em>ben raccontata.</em>
              </h1>
              <p>Un curriculum essenziale, pronto per la tua prossima opportunità.</p>
            </div>
            <span className="template-badge">
              <FileText size={16} /> Modello Bullet · Word & PDF
            </span>
          </div>
          <div className="mobile-tabs">
            <button onClick={() => setMobileView('editor')} aria-pressed={mobileView === 'editor'}>
              Modifica
            </button>
            <button
              onClick={() => setMobileView('preview')}
              aria-pressed={mobileView === 'preview'}
            >
              Anteprima
            </button>
          </div>
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              {undo && (
                <button
                  type="button"
                  onClick={() => {
                    reset(undo);
                    setUndo(null);
                    setNotice('Operazione annullata.');
                  }}
                >
                  Annulla
                </button>
              )}
              <button
                className="icon-button"
                aria-label="Chiudi messaggio"
                onClick={() => setNotice('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="builder-grid">
            <div className={`editor-panel ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}>
              <div className="panel-top">
                <div>
                  <span className="step-number">01</span>
                  <h2>I tuoi contenuti</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setConfirm('empty')}
                  disabled={!ready}
                >
                  <RotateCcw size={14} /> Nuovo CV
                </button>
              </div>
              <form onSubmit={(e) => e.preventDefault()} noValidate>
                <section className={`editor-section ${active === 'personal' ? 'is-open' : ''}`}>
                  <button
                    className="section-toggle"
                    type="button"
                    aria-expanded={active === 'personal'}
                    onClick={() => setActive('personal')}
                  >
                    <span className="section-index">A</span>
                    <strong>Informazioni personali</strong>
                    <ChevronDown size={18} />
                  </button>
                  {active === 'personal' && (
                    <div className="section-content">
                      <div className="field-grid">
                        <Field name="fullName" label="Nome e cognome *" />
                        <Field name="role" label="Ruolo desiderato" />
                        <Field name="email" label="Email" type="email" />
                        <Field name="phone" label="Telefono" type="tel" />
                        <Field name="address" label="Località / indirizzo" />
                        <Field
                          name="linkedin"
                          label="LinkedIn"
                          placeholder="https://linkedin.com/in/…"
                        />
                        <Field name="website" label="Sito web / GitHub" placeholder="https://…" />
                        <div className="field">
                          <label htmlFor="language">Lingua del curriculum</label>
                          <select id="language" {...methods.register('language')}>
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        <Field
                          name="summary"
                          label="Profilo (facoltativo)"
                          multiline
                          placeholder="Una breve introduzione, se utile per la candidatura"
                        />
                      </div>
                    </div>
                  )}
                </section>
                {resume.sectionOrder.map((key, index) => (
                  <section
                    key={key}
                    className={`editor-section ${active === key ? 'is-open' : ''}`}
                  >
                    <div className="section-heading">
                      <button
                        className="section-toggle"
                        type="button"
                        aria-expanded={active === key}
                        onClick={() => setActive(key)}
                      >
                        <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
                        <strong>{labels[key]}</strong>
                        <span className="count">
                          {key === 'skills' ? resume.skills.length : resume[key].length}
                        </span>
                        <ChevronDown size={18} />
                      </button>
                      <div className="section-order">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Sposta su sezione ${labels[key]}`}
                          disabled={index === 0}
                          onClick={() => moveSection(index, -1)}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Sposta giù sezione ${labels[key]}`}
                          disabled={index === 4}
                          onClick={() => moveSection(index, 1)}
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                    {active === key && (
                      <div className="section-content">
                        {key === 'skills' ? (
                          <>
                            <div className="skill-add">
                              <div className="field">
                                <label htmlFor="new-skill">Competenza tecnica</label>
                                <input
                                  id="new-skill"
                                  maxLength={300}
                                  value={skill}
                                  onChange={(e) => setSkill(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addSkill();
                                    }
                                  }}
                                  placeholder="Es. React, Figma, analisi dati"
                                />
                              </div>
                              <button
                                type="button"
                                className="button button-dark"
                                aria-label="Aggiungi competenza"
                                onClick={addSkill}
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            <SortableList
                              items={skills.fields.map((f) => ({ id: f.id, title: f.name }))}
                              move={skills.move}
                              remove={skills.remove}
                            >
                              {() => null}
                            </SortableList>
                            <Field name="languages" label="Lingue e livello" />
                            <Field
                              name="laboratory"
                              label="Competenze di laboratorio (facoltativo)"
                            />
                            <Field name="interests" label="Interessi (facoltativo)" />
                          </>
                        ) : (
                          <>
                            <p className="section-help">
                              Aggiungi le voci e trascinale dalla maniglia per riordinarle. Date:
                              AAAA oppure AAAA-MM.
                            </p>
                            <EntryFields name={key} />
                          </>
                        )}
                      </div>
                    )}
                  </section>
                ))}
              </form>
              <div className="draft-tools">
                <p>I tuoi dati restano in questo browser.</p>
                <div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      saveBlob(
                        new Blob([JSON.stringify(getValues(), null, 2)], {
                          type: 'application/json',
                        }),
                        fileName(getValues(), 'json'),
                      )
                    }
                  >
                    <Download size={14} /> Backup JSON
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => fileInput.current?.click()}
                  >
                    <Upload size={14} /> Importa backup
                  </button>
                  <button type="button" className="text-button" onClick={() => setConfirm('demo')}>
                    <Sparkles size={14} /> Carica esempio
                  </button>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={(e) => void importBackup(e.target.files?.[0])}
                />
              </div>
            </div>
            <aside className={`preview-panel ${mobileView === 'editor' ? 'mobile-hidden' : ''}`}>
              <div className="panel-top">
                <div>
                  <span className="step-number">02</span>
                  <h2>La tua anteprima</h2>
                </div>
                <span className="live-label">
                  <span /> LIVE
                </span>
              </div>
              <div className="preview-surface">
                <ResumePreview resume={resume} />
              </div>
              <div className="export-panel">
                <div>
                  <h3>Pronto per il prossimo passo?</h3>
                  <p>PDF da inviare. Word da modificare.</p>
                </div>
                <div className="export-buttons">
                  <button
                    type="button"
                    className="button button-light"
                    disabled={!ready || !!busy}
                    onClick={() => void exportResume('docx')}
                  >
                    {busy === 'docx' ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <FileText size={17} />
                    )}{' '}
                    Scarica Word
                  </button>
                  <button
                    type="button"
                    className="button button-dark"
                    disabled={!ready || !!busy}
                    onClick={() => void exportResume('pdf')}
                  >
                    {busy === 'pdf' ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <Download size={17} />
                    )}{' '}
                    Scarica PDF
                  </button>
                </div>
                <p className="export-note">
                  <Check size={13} /> Testo selezionabile · Sezioni vuote escluse · Più pagine
                  automatiche
                </p>
              </div>
              <p className="preview-caption">
                Modello originale in formato Letter. L’anteprima mostra i contenuti; le interruzioni
                di pagina vengono applicate nell’esportazione.
              </p>
            </aside>
          </div>
          <footer className="app-footer">
            <span>Fatto per mettere in luce ciò che sai fare.</span>
            <span>WIZUMEE · RESUME STUDIO</span>
          </footer>
        </main>
        {confirm && (
          <ConfirmDialog
            kind={confirm}
            cancel={() => setConfirm(null)}
            confirm={() => changeDocument(confirm === 'empty' ? emptyResume : demoResume)}
          />
        )}
      </div>
    </FormProvider>
  );
}
