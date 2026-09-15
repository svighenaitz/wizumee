'use client';
import { useFieldArray, useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { newEntry, type EntryKey, type Resume } from '@/lib/resume';
import SortableList from './SortableList';
export function Field({
  name,
  label,
  multiline = false,
  placeholder,
  type = 'text',
}: {
  name: FieldPath<Resume>;
  label: string;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const { register, getFieldState, formState } = useFormContext<Resume>();
  const { error } = getFieldState(name, formState);
  const id = `field-${name}`;
  return (
    <div className={`field ${multiline ? 'full-width' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          maxLength={10000}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(name)}
        />
      ) : (
        <input
          id={id}
          type={type}
          maxLength={300}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(name)}
        />
      )}{' '}
      {error && (
        <span role="alert" id={`${id}-error`} className="field-error">
          {error.message}
        </span>
      )}
    </div>
  );
}
function EntryForm({ name, index }: { name: EntryKey; index: number }) {
  const { register } = useFormContext<Resume>();
  const current = useWatch<Resume>({ name: `${name}.${index}.current` });
  return (
    <div className="field-grid">
      <Field
        name={`${name}.${index}.organization`}
        label={
          name === 'education'
            ? 'Istituto / università'
            : name === 'projects'
              ? 'Nome del progetto'
              : 'Organizzazione'
        }
      />
      <Field name={`${name}.${index}.location`} label="Località" />
      <Field
        name={`${name}.${index}.title`}
        label={name === 'education' ? 'Titolo di studio e voto' : 'Ruolo'}
      />
      <div className="dates">
        <Field name={`${name}.${index}.start`} label="Inizio" placeholder="2022-03" />
        {!current && <Field name={`${name}.${index}.end`} label="Fine" placeholder="2025-06" />}
        <label className="checkbox">
          <input type="checkbox" {...register(`${name}.${index}.current`)} />
          In corso
        </label>
      </div>
      <Field
        name={`${name}.${index}.description`}
        label={name === 'education' ? 'Dettagli, tesi e corsi' : 'Risultati e responsabilità'}
        multiline
        placeholder={
          name === 'education'
            ? 'Un dettaglio per riga'
            : 'Un risultato per riga: diventerà un punto elenco'
        }
      />
    </div>
  );
}
export default function EntryFields({ name }: { name: EntryKey }) {
  const { control } = useFormContext<Resume>();
  const { fields, append, remove, move } = useFieldArray({ control, name });
  return (
    <>
      <SortableList
        items={fields.map((f, i) => ({ id: f.id, title: `Voce ${i + 1}` }))}
        move={move}
        remove={remove}
      >
        {(i) => <EntryForm name={name} index={i} />}
      </SortableList>
      <button
        type="button"
        className="add-button"
        disabled={fields.length >= 50}
        onClick={() => append(newEntry())}
      >
        <Plus size={17} /> Aggiungi{' '}
        {name === 'education'
          ? 'formazione'
          : name === 'experience'
            ? 'esperienza'
            : name === 'projects'
              ? 'progetto'
              : 'attività'}
      </button>
    </>
  );
}
