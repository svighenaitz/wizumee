# Wizumee

Un editor di curriculum con anteprima dal vivo ed esportazione Word e PDF basata sul modello `2025-template_bullet.docx`.

## Avvio

Node.js 24 LTS consigliato (minimo 22.13), npm.

```sh
npm ci
npm run dev
```

Apri http://localhost:3002. Per la versione di produzione:

```sh
npm run build
npm start
```

Non servono account, database, API key, Python o LibreOffice. L'app e gli script del repository sono TypeScript/JavaScript. I documenti vengono generati nel browser.

## Funzionalità

- Dati personali, profilo facoltativo, formazione, esperienze, progetti, attività, competenze e interessi.
- Aggiunta, eliminazione e riordino delle voci; maniglie di trascinamento separate dagli input e pulsanti accessibili per spostarle.
- Ordine personalizzabile delle sezioni. Le sezioni vuote non vengono esportate.
- Titoli del CV in italiano o inglese, date annuali o mensili e posizioni in corso.
- Salvataggio automatico locale, backup JSON e importazione con verifica del formato. Nuova bozza e caricamento esempio con annullamento.
- Layout adattabile a telefono e desktop.
- DOCX modificabile e PDF con testo selezionabile, font incorporato e paginazione automatica.

La prima apertura mostra dati dimostrativi. Usa **Nuovo CV** per partire da zero. Il salvataggio è legato al browser e al dispositivo: scarica un backup JSON per trasferire la bozza o conservarla prima di cancellare i dati del browser. Non c'è sincronizzazione cloud.

## Stack

Next.js 16.3.5, React 19.3, TypeScript 6, React Hook Form, Zod 4, dnd-kit, React PDF 4 e Docxtemplater. CSS nativo per l'interfaccia; nessun framework CSS legacy o servizio esterno per le conversioni. ESLint 10 con plugin TypeScript, React Hooks e Next.

Le versioni sono fissate nel manifest e nel lockfile. Next 16.3.5 include le correzioni della [release di sicurezza di agosto 2026](https://nextjs.org/blog/august-2026-security-release). L'audit del 15 settembre 2026 non rileva vulnerabilità note; va ripetuto nel tempo. Dependabot e la CI sono configurati per seguire gli aggiornamenti.

## Modello ed esportazioni

Il riferimento originale è conservato in `public/templates/2025-template_bullet.docx`. Il DOCX riusa il pacchetto originale, stili, numerazione e linea dell'intestazione; sostituisce i contenuti e normalizza le interruzioni di sezione per supportare un numero variabile di voci. Il PDF riproduce questo disegno con componenti React PDF.

Formato Letter (come il riferimento), corpo 11 pt, intestazioni centrate e punti elenco. Il PDF incorpora Carlito, alternativa libera metricamente compatibile con Calibri. Word usa Calibri e il font disponibile sul dispositivo: i due motori possono distribuire diversamente i cambi pagina. L'anteprima HTML mostra i contenuti e non simula i cambi pagina.

Dettagli e scelte di adattamento: [contratto del modello](docs/template.md).

## Verifica

```sh
npm run check         # lint, TypeScript, unit test, build di produzione
npm run test:e2e      # browser: editor, salvataggio, import, export, mobile, tastiera
npm run qa:exports    # genera CV brevi e lunghi in qa/ con Node
npm audit
```

Per i test browser, Chrome installato in locale oppure `npx playwright install chromium` e `CI=1 npm run test:e2e`. La CI installa Chromium automaticamente. Gli output di prova e le schermate in `qa/` sono esclusi da Git. Non inserire dati personali nei fixture.

## Struttura

- `components/ResumeEditor.tsx`: editor, bozza e download.
- `components/EntryFields.tsx`: campi ripetibili con `useFieldArray`.
- `lib/resume.ts`: modello dati, validazione e formattazione condivisa.
- `lib/export.tsx`: esportazione DOCX dal riferimento e caricamento differito del PDF.
- `lib/pdf-document.tsx`: documento React PDF.
- `tests/`: test dei dati, del pacchetto DOCX e dei flussi browser.
