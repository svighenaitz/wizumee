import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import PizZip from 'pizzip';

test('edits, persists, reorders and removes entries without losing values', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  await page.getByLabel('Nome e cognome *').fill('Giulia Test');
  await expect(page.getByRole('article', { name: 'Anteprima curriculum' })).toContainText(
    'Giulia Test',
  );
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome e cognome *')).toHaveValue('Giulia Test');
  await page.getByRole('button', { name: /02 Esperienze/ }).click();
  await page.getByLabel('Organizzazione', { exact: true }).first().fill('Azienda modificata');
  await page.getByRole('button', { name: 'Sposta giù Voce 1', exact: true }).click();
  await expect(page.getByLabel('Organizzazione', { exact: true }).nth(1)).toHaveValue(
    'Azienda modificata',
  );
  await page.getByRole('button', { name: 'Elimina Voce 1', exact: true }).click();
  await expect(page.getByLabel('Organizzazione', { exact: true }).first()).toHaveValue(
    'Azienda modificata',
  );
  await page.getByRole('button', { name: 'Aggiungi esperienza', exact: true }).click();
  await expect(page.getByLabel('Organizzazione', { exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: /05 Competenze e interessi/ }).click();
  await page.getByLabel('Competenza tecnica', { exact: true }).fill('React');
  await page.getByRole('button', { name: 'Aggiungi competenza', exact: true }).click();
  await expect(page.getByRole('article')).toContainText('React');
  await page.getByRole('button', { name: 'Elimina React', exact: true }).click();
  await expect(page.getByRole('article')).not.toContainText('React');
  expect(errors).toEqual([]);
});
test('validates and downloads real PDF and DOCX documents', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('invalid-email');
  await page.getByRole('button', { name: 'Scarica PDF', exact: true }).click();
  await expect(page.getByText('Indirizzo email non valido', { exact: true })).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('giulia@example.com');
  const docxPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Scarica Word', exact: true }).click();
  const docx = await docxPromise;
  await docx.saveAs('qa/browser.docx');
  const zip = new PizZip(await readFile('qa/browser.docx'));
  expect(zip.file('word/document.xml')!.asText()).toContain('giulia@example.com');
  const pdfPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Scarica PDF', exact: true }).click();
  const pdf = await pdfPromise;
  await pdf.saveAs('qa/browser.pdf');
  expect((await readFile('qa/browser.pdf')).subarray(0, 5).toString()).toBe('%PDF-');
  expect(errors).toEqual([]);
});
test('imports backups, survives invalid uploads and can undo a reset', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Backup JSON', exact: true }).click();
  const backup = await downloadPromise;
  await backup.saveAs('qa/backup.json');
  await page.getByRole('button', { name: 'Nuovo CV', exact: true }).click();
  await page.getByRole('button', { name: 'Continua', exact: true }).click();
  await expect(page.getByLabel('Nome e cognome *')).toHaveValue('');
  await page.getByRole('button', { name: 'Annulla', exact: true }).click();
  await expect(page.getByLabel('Nome e cognome *')).toHaveValue('Alex Morgan');
  await page.locator('input[type=file]').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  });
  await expect(page.getByText(/File non valido/)).toBeVisible();
  await expect(page.getByLabel('Nome e cognome *')).toHaveValue('Alex Morgan');
  await page.locator('input[type=file]').setInputFiles('qa/backup.json');
  await expect(page.getByText(/Backup importato/)).toBeVisible();
});
test('mobile layout is usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  await expect(page.getByLabel('Nome e cognome *')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Anteprima', exact: true }).click();
  await expect(page.getByRole('article')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Scarica PDF', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'qa/mobile.png', fullPage: true });
});
test('desktop preview and keyboard reordering work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  await page.screenshot({ path: 'qa/desktop.png', fullPage: true });
  await page.getByRole('button', { name: /02 Esperienze/ }).click();
  const handle = page.getByRole('button', { name: 'Trascina Voce 1', exact: true });
  await handle.scrollIntoViewIfNeeded();
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  const target = await page.locator('.entry-card').nth(1).getAttribute('data-sortable-id');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[id^=DndLiveRegion]').last()).toContainText(
    `over droppable area ${target}.`,
  );

  await page.keyboard.press('Space');
  await expect(page.getByLabel('Organizzazione', { exact: true }).first()).toHaveValue(
    'Orizzonte Digitale',
  );
});

test('preserves an unreadable stored draft and handles unavailable storage', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wizumee.resume.v1', '{broken'));
  await page.goto('/');
  await expect(page.getByText('Salvataggio sospeso')).toBeVisible();
  await page.getByLabel('Nome e cognome *').fill('Bozza recuperabile');
  expect(await page.evaluate(() => localStorage.getItem('wizumee.resume.v1'))).toBe('{broken');
  await page.getByRole('button', { name: 'Nuovo CV', exact: true }).click();
  await page.getByRole('button', { name: 'Continua', exact: true }).click();
  await expect(page.getByText('Salvato sul dispositivo')).toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
  await page.getByLabel('Nome e cognome *').fill('Nuova bozza');
  await expect(page.getByText('Salvataggio non disponibile', { exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toContainText('Nuova bozza');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Backup JSON', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('Nuova-bozza.json');
});
