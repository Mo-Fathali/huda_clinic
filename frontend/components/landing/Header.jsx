'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAdminLoggedIn } from '@/lib/auth';

export default function Header({ profile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    setShowAdminLink(isAdminLoggedIn());
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt={profile.name} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-soft" />
          )}
          <span className="font-semibold text-ink">
            {profile?.name || 'العيادة'}
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-ink">
          <a href="#services" className="hover:text-rose transition">الخدمات</a>
          <a href="#about" className="hover:text-rose transition">عن الدكتورة</a>
          <a href="#footer" className="hover:text-rose transition">تواصل معنا</a>
          <Link href="/my-appointments" className="hover:text-rose transition">مواعيدي</Link>
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/booking"
            className="bg-rose text-white text-sm px-5 py-2 rounded-lg hover:opacity-90 transition"
          >
            احجزي الآن
          </Link>

          {showAdminLink && (
            <Link
              href="/admin"
              aria-label="دخول لوحة التحكم"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-rose hover:bg-soft transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden text-ink"
          aria-label="القائمة"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 px-6 py-4 space-y-3 text-sm bg-white">
          <a href="#footer" onClick={() => setMenuOpen(false)} className="block text-ink hover:text-rose">
            تواصل معنا
          </a>
          <Link
            href="/my-appointments"
            onClick={() => setMenuOpen(false)}
            className="block text-ink hover:text-rose"
          >
            مواعيدي
          </Link>
          {showAdminLink && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-rose"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span className="text-xs">دخول الإدارة</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}