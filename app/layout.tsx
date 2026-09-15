import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Wizumee — il tuo prossimo passo',
  description: 'Crea il tuo curriculum e scaricalo in PDF o Word. I tuoi dati restano nel browser.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
