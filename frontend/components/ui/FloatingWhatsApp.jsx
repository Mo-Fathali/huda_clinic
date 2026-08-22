'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [whatsapp, setWhatsapp] = useState(null);

  useEffect(() => {
    api
      .get('/api/profile')
      .then((data) => setWhatsapp(data?.whatsapp || null))
      .catch(() => {});
  }, []);

  // نخفيها في لوحة التحكم — مش محتاجة تواصل واتساب هناك
  if (pathname?.startsWith('/admin')) return null;
  if (!whatsapp) return null;

  const cleanNumber = whatsapp.replace(/[^0-9]/g, '');
  const href = `https://wa.me/${cleanNumber}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن موعد')}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصلي معنا عبر واتساب"
      className="fixed bottom-6 left-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:scale-105 transition-transform">
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.386.7 4.61 1.91 6.48L4 29l7.72-1.87A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.8a9.75 9.75 0 0 1-4.97-1.36l-.356-.21-4.583 1.11 1.223-4.47-.232-.366A9.74 9.74 0 0 1 6.2 15c0-5.407 4.397-9.8 9.804-9.8 5.406 0 9.8 4.393 9.8 9.8 0 5.407-4.394 9.8-9.8 9.8zm5.373-7.34c-.294-.147-1.74-.858-2.01-.956-.27-.098-.467-.147-.664.147-.196.294-.76.956-.933 1.152-.172.196-.343.22-.637.073-.294-.147-1.24-.457-2.362-1.457-.873-.779-1.463-1.741-1.635-2.035-.172-.294-.018-.453.129-.6.133-.132.294-.343.44-.514.147-.172.196-.294.294-.49.098-.196.049-.368-.024-.514-.073-.147-.664-1.6-.91-2.19-.24-.575-.484-.497-.664-.506l-.566-.01c-.196 0-.514.073-.783.368-.27.294-1.03 1.006-1.03 2.454 0 1.447 1.054 2.846 1.2 3.043.147.196 2.075 3.168 5.028 4.442.703.303 1.25.484 1.677.62.705.224 1.346.192 1.853.117.565-.084 1.74-.712 1.985-1.4.245-.688.245-1.278.172-1.4-.073-.123-.27-.196-.564-.343z" />
        </svg>
      </span>
    </a>
  );
}