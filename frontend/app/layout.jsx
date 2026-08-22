import { Alexandria, Montserrat } from 'next/font/google';
import './globals.css';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';

const alexandria = Alexandria({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-english',
});

export const metadata = {
  title: 'عيادة د. هدى الفتحلي',
  description: 'حجز مواعيد أونلاين',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${alexandria.variable} ${montserrat.variable}`}>
     <body className="pattern-bg text-ink font-arabic">
  {children}
  <FloatingWhatsApp />
</body>
    </html>
  );
}