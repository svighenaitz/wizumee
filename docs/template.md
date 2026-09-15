# Contratto del modello Bullet

## Riferimento

`public/templates/2025-template_bullet.docx` è una copia immutata del file fornito in Downloads. Hash e inventario dei componenti in `template-inventory.json`. Il riferimento è stato renderizzato integralmente: una pagina Letter, con intestazione, formazione, esperienze, leadership e competenze.

## Sistema visivo

- Pagina: Letter, 612 × 792 pt; prima sezione con margine superiore 36 pt, laterali 30,25 pt e inferiore 13,7 pt.
- Font: Calibri, corpo 11 pt, nero; il PDF incorpora Carlito con licenza OFL.
- Nome e titoli: centrati, grassetto, 11 pt. Linea nera originale sotto il nome.
- Organizzazione in grassetto a sinistra; località allineata a destra. Ruolo a sinistra, intervallo date a destra.
- Dettagli di formazione in paragrafi; risultati di esperienze e attività in elenchi reali.
- Competenze in righe con etichetta in grassetto.
- Nessuna immagine del candidato, tabella dati, intestazione o piè di pagina visibile.

## Slot e locatori

I locatori sono indici zero-based dei paragrafi del corpo in `word/document.xml`, utilizzati da `lib/export.tsx`.

| Indice | Ruolo             | Contenuti dinamici                                      |
| ------ | ----------------- | ------------------------------------------------------- |
| 1      | Nome              | Nome completo; ruolo facoltativo con stile del contatto |
| 4      | Linea vettoriale  | Preservata                                              |
| 6      | Contatti centrati | Indirizzo, email, telefono, URL                         |
| 8      | Titolo sezione    | Lingua e ordine scelti nell'editor                      |
| 9      | Organizzazione    | Nome e località, ripetibili                             |
| 11     | Corpo formazione  | Titolo, voto, tesi, corsi e profilo facoltativo         |
| 24     | Punto elenco      | Una riga non vuota per risultato                        |
| 44     | Competenze        | Etichetta e valore; righe vuote escluse                 |
| 0      | Spazio tra voci   | Spaziatura compatta                                     |

I campi facoltativi assenti vengono omessi; il testo istruttivo del riferimento non entra negli export. I progetti riutilizzano lo schema delle esperienze. Il numero di voci è variabile; non si riduce automaticamente il font per comprimere il curriculum su una pagina.

## Adattamenti per un editor dinamico

Il riferimento contiene quattro sezioni continue, una delle quali con tre colonne tecniche. Queste interruzioni servono al contenuto statico: gli export usano una sola sezione fluida con la geometria della prima, evitando colonne residue quando le voci vengono aggiunte o eliminate. Le tabulazioni fisse e le compressioni locali dei caratteri vengono normalizzate in tabulazioni allineate a destra. Le intestazioni sono mantenute con il contenuto seguente; la bozza PDF raggruppa il titolo della voce con il primo punto quando la sua lunghezza lo consente.

Questi adattamenti mantengono il disegno del riferimento e permettono CV di più pagine. I motori Word e React PDF non garantiscono identiche interruzioni di riga e pagina. Le forme dei glifi possono differire leggermente tra Calibri e Carlito.

## Conservazione e verifica

Sono modificabili solo il corpo del documento e i metadati autore/titolo del nuovo CV. Il pacchetto originale conserva stili, numerazione, font table, relazioni e componenti non usati. Nessun testo dell'utente viene interpretato come OOXML: viene prima escapato; il corpo strutturale viene inserito tramite il modulo raw XML di Docxtemplater.

I test controllano XML valido, escaping, ordine delle sezioni, assenza del contenuto di esempio e conservazione di stili e numerazione. `npm run qa:exports` genera documenti dimostrativi brevi e lunghi per ispezione visiva. In questa sessione i DOCX sono stati renderizzati con LibreOffice e tutti i PDF controllati come immagini; gli strumenti di rendering esterni sono esclusivamente per QA e non sono dipendenze dell'app.
